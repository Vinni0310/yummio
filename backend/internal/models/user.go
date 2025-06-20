package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type User struct {
	ID           uuid.UUID      `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	Name         string         `json:"name" gorm:"not null" validate:"required,min=2,max=100"`
	Email        string         `json:"email" gorm:"uniqueIndex;not null" validate:"required,email"`
	PasswordHash string         `json:"-" gorm:"not null"`
	AvatarURL    *string        `json:"avatar_url,omitempty"`
	IsVerified   bool           `json:"is_verified" gorm:"default:false"`
	IsAdmin      bool           `json:"is_admin" gorm:"default:false"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `json:"-" gorm:"index"`

	// Relationships
	Recipes       []Recipe       `json:"recipes,omitempty" gorm:"foreignKey:UserID"`
	Collections   []Collection   `json:"collections,omitempty" gorm:"foreignKey:UserID"`
	ShoppingLists []ShoppingList `json:"shopping_lists,omitempty" gorm:"foreignKey:UserID"`
	Favorites     []Recipe       `json:"favorites,omitempty" gorm:"many2many:user_favorites;"`
	Ratings       []Rating       `json:"ratings,omitempty" gorm:"foreignKey:UserID"`
}

type UserCreateRequest struct {
	Name     string `json:"name" validate:"required,min=2,max=100"`
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=6,max=100"`
}

type UserUpdateRequest struct {
	Name      *string `json:"name,omitempty" validate:"omitempty,min=2,max=100"`
	AvatarURL *string `json:"avatar_url,omitempty"`
}

type UserResponse struct {
	ID        uuid.UUID `json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	AvatarURL *string   `json:"avatar_url,omitempty"`
	CreatedAt time.Time `json:"created_at"`
}

type ChangePasswordRequest struct {
	CurrentPassword string `json:"current_password" validate:"required"`
	NewPassword     string `json:"new_password" validate:"required,min=6,max=100"`
}

func (u *User) ToResponse() UserResponse {
	return UserResponse{
		ID:        u.ID,
		Name:      u.Name,
		Email:     u.Email,
		AvatarURL: u.AvatarURL,
		CreatedAt: u.CreatedAt,
	}
}

func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}
	return nil
}