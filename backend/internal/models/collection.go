package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Collection struct {
	ID          uuid.UUID      `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	UserID      uuid.UUID      `json:"user_id" gorm:"type:uuid;not null"`
	Name        string         `json:"name" gorm:"not null" validate:"required,min=1,max=100"`
	Description *string        `json:"description,omitempty"`
	ImageURL    *string        `json:"image_url,omitempty"`
	IsPublic    bool           `json:"is_public" gorm:"default:false"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`

	// Relationships
	User    User     `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Recipes []Recipe `json:"recipes,omitempty" gorm:"many2many:collection_recipes;"`
}

type CollectionCreateRequest struct {
	Name        string  `json:"name" validate:"required,min=1,max=100"`
	Description *string `json:"description,omitempty"`
	ImageURL    *string `json:"image_url,omitempty"`
	IsPublic    *bool   `json:"is_public,omitempty"`
}

type CollectionUpdateRequest struct {
	Name        *string `json:"name,omitempty" validate:"omitempty,min=1,max=100"`
	Description *string `json:"description,omitempty"`
	ImageURL    *string `json:"image_url,omitempty"`
	IsPublic    *bool   `json:"is_public,omitempty"`
}

type AddRecipeToCollectionRequest struct {
	RecipeID uuid.UUID `json:"recipe_id" validate:"required"`
}

type CollectionResponse struct {
	ID          uuid.UUID `json:"id"`
	Name        string    `json:"name"`
	Description *string   `json:"description,omitempty"`
	ImageURL    *string   `json:"image_url,omitempty"`
	IsPublic    bool      `json:"is_public"`
	RecipeCount int       `json:"recipe_count"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

func (c *Collection) BeforeCreate(tx *gorm.DB) error {
	if c.ID == uuid.Nil {
		c.ID = uuid.New()
	}
	return nil
}

func (c *Collection) ToResponse() CollectionResponse {
	return CollectionResponse{
		ID:          c.ID,
		Name:        c.Name,
		Description: c.Description,
		ImageURL:    c.ImageURL,
		IsPublic:    c.IsPublic,
		RecipeCount: len(c.Recipes),
		CreatedAt:   c.CreatedAt,
		UpdatedAt:   c.UpdatedAt,
	}
}