package services

import (
	"errors"
	"yummio-backend/internal/models"
	"yummio-backend/internal/repositories"

	"github.com/google/uuid"
)

type ShoppingListService interface {
	CreateShoppingList(userID uuid.UUID, req *models.ShoppingListCreateRequest) (*models.ShoppingList, error)
	GetShoppingList(userID, listID uuid.UUID) (*models.ShoppingList, error)
	GetShoppingLists(userID uuid.UUID) ([]models.ShoppingList, error)
	UpdateShoppingList(userID, listID uuid.UUID, req *models.ShoppingListUpdateRequest) (*models.ShoppingList, error)
	DeleteShoppingList(userID, listID uuid.UUID) error
	AddItem(userID, listID uuid.UUID, req *models.ShoppingListItemCreateRequest) (*models.ShoppingListItem, error)
	UpdateItem(userID, listID, itemID uuid.UUID, req *models.ShoppingListItemUpdateRequest) (*models.ShoppingListItem, error)
	DeleteItem(userID, listID, itemID uuid.UUID) error
}

type shoppingListService struct {
	shoppingListRepo repositories.ShoppingListRepository
}

func NewShoppingListService(shoppingListRepo repositories.ShoppingListRepository) ShoppingListService {
	return &shoppingListService{
		shoppingListRepo: shoppingListRepo,
	}
}

func (s *shoppingListService) CreateShoppingList(userID uuid.UUID, req *models.ShoppingListCreateRequest) (*models.ShoppingList, error) {
	list := &models.ShoppingList{
		UserID: userID,
		Name:   req.Name,
	}

	// Add items
	for i, itemReq := range req.Items {
		item := models.ShoppingListItem{
			Name:       itemReq.Name,
			Amount:     itemReq.Amount,
			Unit:       itemReq.Unit,
			Notes:      itemReq.Notes,
			OrderIndex: i,
		}
		if itemReq.OrderIndex != nil {
			item.OrderIndex = *itemReq.OrderIndex
		}
		list.Items = append(list.Items, item)
	}

	if err := s.shoppingListRepo.Create(list); err != nil {
		return nil, err
	}

	return s.shoppingListRepo.GetByID(list.ID)
}

func (s *shoppingListService) GetShoppingList(userID, listID uuid.UUID) (*models.ShoppingList, error) {
	list, err := s.shoppingListRepo.GetByID(listID)
	if err != nil {
		return nil, err
	}

	// Check ownership
	if list.UserID != userID {
		return nil, errors.New("unauthorized to access this shopping list")
	}

	return list, nil
}

func (s *shoppingListService) GetShoppingLists(userID uuid.UUID) ([]models.ShoppingList, error) {
	return s.shoppingListRepo.GetByUserID(userID)
}

func (s *shoppingListService) UpdateShoppingList(userID, listID uuid.UUID, req *models.ShoppingListUpdateRequest) (*models.ShoppingList, error) {
	list, err := s.shoppingListRepo.GetByID(listID)
	if err != nil {
		return nil, err
	}

	// Check ownership
	if list.UserID != userID {
		return nil, errors.New("unauthorized to update this shopping list")
	}

	// Update fields
	if req.Name != nil {
		list.Name = *req.Name
	}

	if err := s.shoppingListRepo.Update(list); err != nil {
		return nil, err
	}

	return s.shoppingListRepo.GetByID(list.ID)
}

func (s *shoppingListService) DeleteShoppingList(userID, listID uuid.UUID) error {
	list, err := s.shoppingListRepo.GetByID(listID)
	if err != nil {
		return err
	}

	// Check ownership
	if list.UserID != userID {
		return errors.New("unauthorized to delete this shopping list")
	}

	return s.shoppingListRepo.Delete(listID)
}

func (s *shoppingListService) AddItem(userID, listID uuid.UUID, req *models.ShoppingListItemCreateRequest) (*models.ShoppingListItem, error) {
	list, err := s.shoppingListRepo.GetByID(listID)
	if err != nil {
		return nil, err
	}

	// Check ownership
	if list.UserID != userID {
		return nil, errors.New("unauthorized to modify this shopping list")
	}

	item := &models.ShoppingListItem{
		ShoppingListID: listID,
		Name:           req.Name,
		Amount:         req.Amount,
		Unit:           req.Unit,
		Notes:          req.Notes,
		OrderIndex:     len(list.Items),
	}

	if req.OrderIndex != nil {
		item.OrderIndex = *req.OrderIndex
	}

	if err := s.shoppingListRepo.AddItem(item); err != nil {
		return nil, err
	}

	return s.shoppingListRepo.GetItem(item.ID)
}

func (s *shoppingListService) UpdateItem(userID, listID, itemID uuid.UUID, req *models.ShoppingListItemUpdateRequest) (*models.ShoppingListItem, error) {
	// Verify list ownership
	list, err := s.shoppingListRepo.GetByID(listID)
	if err != nil {
		return nil, err
	}

	if list.UserID != userID {
		return nil, errors.New("unauthorized to modify this shopping list")
	}

	// Get item
	item, err := s.shoppingListRepo.GetItem(itemID)
	if err != nil {
		return nil, err
	}

	// Verify item belongs to the list
	if item.ShoppingListID != listID {
		return nil, errors.New("item does not belong to this shopping list")
	}

	// Update fields
	if req.Name != nil {
		item.Name = *req.Name
	}
	if req.Amount != nil {
		item.Amount = req.Amount
	}
	if req.Unit != nil {
		item.Unit = req.Unit
	}
	if req.Notes != nil {
		item.Notes = req.Notes
	}
	if req.Completed != nil {
		item.Completed = *req.Completed
	}
	if req.OrderIndex != nil {
		item.OrderIndex = *req.OrderIndex
	}

	if err := s.shoppingListRepo.UpdateItem(item); err != nil {
		return nil, err
	}

	return s.shoppingListRepo.GetItem(item.ID)
}

func (s *shoppingListService) DeleteItem(userID, listID, itemID uuid.UUID) error {
	// Verify list ownership
	list, err := s.shoppingListRepo.GetByID(listID)
	if err != nil {
		return err
	}

	if list.UserID != userID {
		return errors.New("unauthorized to modify this shopping list")
	}

	// Get item to verify it belongs to the list
	item, err := s.shoppingListRepo.GetItem(itemID)
	if err != nil {
		return err
	}

	if item.ShoppingListID != listID {
		return errors.New("item does not belong to this shopping list")
	}

	return s.shoppingListRepo.DeleteItem(itemID)
}