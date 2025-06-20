package handlers

import (
	"net/http"
	"yummio-backend/internal/middleware"
	"yummio-backend/internal/models"
	"yummio-backend/internal/services"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
)

type CollectionHandler struct {
	collectionService services.CollectionService
	validator         *validator.Validate
}

func NewCollectionHandler(collectionService services.CollectionService) *CollectionHandler {
	return &CollectionHandler{
		collectionService: collectionService,
		validator:         validator.New(),
	}
}

// GetCollections godoc
// @Summary Get user's collections
// @Description Get current user's recipe collections
// @Tags collections
// @Produce json
// @Security BearerAuth
// @Success 200 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Router /collections [get]
func (h *CollectionHandler) GetCollections(c *gin.Context) {
	userID, exists := middleware.GetUserID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	collections, err := h.collectionService.GetCollections(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Convert to response format
	var responses []models.CollectionResponse
	for _, collection := range collections {
		responses = append(responses, collection.ToResponse())
	}

	c.JSON(http.StatusOK, gin.H{"collections": responses})
}

// CreateCollection godoc
// @Summary Create collection
// @Description Create a new recipe collection
// @Tags collections
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body models.CollectionCreateRequest true "Collection data"
// @Success 201 {object} models.Collection
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Router /collections [post]
func (h *CollectionHandler) CreateCollection(c *gin.Context) {
	userID, exists := middleware.GetUserID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var req models.CollectionCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.validator.Struct(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	collection, err := h.collectionService.CreateCollection(userID, &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, collection)
}

// GetCollection godoc
// @Summary Get collection by ID
// @Description Get a specific collection by its ID
// @Tags collections
// @Produce json
// @Security BearerAuth
// @Param id path string true "Collection ID"
// @Success 200 {object} models.Collection
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 403 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Router /collections/{id} [get]
func (h *CollectionHandler) GetCollection(c *gin.Context) {
	userID, exists := middleware.GetUserID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	idStr := c.Param("id")
	collectionID, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid collection ID"})
		return
	}

	collection, err := h.collectionService.GetCollection(userID, collectionID)
	if err != nil {
		if err.Error() == "unauthorized to access this collection" {
			c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusNotFound, gin.H{"error": "Collection not found"})
		return
	}

	c.JSON(http.StatusOK, collection)
}

// UpdateCollection godoc
// @Summary Update collection
// @Description Update an existing collection
// @Tags collections
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Collection ID"
// @Param request body models.CollectionUpdateRequest true "Collection data"
// @Success 200 {object} models.Collection
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 403 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Router /collections/{id} [put]
func (h *CollectionHandler) UpdateCollection(c *gin.Context) {
	userID, exists := middleware.GetUserID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	idStr := c.Param("id")
	collectionID, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid collection ID"})
		return
	}

	var req models.CollectionUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.validator.Struct(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	collection, err := h.collectionService.UpdateCollection(userID, collectionID, &req)
	if err != nil {
		if err.Error() == "unauthorized to update this collection" {
			c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, collection)
}

// DeleteCollection godoc
// @Summary Delete collection
// @Description Delete a collection
// @Tags collections
// @Produce json
// @Security BearerAuth
// @Param id path string true "Collection ID"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 403 {object} map[string]interface{}
// @Router /collections/{id} [delete]
func (h *CollectionHandler) DeleteCollection(c *gin.Context) {
	userID, exists := middleware.GetUserID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	idStr := c.Param("id")
	collectionID, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid collection ID"})
		return
	}

	if err := h.collectionService.DeleteCollection(userID, collectionID); err != nil {
		if err.Error() == "unauthorized to delete this collection" {
			c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Collection deleted successfully"})
}

// AddRecipeToCollection godoc
// @Summary Add recipe to collection
// @Description Add a recipe to a collection
// @Tags collections
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Collection ID"
// @Param request body models.AddRecipeToCollectionRequest true "Recipe ID"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 403 {object} map[string]interface{}
// @Router /collections/{id}/recipes [post]
func (h *CollectionHandler) AddRecipeToCollection(c *gin.Context) {
	userID, exists := middleware.GetUserID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	idStr := c.Param("id")
	collectionID, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid collection ID"})
		return
	}

	var req models.AddRecipeToCollectionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.validator.Struct(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.collectionService.AddRecipeToCollection(userID, collectionID, req.RecipeID); err != nil {
		if err.Error() == "unauthorized to modify this collection" {
			c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Recipe added to collection"})
}

// RemoveRecipeFromCollection godoc
// @Summary Remove recipe from collection
// @Description Remove a recipe from a collection
// @Tags collections
// @Produce json
// @Security BearerAuth
// @Param id path string true "Collection ID"
// @Param recipeId path string true "Recipe ID"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 403 {object} map[string]interface{}
// @Router /collections/{id}/recipes/{recipeId} [delete]
func (h *CollectionHandler) RemoveRecipeFromCollection(c *gin.Context) {
	userID, exists := middleware.GetUserID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	idStr := c.Param("id")
	collectionID, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid collection ID"})
		return
	}

	recipeIDStr := c.Param("recipeId")
	recipeID, err := uuid.Parse(recipeIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid recipe ID"})
		return
	}

	if err := h.collectionService.RemoveRecipeFromCollection(userID, collectionID, recipeID); err != nil {
		if err.Error() == "unauthorized to modify this collection" {
			c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Recipe removed from collection"})
}