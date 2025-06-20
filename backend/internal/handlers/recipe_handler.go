package handlers

import (
	"net/http"
	"strconv"
	"yummio-backend/internal/middleware"
	"yummio-backend/internal/models"
	"yummio-backend/internal/services"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
)

type RecipeHandler struct {
	recipeService services.RecipeService
	validator     *validator.Validate
}

func NewRecipeHandler(recipeService services.RecipeService) *RecipeHandler {
	return &RecipeHandler{
		recipeService: recipeService,
		validator:     validator.New(),
	}
}

// GetRecipes godoc
// @Summary Get recipes
// @Description Get paginated list of public recipes
// @Tags recipes
// @Produce json
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(20)
// @Param search query string false "Search term"
// @Param difficulty query string false "Recipe difficulty"
// @Param type query string false "Recipe type"
// @Param sort_by query string false "Sort by field"
// @Param sort_order query string false "Sort order (asc/desc)"
// @Success 200 {object} map[string]interface{}
// @Router /recipes [get]
func (h *RecipeHandler) GetRecipes(c *gin.Context) {
	var query models.RecipeQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	recipes, total, err := h.recipeService.GetRecipes(&query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"recipes": recipes,
		"total":   total,
		"page":    query.Page,
		"limit":   query.Limit,
	})
}

// GetRecipe godoc
// @Summary Get recipe by ID
// @Description Get a specific recipe by its ID
// @Tags recipes
// @Produce json
// @Param id path string true "Recipe ID"
// @Success 200 {object} models.Recipe
// @Failure 404 {object} map[string]interface{}
// @Router /recipes/{id} [get]
func (h *RecipeHandler) GetRecipe(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid recipe ID"})
		return
	}

	recipe, err := h.recipeService.GetRecipe(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Recipe not found"})
		return
	}

	c.JSON(http.StatusOK, recipe)
}

// CreateRecipe godoc
// @Summary Create recipe
// @Description Create a new recipe
// @Tags recipes
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body models.RecipeCreateRequest true "Recipe data"
// @Success 201 {object} models.Recipe
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Router /recipes [post]
func (h *RecipeHandler) CreateRecipe(c *gin.Context) {
	userID, exists := middleware.GetUserID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var req models.RecipeCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.validator.Struct(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	recipe, err := h.recipeService.CreateRecipe(userID, &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, recipe)
}

// UpdateRecipe godoc
// @Summary Update recipe
// @Description Update an existing recipe
// @Tags recipes
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Recipe ID"
// @Param request body models.RecipeCreateRequest true "Recipe data"
// @Success 200 {object} models.Recipe
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 403 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Router /recipes/{id} [put]
func (h *RecipeHandler) UpdateRecipe(c *gin.Context) {
	userID, exists := middleware.GetUserID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	idStr := c.Param("id")
	recipeID, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid recipe ID"})
		return
	}

	var req models.RecipeCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.validator.Struct(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	recipe, err := h.recipeService.UpdateRecipe(userID, recipeID, &req)
	if err != nil {
		if err.Error() == "unauthorized to update this recipe" {
			c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, recipe)
}

// DeleteRecipe godoc
// @Summary Delete recipe
// @Description Delete a recipe
// @Tags recipes
// @Produce json
// @Security BearerAuth
// @Param id path string true "Recipe ID"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 403 {object} map[string]interface{}
// @Router /recipes/{id} [delete]
func (h *RecipeHandler) DeleteRecipe(c *gin.Context) {
	userID, exists := middleware.GetUserID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	idStr := c.Param("id")
	recipeID, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid recipe ID"})
		return
	}

	if err := h.recipeService.DeleteRecipe(userID, recipeID); err != nil {
		if err.Error() == "unauthorized to delete this recipe" {
			c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Recipe deleted successfully"})
}

// SearchRecipes godoc
// @Summary Search recipes
// @Description Search recipes by title and description
// @Tags recipes
// @Produce json
// @Param q query string true "Search query"
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(20)
// @Success 200 {object} map[string]interface{}
// @Router /recipes/search [get]
func (h *RecipeHandler) SearchRecipes(c *gin.Context) {
	var query models.RecipeQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	recipes, total, err := h.recipeService.SearchRecipes(&query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"recipes": recipes,
		"total":   total,
		"page":    query.Page,
		"limit":   query.Limit,
	})
}

// GetFeaturedRecipes godoc
// @Summary Get featured recipes
// @Description Get featured recipes with high ratings
// @Tags recipes
// @Produce json
// @Param limit query int false "Number of recipes to return" default(10)
// @Success 200 {object} map[string]interface{}
// @Router /recipes/featured [get]
func (h *RecipeHandler) GetFeaturedRecipes(c *gin.Context) {
	limitStr := c.DefaultQuery("limit", "10")
	limit, err := strconv.Atoi(limitStr)
	if err != nil {
		limit = 10
	}

	recipes, err := h.recipeService.GetFeaturedRecipes(limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"recipes": recipes})
}

// GetMyRecipes godoc
// @Summary Get user's recipes
// @Description Get current user's recipes
// @Tags recipes
// @Produce json
// @Security BearerAuth
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(20)
// @Success 200 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Router /recipes/my-recipes [get]
func (h *RecipeHandler) GetMyRecipes(c *gin.Context) {
	userID, exists := middleware.GetUserID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var query models.RecipeQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	recipes, total, err := h.recipeService.GetMyRecipes(userID, &query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"recipes": recipes,
		"total":   total,
		"page":    query.Page,
		"limit":   query.Limit,
	})
}

// FavoriteRecipe godoc
// @Summary Add recipe to favorites
// @Description Add a recipe to user's favorites
// @Tags recipes
// @Produce json
// @Security BearerAuth
// @Param id path string true "Recipe ID"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Router /recipes/{id}/favorite [post]
func (h *RecipeHandler) FavoriteRecipe(c *gin.Context) {
	userID, exists := middleware.GetUserID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	idStr := c.Param("id")
	recipeID, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid recipe ID"})
		return
	}

	if err := h.recipeService.FavoriteRecipe(userID, recipeID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Recipe added to favorites"})
}

// UnfavoriteRecipe godoc
// @Summary Remove recipe from favorites
// @Description Remove a recipe from user's favorites
// @Tags recipes
// @Produce json
// @Security BearerAuth
// @Param id path string true "Recipe ID"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Router /recipes/{id}/favorite [delete]
func (h *RecipeHandler) UnfavoriteRecipe(c *gin.Context) {
	userID, exists := middleware.GetUserID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	idStr := c.Param("id")
	recipeID, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid recipe ID"})
		return
	}

	if err := h.recipeService.UnfavoriteRecipe(userID, recipeID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Recipe removed from favorites"})
}

// GetFavorites godoc
// @Summary Get user's favorite recipes
// @Description Get current user's favorite recipes
// @Tags recipes
// @Produce json
// @Security BearerAuth
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(20)
// @Success 200 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Router /recipes/favorites [get]
func (h *RecipeHandler) GetFavorites(c *gin.Context) {
	userID, exists := middleware.GetUserID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var query models.RecipeQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	recipes, total, err := h.recipeService.GetFavorites(userID, &query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"recipes": recipes,
		"total":   total,
		"page":    query.Page,
		"limit":   query.Limit,
	})
}

// RateRecipe godoc
// @Summary Rate a recipe
// @Description Rate a recipe and optionally leave a review
// @Tags recipes
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Recipe ID"
// @Param request body models.RateRecipeRequest true "Rating data"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Router /recipes/{id}/rate [post]
func (h *RecipeHandler) RateRecipe(c *gin.Context) {
	userID, exists := middleware.GetUserID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	idStr := c.Param("id")
	recipeID, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid recipe ID"})
		return
	}

	var req models.RateRecipeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.validator.Struct(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.recipeService.RateRecipe(userID, recipeID, &req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Recipe rated successfully"})
}