package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ShoppingList struct {
	ID        uuid.UUID      `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	UserID    uuid.UUID      `json:"user_id" gorm:"type:uuid;not null"`
	Name      string         `json:"name" gorm:"not null" validate:"required,min=1,max=100"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`

	// Relationships
	User  User               `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Items []ShoppingListItem `json:"items,omitempty" gorm:"foreignKey:ShoppingListID;constraint:OnDelete:CASCADE"`
}

type ShoppingListItem struct {
	ID               uuid.UUID `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	ShoppingListID   uuid.UUID `json:"shopping_list_id" gorm:"type:uuid;not null"`
	Name             string    `json:"name" gorm:"not null" validate:"required"`
	Amount           *float64  `json:"amount,omitempty"`
	Unit             *string   `json:"unit,omitempty"`
	Notes            *string   `json:"notes,omitempty"`
	Completed        bool      `json:"completed" gorm:"default:false"`
	OrderIndex       int       `json:"order_index" gorm:"default:0"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}

type ShoppingListCreateRequest struct {
	Name  string                        `json:"name" validate:"required,min=1,max=100"`
	Items []ShoppingListItemCreateRequest `json:"items,omitempty"`
}

type ShoppingListUpdateRequest struct {
	Name *string `json:"name,omitempty" validate:"omitempty,min=1,max=100"`
}

type ShoppingListItemCreateRequest struct {
	Name       string   `json:"name" validate:"required"`
	Amount     *float64 `json:"amount,omitempty"`
	Unit       *string  `json:"unit,omitempty"`
	Notes      *string  `json:"notes,omitempty"`
	OrderIndex *int     `json:"order_index,omitempty"`
}

type ShoppingListItemUpdateRequest struct {
	Name       *string  `json:"name,omitempty" validate:"omitempty,min=1"`
	Amount     *float64 `json:"amount,omitempty"`
	Unit       *string  `json:"unit,omitempty"`
	Notes      *string  `json:"notes,omitempty"`
	Completed  *bool    `json:"completed,omitempty"`
	OrderIndex *int     `json:"order_index,omitempty"`
}

type ShoppingListResponse struct {
	ID            uuid.UUID `json:"id"`
	Name          string    `json:"name"`
	ItemCount     int       `json:"item_count"`
	CompletedCount int       `json:"completed_count"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

func (s *ShoppingList) BeforeCreate(tx *gorm.DB) error {
	if s.ID == uuid.Nil {
		s.ID = uuid.New()
	}
	return nil
}

func (s *ShoppingListItem) BeforeCreate(tx *gorm.DB) error {
	if s.ID == uuid.Nil {
		s.ID = uuid.New()
	}
	return nil
}

func (s *ShoppingList) ToResponse() ShoppingListResponse {
	completedCount := 0
	for _, item := range s.Items {
		if item.Completed {
			completedCount++
		}
	}

	return ShoppingListResponse{
		ID:             s.ID,
		Name:           s.Name,
		ItemCount:      len(s.Items),
		CompletedCount: completedCount,
		CreatedAt:      s.CreatedAt,
		UpdatedAt:      s.UpdatedAt,
	}
}