package services

import (
	"errors"
	"time"
	"yummio-backend/internal/models"
	"yummio-backend/internal/repositories"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type AuthService interface {
	Register(req *models.UserCreateRequest) (*models.LoginResponse, error)
	Login(req *models.LoginRequest) (*models.LoginResponse, error)
	RefreshToken(refreshToken string) (*models.LoginResponse, error)
	ValidateToken(tokenString string) (*models.JWTClaims, error)
	ForgotPassword(email string) error
	ResetPassword(token, newPassword string) error
}

type authService struct {
	userRepo      repositories.UserRepository
	jwtSecret     string
	accessExpiry  time.Duration
	refreshExpiry time.Duration
}

func NewAuthService(userRepo repositories.UserRepository, jwtSecret string, accessExpiry, refreshExpiry time.Duration) AuthService {
	return &authService{
		userRepo:      userRepo,
		jwtSecret:     jwtSecret,
		accessExpiry:  accessExpiry,
		refreshExpiry: refreshExpiry,
	}
}

func (s *authService) Register(req *models.UserCreateRequest) (*models.LoginResponse, error) {
	// Check if user already exists
	exists, err := s.userRepo.Exists(req.Email)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, errors.New("user with this email already exists")
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	// Create user
	user := &models.User{
		Name:         req.Name,
		Email:        req.Email,
		PasswordHash: string(hashedPassword),
	}

	if err := s.userRepo.Create(user); err != nil {
		return nil, err
	}

	// Generate tokens
	return s.generateTokenResponse(user)
}

func (s *authService) Login(req *models.LoginRequest) (*models.LoginResponse, error) {
	// Get user by email
	user, err := s.userRepo.GetByEmail(req.Email)
	if err != nil {
		return nil, errors.New("invalid email or password")
	}

	// Verify password
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		return nil, errors.New("invalid email or password")
	}

	// Generate tokens
	return s.generateTokenResponse(user)
}

func (s *authService) RefreshToken(refreshToken string) (*models.LoginResponse, error) {
	// Validate refresh token
	claims, err := s.ValidateToken(refreshToken)
	if err != nil {
		return nil, errors.New("invalid refresh token")
	}

	if claims.Type != "refresh" {
		return nil, errors.New("invalid token type")
	}

	// Get user
	user, err := s.userRepo.GetByID(claims.UserID)
	if err != nil {
		return nil, errors.New("user not found")
	}

	// Generate new tokens
	return s.generateTokenResponse(user)
}

func (s *authService) ValidateToken(tokenString string) (*models.JWTClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &jwt.MapClaims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(s.jwtSecret), nil
	})

	if err != nil {
		return nil, err
	}

	if !token.Valid {
		return nil, errors.New("invalid token")
	}

	claims, ok := token.Claims.(*jwt.MapClaims)
	if !ok {
		return nil, errors.New("invalid token claims")
	}

	userIDStr, ok := (*claims)["user_id"].(string)
	if !ok {
		return nil, errors.New("invalid user_id in token")
	}

	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		return nil, errors.New("invalid user_id format")
	}

	email, ok := (*claims)["email"].(string)
	if !ok {
		return nil, errors.New("invalid email in token")
	}

	tokenType, ok := (*claims)["type"].(string)
	if !ok {
		return nil, errors.New("invalid type in token")
	}

	return &models.JWTClaims{
		UserID: userID,
		Email:  email,
		Type:   tokenType,
	}, nil
}

func (s *authService) ForgotPassword(email string) error {
	// Check if user exists
	user, err := s.userRepo.GetByEmail(email)
	if err != nil {
		// Don't reveal if email exists or not
		return nil
	}

	// Generate reset token (in production, store this in database with expiry)
	resetToken, err := s.generateToken(user.ID, user.Email, "reset", time.Hour)
	if err != nil {
		return err
	}

	// TODO: Send email with reset token
	// For now, just log it (in production, use proper email service)
	// log.Printf("Password reset token for %s: %s", email, resetToken)

	return nil
}

func (s *authService) ResetPassword(token, newPassword string) error {
	// Validate reset token
	claims, err := s.ValidateToken(token)
	if err != nil {
		return errors.New("invalid or expired reset token")
	}

	if claims.Type != "reset" {
		return errors.New("invalid token type")
	}

	// Get user
	user, err := s.userRepo.GetByID(claims.UserID)
	if err != nil {
		return errors.New("user not found")
	}

	// Hash new password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	// Update password
	user.PasswordHash = string(hashedPassword)
	return s.userRepo.Update(user)
}

func (s *authService) generateTokenResponse(user *models.User) (*models.LoginResponse, error) {
	// Generate access token
	accessToken, err := s.generateToken(user.ID, user.Email, "access", s.accessExpiry)
	if err != nil {
		return nil, err
	}

	// Generate refresh token
	refreshToken, err := s.generateToken(user.ID, user.Email, "refresh", s.refreshExpiry)
	if err != nil {
		return nil, err
	}

	return &models.LoginResponse{
		User:         user.ToResponse(),
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresIn:    int64(s.accessExpiry.Seconds()),
	}, nil
}

func (s *authService) generateToken(userID uuid.UUID, email, tokenType string, expiry time.Duration) (string, error) {
	claims := jwt.MapClaims{
		"user_id": userID.String(),
		"email":   email,
		"type":    tokenType,
		"exp":     time.Now().Add(expiry).Unix(),
		"iat":     time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.jwtSecret))
}