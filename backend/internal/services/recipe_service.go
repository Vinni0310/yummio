package services

import (
	"errors"
	"yummio-backend/internal/models"
	"yummio-backend/internal/repositories"

	"github.com/google/uuid"
)

type RecipeService interface {
	CreateRecipe(userID uuid.UUID, req *models.RecipeCreateRequest) (*models.Recipe, error)
	GetRecipe(id uuid.UUID) (*models.Recipe, error)
	GetRecipes(query *models.RecipeQuery) ([]models.Recipe, int64, error)
	GetMyRecipes(userID uuid.UUID, query *models.RecipeQuery) ([]models.Recipe, int64, error)
	UpdateRecipe(userID, recipeID uuid.UUID, req *models.RecipeCreateRequest) (*models.Recipe, error)
	DeleteRecipe(userID, recipeID uuid.UUID) error
	SearchRecipes(query *models.RecipeQuery) ([]models.Recipe, int64, error)
	GetFeaturedRecipes(limit int) ([]models.Recipe, error)
	FavoriteRecipe(userID, recipeID uuid.UUID) error
	UnfavoriteRecipe(userID, recipeID uuid.UUID) error
	GetFavorites(userID uuid.UUID, query *models.RecipeQuery) ([]models.Recipe, int64, error)
	RateRecipe(userID, recipeID uuid.UUID, req *models.RateRecipeRequest) error
}

type recipeService struct {
	recipeRepo repositories.RecipeRepository
}

func NewRecipeService(recipeRepo repositories.RecipeRepository) RecipeService {
	return &recipeService{
		recipeRepo: recipeRepo,
	}
}

func (s *recipeService) CreateRecipe(userID uuid.UUID, req *models.RecipeCreateRequest) (*models.Recipe, error) {
	recipe := &models.Recipe{
		UserID:      userID,
		Title:       req.Title,
		Description: req.Description,
		ImageURL:    req.ImageURL,
		PrepTime:    req.PrepTime,
		CookTime:    req.CookTime,
		Servings:    req.Servings,
		Difficulty:  req.Difficulty,
		Type:        req.Type,
		IsPublic:    true,
	}

	if req.IsPublic != nil {
		recipe.IsPublic = *req.IsPublic
	}

	// Add ingredients
	for i, ingredientReq := range req.Ingredients {
		ingredient := models.Ingredient{
			Name:       ingredientReq.Name,
			Amount:     ingredientReq.Amount,
			Unit:       ingredientReq.Unit,
			Notes:      ingredientReq.Notes,
			OrderIndex: i,
		}
		if ingredientReq.OrderIndex != nil {
			ingredient.OrderIndex = *ingredientReq.OrderIndex
		}
		recipe.Ingredients = append(recipe.Ingredients, ingredient)
	}

	// Add instructions
	for _, instructionReq := range req.Instructions {
		instruction := models.Instruction{
			Step:         instructionReq.Step,
			Instruction:  instructionReq.Instruction,
			ImageURL:     instructionReq.ImageURL,
			TimerMinutes: instructionReq.TimerMinutes,
		}
		recipe.Instructions = append(recipe.Instructions, instruction)
	}

	// Add tags
	for _, tagName := range req.Tags {
		tag := models.Tag{
			Name: tagName,
		}
		recipe.Tags = append(recipe.Tags, tag)
	}

	// Add nutrition
	if req.Nutrition != nil {
		recipe.Nutrition = &models.Nutrition{
			Calories:    req.Nutrition.Calories,
			Protein:     req.Nutrition.Protein,
			Carbs:       req.Nutrition.Carbs,
			Fat:         req.Nutrition.Fat,
			Fiber:       req.Nutrition.Fiber,
			Sugar:       req.Nutrition.Sugar,
			Sodium:      req.Nutrition.Sodium,
			Cholesterol: req.Nutrition.Cholesterol,
		}
	}

	if err := s.recipeRepo.Create(recipe); err != nil {
		return nil, err
	}

	return s.recipeRepo.GetByID(recipe.ID)
}

func (s *recipeService) GetRecipe(id uuid.UUID) (*models.Recipe, error) {
	return s.recipeRepo.GetByID(id)
}

func (s *recipeService) GetRecipes(query *models.RecipeQuery) ([]models.Recipe, int64, error) {
	return s.recipeRepo.GetAll(query)
}

func (s *recipeService) GetMyRecipes(userID uuid.UUID, query *models.RecipeQuery) ([]models.Recipe, int64, error) {
	return s.recipeRepo.GetByUserID(userID, query)
}

func (s *recipeService) UpdateRecipe(userID, recipeID uuid.UUID, req *models.RecipeCreateRequest) (*models.Recipe, error) {
	// Get existing recipe
	recipe, err := s.recipeRepo.GetByID(recipeID)
	if err != nil {
		return nil, err
	}

	// Check ownership
	if recipe.UserID != userID {
		return nil, errors.New("unauthorized to update this recipe")
	}

	// Update fields
	recipe.Title = req.Title
	recipe.Description = req.Description
	recipe.ImageURL = req.ImageURL
	recipe.PrepTime = req.PrepTime
	recipe.CookTime = req.CookTime
	recipe.Servings = req.Servings
	recipe.Difficulty = req.Difficulty
	recipe.Type = req.Type

	if req.IsPublic != nil {
		recipe.IsPublic = *req.IsPublic
	}

	// Update ingredients
	recipe.Ingredients = nil
	for i, ingredientReq := range req.Ingredients {
		ingredient := models.Ingredient{
			Name:       ingredientReq.Name,
			Amount:     ingredientReq.Amount,
			Unit:       ingredientReq.Unit,
			Notes:      ingredientReq.Notes,
			OrderIndex: i,
		}
		if ingredientReq.OrderIndex != nil {
			ingredient.OrderIndex = *ingredientReq.OrderIndex
		}
		recipe.Ingredients = append(recipe.Ingredients, ingredient)
	}

	// Update instructions
	recipe.Instructions = nil
	for _, instructionReq := range req.Instructions {
		instruction := models.Instruction{
			Step:         instructionReq.Step,
			Instruction:  instructionReq.Instruction,
			ImageURL:     instructionReq.ImageURL,
			TimerMinutes: instructionReq.TimerMinutes,
		}
		recipe.Instructions = append(recipe.Instructions, instruction)
	}

	// Update nutrition
	if req.Nutrition != nil {
		if recipe.Nutrition == nil {
			recipe.Nutrition = &models.Nutrition{}
		}
		recipe.Nutrition.Calories = req.Nutrition.Calories
		recipe.Nutrition.Protein = req.Nutrition.Protein
		recipe.Nutrition.Carbs = req.Nutrition.Carbs
		recipe.Nutrition.Fat = req.Nutrition.Fat
		recipe.Nutrition.Fiber = req.Nutrition.Fiber
		recipe.Nutrition.Sugar = req.Nutrition.Sugar
		recipe.Nutrition.Sodium = req.Nutrition.Sodium
		recipe.Nutrition.Cholesterol = req.Nutrition.Cholesterol
	}

	if err := s.recipeRepo.Update(recipe); err != nil {
		return nil, err
	}

	return s.recipeRepo.GetByID(recipe.ID)
}

func (s *recipeService) DeleteRecipe(userID, recipeID uuid.UUID) error {
	// Get existing recipe
	recipe, err := s.recipeRepo.GetByID(recipeID)
	if err != nil {
		return err
	}

	// Check ownership
	if recipe.UserID != userID {
		return errors.New("unauthorized to delete this recipe")
	}

	return s.recipeRepo.Delete(recipeID)
}

func (s *recipeService) SearchRecipes(query *models.RecipeQuery) ([]models.Recipe, int64, error) {
	return s.recipeRepo.Search(query)
}

func (s *recipeService) GetFeaturedRecipes(limit int) ([]models.Recipe, error) {
	return s.recipeRepo.GetFeatured(limit)
}

func (s *recipeService) FavoriteRecipe(userID, recipeID uuid.UUID) error {
	return s.recipeRepo.AddToFavorites(userID, recipeID)
}

func (s *recipeService) UnfavoriteRecipe(userID, recipeID uuid.UUID) error {
	return s.recipeRepo.RemoveFromFavorites(userID, recipeID)
}

func (s *recipeService) GetFavorites(userID uuid.UUID, query *models.RecipeQuery) ([]models.Recipe, int64, error) {
	return s.recipeRepo.GetFavorites(userID, query)
}

func (s *recipeService) RateRecipe(userID, recipeID uuid.UUID, req *models.RateRecipeRequest) error {
	rating := &models.Rating{
		UserID:   userID,
		RecipeID: recipeID,
		Rating:   req.Rating,
		Review:   req.Review,
	}

	return s.recipeRepo.RateRecipe(rating)
}