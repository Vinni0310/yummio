package repositories

import (
	"yummio-backend/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type CollectionRepository interface {
	Create(collection *models.Collection) error
	GetByID(id uuid.UUID) (*models.Collection, error)
	GetByUserID(userID uuid.UUID) ([]models.Collection, error)
	Update(collection *models.Collection) error
	Delete(id uuid.UUID) error
	AddRecipe(collectionID, recipeID uuid.UUID) error
	RemoveRecipe(collectionID, recipeID uuid.UUID) error
}

type collectionRepository struct {
	db *gorm.DB
}

func NewCollectionRepository(db *gorm.DB) CollectionRepository {
	return &collectionRepository{db: db}
}

func (r *collectionRepository) Create(collection *models.Collection) error {
	return r.db.Create(collection).Error
}

func (r *collectionRepository) GetByID(id uuid.UUID) (*models.Collection, error) {
	var collection models.Collection
	err := r.db.Preload("Recipes").
		Preload("Recipes.User").
		Where("id = ?", id).
		First(&collection).Error
	if err != nil {
		return nil, err
	}
	return &collection, nil
}

func (r *collectionRepository) GetByUserID(userID uuid.UUID) ([]models.Collection, error) {
	var collections []models.Collection
	err := r.db.Preload("Recipes").
		Where("user_id = ?", userID).
		Order("created_at DESC").
		Find(&collections).Error
	return collections, err
}

func (r *collectionRepository) Update(collection *models.Collection) error {
	return r.db.Save(collection).Error
}

func (r *collectionRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&models.Collection{}, id).Error
}

func (r *collectionRepository) AddRecipe(collectionID, recipeID uuid.UUID) error {
	return r.db.Exec("INSERT INTO collection_recipes (collection_id, recipe_id) VALUES (?, ?) ON CONFLICT DO NOTHING", collectionID, recipeID).Error
}

func (r *collectionRepository) RemoveRecipe(collectionID, recipeID uuid.UUID) error {
	return r.db.Exec("DELETE FROM collection_recipes WHERE collection_id = ? AND recipe_id = ?", collectionID, recipeID).Error
}