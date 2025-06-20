package repositories

import (
	"fmt"
	"strings"
	"yummio-backend/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type RecipeRepository interface {
	Create(recipe *models.Recipe) error
	GetByID(id uuid.UUID) (*models.Recipe, error)
	GetByUserID(userID uuid.UUID, query *models.RecipeQuery) ([]models.Recipe, int64, error)
	GetAll(query *models.RecipeQuery) ([]models.Recipe, int64, error)
	Update(recipe *models.Recipe) error
	Delete(id uuid.UUID) error
	Search(query *models.RecipeQuery) ([]models.Recipe, int64, error)
	GetFeatured(limit int) ([]models.Recipe, error)
	AddToFavorites(userID, recipeID uuid.UUID) error
	RemoveFromFavorites(userID, recipeID uuid.UUID) error
	GetFavorites(userID uuid.UUID, query *models.RecipeQuery) ([]models.Recipe, int64, error)
	RateRecipe(rating *models.Rating) error
	UpdateRating(recipeID uuid.UUID) error
}

type recipeRepository struct {
	db *gorm.DB
}

func NewRecipeRepository(db *gorm.DB) RecipeRepository {
	return &recipeRepository{db: db}
}

func (r *recipeRepository) Create(recipe *models.Recipe) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(recipe).Error; err != nil {
			return err
		}

		// Handle tags
		if len(recipe.Tags) > 0 {
			for i, tag := range recipe.Tags {
				// Check if tag exists
				var existingTag models.Tag
				if err := tx.Where("name = ?", tag.Name).First(&existingTag).Error; err != nil {
					if err == gorm.ErrRecordNotFound {
						// Create new tag
						if err := tx.Create(&tag).Error; err != nil {
							return err
						}
						recipe.Tags[i] = tag
					} else {
						return err
					}
				} else {
					recipe.Tags[i] = existingTag
				}
			}

			// Associate tags with recipe
			if err := tx.Model(recipe).Association("Tags").Replace(recipe.Tags); err != nil {
				return err
			}
		}

		return nil
	})
}

func (r *recipeRepository) GetByID(id uuid.UUID) (*models.Recipe, error) {
	var recipe models.Recipe
	err := r.db.Preload("User").
		Preload("Ingredients").
		Preload("Instructions").
		Preload("Tags").
		Preload("Nutrition").
		Where("id = ?", id).
		First(&recipe).Error
	if err != nil {
		return nil, err
	}
	return &recipe, nil
}

func (r *recipeRepository) GetByUserID(userID uuid.UUID, query *models.RecipeQuery) ([]models.Recipe, int64, error) {
	db := r.db.Model(&models.Recipe{}).Where("user_id = ?", userID)
	return r.queryRecipes(db, query)
}

func (r *recipeRepository) GetAll(query *models.RecipeQuery) ([]models.Recipe, int64, error) {
	db := r.db.Model(&models.Recipe{}).Where("is_public = ?", true)
	return r.queryRecipes(db, query)
}

func (r *recipeRepository) Update(recipe *models.Recipe) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		// Update recipe
		if err := tx.Save(recipe).Error; err != nil {
			return err
		}

		// Update ingredients
		if err := tx.Where("recipe_id = ?", recipe.ID).Delete(&models.Ingredient{}).Error; err != nil {
			return err
		}
		for _, ingredient := range recipe.Ingredients {
			ingredient.RecipeID = recipe.ID
			if err := tx.Create(&ingredient).Error; err != nil {
				return err
			}
		}

		// Update instructions
		if err := tx.Where("recipe_id = ?", recipe.ID).Delete(&models.Instruction{}).Error; err != nil {
			return err
		}
		for _, instruction := range recipe.Instructions {
			instruction.RecipeID = recipe.ID
			if err := tx.Create(&instruction).Error; err != nil {
				return err
			}
		}

		// Update nutrition
		if recipe.Nutrition != nil {
			recipe.Nutrition.RecipeID = recipe.ID
			if err := tx.Save(recipe.Nutrition).Error; err != nil {
				return err
			}
		}

		return nil
	})
}

func (r *recipeRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&models.Recipe{}, id).Error
}

func (r *recipeRepository) Search(query *models.RecipeQuery) ([]models.Recipe, int64, error) {
	db := r.db.Model(&models.Recipe{}).Where("is_public = ?", true)

	if query.Search != nil && *query.Search != "" {
		searchTerm := "%" + strings.ToLower(*query.Search) + "%"
		db = db.Where("LOWER(title) LIKE ? OR LOWER(description) LIKE ?", searchTerm, searchTerm)
	}

	return r.queryRecipes(db, query)
}

func (r *recipeRepository) GetFeatured(limit int) ([]models.Recipe, error) {
	var recipes []models.Recipe
	err := r.db.Preload("User").
		Preload("Tags").
		Where("is_public = ? AND rating >= ?", true, 4.0).
		Order("rating DESC, rating_count DESC").
		Limit(limit).
		Find(&recipes).Error
	return recipes, err
}

func (r *recipeRepository) AddToFavorites(userID, recipeID uuid.UUID) error {
	return r.db.Exec("INSERT INTO user_favorites (user_id, recipe_id) VALUES (?, ?) ON CONFLICT DO NOTHING", userID, recipeID).Error
}

func (r *recipeRepository) RemoveFromFavorites(userID, recipeID uuid.UUID) error {
	return r.db.Exec("DELETE FROM user_favorites WHERE user_id = ? AND recipe_id = ?", userID, recipeID).Error
}

func (r *recipeRepository) GetFavorites(userID uuid.UUID, query *models.RecipeQuery) ([]models.Recipe, int64, error) {
	db := r.db.Model(&models.Recipe{}).
		Joins("JOIN user_favorites ON recipes.id = user_favorites.recipe_id").
		Where("user_favorites.user_id = ?", userID)
	return r.queryRecipes(db, query)
}

func (r *recipeRepository) RateRecipe(rating *models.Rating) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		// Check if user already rated this recipe
		var existingRating models.Rating
		err := tx.Where("user_id = ? AND recipe_id = ?", rating.UserID, rating.RecipeID).First(&existingRating).Error
		
		if err == gorm.ErrRecordNotFound {
			// Create new rating
			if err := tx.Create(rating).Error; err != nil {
				return err
			}
		} else if err != nil {
			return err
		} else {
			// Update existing rating
			existingRating.Rating = rating.Rating
			existingRating.Review = rating.Review
			if err := tx.Save(&existingRating).Error; err != nil {
				return err
			}
		}

		// Update recipe rating
		return r.UpdateRating(rating.RecipeID)
	})
}

func (r *recipeRepository) UpdateRating(recipeID uuid.UUID) error {
	var avgRating float64
	var count int64

	if err := r.db.Model(&models.Rating{}).
		Where("recipe_id = ?", recipeID).
		Select("AVG(rating)").
		Scan(&avgRating).Error; err != nil {
		return err
	}

	if err := r.db.Model(&models.Rating{}).
		Where("recipe_id = ?", recipeID).
		Count(&count).Error; err != nil {
		return err
	}

	return r.db.Model(&models.Recipe{}).
		Where("id = ?", recipeID).
		Updates(map[string]interface{}{
			"rating":       avgRating,
			"rating_count": count,
		}).Error
}

func (r *recipeRepository) queryRecipes(db *gorm.DB, query *models.RecipeQuery) ([]models.Recipe, int64, error) {
	// Apply filters
	if query.Difficulty != nil && *query.Difficulty != "" {
		db = db.Where("difficulty = ?", *query.Difficulty)
	}

	if query.Type != nil && *query.Type != "" {
		db = db.Where("type = ?", *query.Type)
	}

	if len(query.Tags) > 0 {
		db = db.Joins("JOIN recipe_tags ON recipes.id = recipe_tags.recipe_id").
			Joins("JOIN tags ON recipe_tags.tag_id = tags.id").
			Where("tags.name IN ?", query.Tags).
			Group("recipes.id")
	}

	// Count total records
	var total int64
	if err := db.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Apply sorting
	sortBy := "created_at"
	if query.SortBy != nil && *query.SortBy != "" {
		sortBy = *query.SortBy
	}

	sortOrder := "DESC"
	if query.SortOrder != nil && *query.SortOrder != "" {
		sortOrder = strings.ToUpper(*query.SortOrder)
	}

	orderClause := fmt.Sprintf("%s %s", sortBy, sortOrder)

	// Apply pagination
	offset := (query.Page - 1) * query.Limit

	var recipes []models.Recipe
	err := db.Preload("User").
		Preload("Tags").
		Order(orderClause).
		Offset(offset).
		Limit(query.Limit).
		Find(&recipes).Error

	return recipes, total, err
}