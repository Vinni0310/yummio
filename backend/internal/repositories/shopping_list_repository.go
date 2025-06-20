package repositories

import (
	"yummio-backend/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ShoppingListRepository interface {
	Create(list *models.ShoppingList) error
	GetByID(id uuid.UUID) (*models.ShoppingList, error)
	GetByUserID(userID uuid.UUID) ([]models.ShoppingList, error)
	Update(list *models.ShoppingList) error
	Delete(id uuid.UUID) error
	AddItem(item *models.ShoppingListItem) error
	UpdateItem(item *models.ShoppingListItem) error
	DeleteItem(id uuid.UUID) error
	GetItem(id uuid.UUID) (*models.ShoppingListItem, error)
}

type shoppingListRepository struct {
	db *gorm.DB
}

func NewShoppingListRepository(db *gorm.DB) ShoppingListRepository {
	return &shoppingListRepository{db: db}
}

func (r *shoppingListRepository) Create(list *models.ShoppingList) error {
	return r.db.Create(list).Error
}

func (r *shoppingListRepository) GetByID(id uuid.UUID) (*models.ShoppingList, error) {
	var list models.ShoppingList
	err := r.db.Preload("Items").
		Where("id = ?", id).
		First(&list).Error
	if err != nil {
		return nil, err
	}
	return &list, nil
}

func (r *shoppingListRepository) GetByUserID(userID uuid.UUID) ([]models.ShoppingList, error) {
	var lists []models.ShoppingList
	err := r.db.Preload("Items").
		Where("user_id = ?", userID).
		Order("created_at DESC").
		Find(&lists).Error
	return lists, err
}

func (r *shoppingListRepository) Update(list *models.ShoppingList) error {
	return r.db.Save(list).Error
}

func (r *shoppingListRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&models.ShoppingList{}, id).Error
}

func (r *shoppingListRepository) AddItem(item *models.ShoppingListItem) error {
	return r.db.Create(item).Error
}

func (r *shoppingListRepository) UpdateItem(item *models.ShoppingListItem) error {
	return r.db.Save(item).Error
}

func (r *shoppingListRepository) DeleteItem(id uuid.UUID) error {
	return r.db.Delete(&models.ShoppingListItem{}, id).Error
}

func (r *shoppingListRepository) GetItem(id uuid.UUID) (*models.ShoppingListItem, error) {
	var item models.ShoppingListItem
	err := r.db.Where("id = ?", id).First(&item).Error
	if err != nil {
		return nil, err
	}
	return &item, nil
}