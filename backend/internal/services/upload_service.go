package services

import (
	"bytes"
	"fmt"
	"mime/multipart"
	"path/filepath"
	"strings"
	"time"
	"yummio-backend/internal/config"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/google/uuid"
)

type UploadService interface {
	UploadImage(file multipart.File, header *multipart.FileHeader) (string, error)
}

type uploadService struct {
	s3Client *s3.S3
	bucket   string
	config   *config.Config
}

func NewUploadService(cfg *config.Config) UploadService {
	// Create AWS session
	sess, err := session.NewSession(&aws.Config{
		Region: aws.String(cfg.AWS.Region),
		Credentials: credentials.NewStaticCredentials(
			cfg.AWS.AccessKeyID,
			cfg.AWS.SecretAccessKey,
			"",
		),
	})
	if err != nil {
		// Return a mock service if AWS is not configured
		return &mockUploadService{}
	}

	return &uploadService{
		s3Client: s3.New(sess),
		bucket:   cfg.AWS.S3Bucket,
		config:   cfg,
	}
}

func (s *uploadService) UploadImage(file multipart.File, header *multipart.FileHeader) (string, error) {
	// Validate file type
	ext := strings.ToLower(filepath.Ext(header.Filename))
	ext = strings.TrimPrefix(ext, ".")
	
	validType := false
	for _, allowedType := range s.config.Upload.AllowedImageTypes {
		if ext == allowedType {
			validType = true
			break
		}
	}
	
	if !validType {
		return "", fmt.Errorf("invalid file type: %s", ext)
	}

	// Validate file size
	if header.Size > s.config.Upload.MaxSize {
		return "", fmt.Errorf("file too large: %d bytes", header.Size)
	}

	// Generate unique filename
	filename := fmt.Sprintf("recipes/%s/%s.%s", 
		time.Now().Format("2006/01/02"), 
		uuid.New().String(), 
		ext,
	)

	// Read file content
	buf := new(bytes.Buffer)
	if _, err := buf.ReadFrom(file); err != nil {
		return "", err
	}

	// Upload to S3
	_, err := s.s3Client.PutObject(&s3.PutObjectInput{
		Bucket:      aws.String(s.bucket),
		Key:         aws.String(filename),
		Body:        bytes.NewReader(buf.Bytes()),
		ContentType: aws.String(getContentType(ext)),
		ACL:         aws.String("public-read"),
	})
	if err != nil {
		return "", err
	}

	// Return public URL
	url := fmt.Sprintf("https://%s.s3.%s.amazonaws.com/%s", s.bucket, s.config.AWS.Region, filename)
	return url, nil
}

func getContentType(ext string) string {
	switch ext {
	case "jpg", "jpeg":
		return "image/jpeg"
	case "png":
		return "image/png"
	case "webp":
		return "image/webp"
	default:
		return "application/octet-stream"
	}
}

// Mock upload service for development/testing
type mockUploadService struct{}

func (s *mockUploadService) UploadImage(file multipart.File, header *multipart.FileHeader) (string, error) {
	// Return a mock URL for development
	return fmt.Sprintf("https://picsum.photos/800/600?random=%s", uuid.New().String()), nil
}