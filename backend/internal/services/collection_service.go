package services

import (
	"errors"
	"yummio-backend/internal/models"
	"yummio-backend/internal/repositories"

	"github.com/google/uuid"
)

type CollectionService interface {
	CreateCollection(userID uuid.UUID, req *models.CollectionCreateRequest) (*models.Collection, error)
	GetCollection(userID, collectionID uuid.UUID) (*models.Collection, error)
	GetCollections(userID uuid.UUID) ([]models.Collection, error)
	UpdateCollection(userID, collectionID uuid.UUID, req *models.CollectionUpdateRequest) (*models.Collection, error)
	DeleteCollection(userID, collectionID uuid.UUID) error
	AddRecipeToCollection(userID, collectionID, recipeID uuid.UUID) error
	RemoveRecipeFromCollection(userID, collectionID, recipeID uuid.UUID) error
}

type collectionService struct {
	collectionRepo repositories.CollectionRepository
}

func NewCollectionService(collectionRepo repositories.CollectionRepository) CollectionService {
	return &collectionService{
		collectionRepo: collectionRepo,
	}
}

func (s *collectionService) CreateCollection(userID uuid.UUID, req *models.CollectionCreateRequest) (*models.Collection, error) {
	collection := &models.Collection{
		UserID:      userID,
		Name:        req.Name,
		Description: req.Description,
		ImageURL:    req.ImageURL,
		IsPublic:    false,
	}

	if req.IsPublic != nil {
		collection.IsPublic = *req.IsPublic
	}

	if err := s.collectionRepo.Create(collection); err != nil {
		return nil, err
	}

	return s.collectionRepo.GetByID(collection.ID)
}

func (s *collectionService) GetCollection(userID, collectionID uuid.UUID) (*models.Collection, error) {
	collection, err := s.collectionRepo.GetByID(collectionID)
	if err != nil {
		return nil, err
	}

	// Check access permissions
	if collection.UserID != userID && !collection.IsPublic {
		return nil, errors.New("unauthorized to access this collection")
	}

	return collection, nil
}

func (s *collectionService) GetCollections(userID uuid.UUID) ([]models.Collection, error) {
	return s.collectionRepo.GetByUserID(userID)
}

func (s *collectionService) UpdateCollection(userID, collectionID uuid.UUID, req *models.CollectionUpdateRequest) (*models.Collection, error) {
	collection, err := s.collectionRepo.GetByID(collectionID)
	if err != nil {
		return nil, err
	}

	// Check ownership
	if collection.UserID != userID {
		return nil, errors.New("unauthorized to update this collection")
	}

	// Update fields
	if req.Name != nil {
		collection.Name = *req.Name
	}
	if req.Description != nil {
		collection.Description = req.Description
	}
	if req.ImageURL != nil {
		collection.ImageURL = req.ImageURL
	}
	if req.IsPublic != nil {
		collection.IsPublic = *req.IsPublic
	}

	if err := s.collectionRepo.Update(collection); err != nil {
		return nil, err
	}

	return s.collectionRepo.GetByID(collection.ID)
}

func (s *collectionService) DeleteCollection(userID, collectionID uuid.UUID) error {
	collection, err := s.collectionRepo.GetByID(collectionID)
	if err != nil {
		return err
	}

	// Check ownership
	if collection.UserID != userID {
		return errors.New("unauthorized to delete this collection")
	}

	return s.collectionRepo.Delete(collectionID)
}

func (s *collectionService) AddRecipeToCollection(userID, collectionID, recipeID uuid.UUID) error {
	collection, err := s.collectionRepo.GetByID(collectionID)
	if err != nil {
		return err
	}

	// Check ownership
	if collection.UserID != userID {
		return errors.New("unauthorized to modify this collection")
	}

	return s.collectionRepo.AddRecipe(collectionID, recipeID)
}

func (s *collectionService) RemoveRecipeFromCollection(userID, collectionID, recipeID uuid.UUID) error {
	collection, err := s.collectionRepo.GetByID(collectionID)
	if err != nil {
		return err
	}

	// Check ownership
	if collection.UserID != userID {
		return errors.New("unauthorized to modify this collection")
	}

	return s.collectionRepo.RemoveRecipe(collectionID, recipeID)
}