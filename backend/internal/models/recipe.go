package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Recipe struct {
	ID          uuid.UUID      `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	UserID      uuid.UUID      `json:"user_id" gorm:"type:uuid;not null"`
	Title       string         `json:"title" gorm:"not null" validate:"required,min=2,max=200"`
	Description *string        `json:"description,omitempty"`
	ImageURL    *string        `json:"image_url,omitempty"`
	PrepTime    *int           `json:"prep_time,omitempty"` // minutes
	CookTime    *int           `json:"cook_time,omitempty"` // minutes
	Servings    *int           `json:"servings,omitempty"`
	Difficulty  *string        `json:"difficulty,omitempty" gorm:"check:difficulty IN ('easy','medium','hard')"`
	Type        *string        `json:"type,omitempty"`        // breakfast, lunch, dinner, dessert, snack, drink
	Rating      float64        `json:"rating" gorm:"default:0"`
	RatingCount int            `json:"rating_count" gorm:"default:0"`
	IsPublic    bool           `json:"is_public" gorm:"default:true"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`

	// Relationships
	User         User          `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Ingredients  []Ingredient  `json:"ingredients,omitempty" gorm:"foreignKey:RecipeID;constraint:OnDelete:CASCADE"`
	Instructions []Instruction `json:"instructions,omitempty" gorm:"foreignKey:RecipeID;constraint:OnDelete:CASCADE"`
	Tags         []Tag         `json:"tags,omitempty" gorm:"many2many:recipe_tags;"`
	Collections  []Collection  `json:"collections,omitempty" gorm:"many2many:collection_recipes;"`
	Ratings      []Rating      `json:"ratings,omitempty" gorm:"foreignKey:RecipeID"`
	Nutrition    *Nutrition    `json:"nutrition,omitempty" gorm:"foreignKey:RecipeID"`
}

type Ingredient struct {
	ID         uuid.UUID `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	RecipeID   uuid.UUID `json:"recipe_id" gorm:"type:uuid;not null"`
	Name       string    `json:"name" gorm:"not null" validate:"required"`
	Amount     *float64  `json:"amount,omitempty"`
	Unit       *string   `json:"unit,omitempty"`
	Notes      *string   `json:"notes,omitempty"`
	OrderIndex int       `json:"order_index" gorm:"default:0"`
}

type Instruction struct {
	ID           uuid.UUID `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	RecipeID     uuid.UUID `json:"recipe_id" gorm:"type:uuid;not null"`
	Step         int       `json:"step" gorm:"not null"`
	Instruction  string    `json:"instruction" gorm:"not null" validate:"required"`
	ImageURL     *string   `json:"image_url,omitempty"`
	TimerMinutes *int      `json:"timer_minutes,omitempty"`
}

type Tag struct {
	ID        uuid.UUID `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	Name      string    `json:"name" gorm:"uniqueIndex;not null"`
	Color     *string   `json:"color,omitempty"`
	CreatedAt time.Time `json:"created_at"`
}

type Rating struct {
	ID       uuid.UUID `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	UserID   uuid.UUID `json:"user_id" gorm:"type:uuid;not null"`
	RecipeID uuid.UUID `json:"recipe_id" gorm:"type:uuid;not null"`
	Rating   int       `json:"rating" gorm:"not null;check:rating >= 1 AND rating <= 5"`
	Review   *string   `json:"review,omitempty"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	// Relationships
	User   User   `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Recipe Recipe `json:"recipe,omitempty" gorm:"foreignKey:RecipeID"`
}

type Nutrition struct {
	ID           uuid.UUID `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	RecipeID     uuid.UUID `json:"recipe_id" gorm:"type:uuid;not null;uniqueIndex"`
	Calories     *int      `json:"calories,omitempty"`
	Protein      *float64  `json:"protein,omitempty"`      // grams
	Carbs        *float64  `json:"carbs,omitempty"`        // grams
	Fat          *float64  `json:"fat,omitempty"`          // grams
	Fiber        *float64  `json:"fiber,omitempty"`        // grams
	Sugar        *float64  `json:"sugar,omitempty"`        // grams
	Sodium       *float64  `json:"sodium,omitempty"`       // milligrams
	Cholesterol  *float64  `json:"cholesterol,omitempty"`  // milligrams
}

type RecipeCreateRequest struct {
	Title        string                     `json:"title" validate:"required,min=2,max=200"`
	Description  *string                    `json:"description,omitempty"`
	ImageURL     *string                    `json:"image_url,omitempty"`
	PrepTime     *int                       `json:"prep_time,omitempty"`
	CookTime     *int                       `json:"cook_time,omitempty"`
	Servings     *int                       `json:"servings,omitempty"`
	Difficulty   *string                    `json:"difficulty,omitempty"`
	Type         *string                    `json:"type,omitempty"`
	IsPublic     *bool                      `json:"is_public,omitempty"`
	Ingredients  []IngredientCreateRequest  `json:"ingredients,omitempty"`
	Instructions []InstructionCreateRequest `json:"instructions,omitempty"`
	Tags         []string                   `json:"tags,omitempty"`
	Nutrition    *NutritionCreateRequest    `json:"nutrition,omitempty"`
}

type IngredientCreateRequest struct {
	Name       string   `json:"name" validate:"required"`
	Amount     *float64 `json:"amount,omitempty"`
	Unit       *string  `json:"unit,omitempty"`
	Notes      *string  `json:"notes,omitempty"`
	OrderIndex *int     `json:"order_index,omitempty"`
}

type InstructionCreateRequest struct {
	Step         int     `json:"step" validate:"required,min=1"`
	Instruction  string  `json:"instruction" validate:"required"`
	ImageURL     *string `json:"image_url,omitempty"`
	TimerMinutes *int    `json:"timer_minutes,omitempty"`
}

type NutritionCreateRequest struct {
	Calories    *int     `json:"calories,omitempty"`
	Protein     *float64 `json:"protein,omitempty"`
	Carbs       *float64 `json:"carbs,omitempty"`
	Fat         *float64 `json:"fat,omitempty"`
	Fiber       *float64 `json:"fiber,omitempty"`
	Sugar       *float64 `json:"sugar,omitempty"`
	Sodium      *float64 `json:"sodium,omitempty"`
	Cholesterol *float64 `json:"cholesterol,omitempty"`
}

type RateRecipeRequest struct {
	Rating int     `json:"rating" validate:"required,min=1,max=5"`
	Review *string `json:"review,omitempty"`
}

type RecipeQuery struct {
	Page       int      `form:"page,default=1" validate:"min=1"`
	Limit      int      `form:"limit,default=20" validate:"min=1,max=100"`
	Search     *string  `form:"search,omitempty"`
	Difficulty *string  `form:"difficulty,omitempty"`
	Type       *string  `form:"type,omitempty"`
	Tags       []string `form:"tags,omitempty"`
	UserID     *string  `form:"user_id,omitempty"`
	SortBy     *string  `form:"sort_by,omitempty"` // created_at, rating, title
	SortOrder  *string  `form:"sort_order,omitempty"` // asc, desc
}

func (r *Recipe) BeforeCreate(tx *gorm.DB) error {
	if r.ID == uuid.Nil {
		r.ID = uuid.New()
	}
	return nil
}

func (i *Ingredient) BeforeCreate(tx *gorm.DB) error {
	if i.ID == uuid.Nil {
		i.ID = uuid.New()
	}
	return nil
}

func (i *Instruction) BeforeCreate(tx *gorm.DB) error {
	if i.ID == uuid.Nil {
		i.ID = uuid.New()
	}
	return nil
}

func (t *Tag) BeforeCreate(tx *gorm.DB) error {
	if t.ID == uuid.Nil {
		t.ID = uuid.New()
	}
	return nil
}

func (r *Rating) BeforeCreate(tx *gorm.DB) error {
	if r.ID == uuid.Nil {
		r.ID = uuid.New()
	}
	return nil
}

func (n *Nutrition) BeforeCreate(tx *gorm.DB) error {
	if n.ID == uuid.Nil {
		n.ID = uuid.New()
	}
	return nil
}