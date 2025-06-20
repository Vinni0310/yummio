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

type ShoppingListHandler struct {
	shoppingListService services.ShoppingListService
	validator           *validator.Validate
}

func NewShoppingListHandler(shoppingListService services.ShoppingListService) *ShoppingListHandler {
	return &ShoppingListHandler{
		shoppingListService: shoppingListService,
		validator:           validator.New(),
	}
}

// GetShoppingLists godoc
// @Summary Get user's shopping lists
// @Description Get current user's shopping lists
// @Tags shopping-lists
// @Produce json
// @Security BearerAuth
// @Success 200 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Router /shopping-lists [get]
func (h *ShoppingListHandler) GetShoppingLists(c *gin.Context) {
	userID, exists := middleware.GetUserID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	lists, err := h.shoppingListService.GetShoppingLists(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Convert to response format
	var responses []models.ShoppingListResponse
	for _, list := range lists {
		responses = append(responses, list.ToResponse())
	}

	c.JSON(http.StatusOK, gin.H{"shopping_lists": responses})
}

// CreateShoppingList godoc
// @Summary Create shopping list
// @Description Create a new shopping list
// @Tags shopping-lists
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body models.ShoppingListCreateRequest true "Shopping list data"
// @Success 201 {object} models.ShoppingList
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Router /shopping-lists [post]
func (h *ShoppingListHandler) CreateShoppingList(c *gin.Context) {
	userID, exists := middleware.GetUserID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var req models.ShoppingListCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.validator.Struct(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	list, err := h.shoppingListService.CreateShoppingList(userID, &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, list)
}

// GetShoppingList godoc
// @Summary Get shopping list by ID
// @Description Get a specific shopping list by its ID
// @Tags shopping-lists
// @Produce json
// @Security BearerAuth
// @Param id path string true "Shopping list ID"
// @Success 200 {object} models.ShoppingList
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 403 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Router /shopping-lists/{id} [get]
func (h *ShoppingListHandler) GetShoppingList(c *gin.Context) {
	userID, exists := middleware.GetUserID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	idStr := c.Param("id")
	listID, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid shopping list ID"})
		return
	}

	list, err := h.shoppingListService.GetShoppingList(userID, listID)
	if err != nil {
		if err.Error() == "unauthorized to access this shopping list" {
			c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusNotFound, gin.H{"error": "Shopping list not found"})
		return
	}

	c.JSON(http.StatusOK, list)
}

// UpdateShoppingList godoc
// @Summary Update shopping list
// @Description Update an existing shopping list
// @Tags shopping-lists
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Shopping list ID"
// @Param request body models.ShoppingListUpdateRequest true "Shopping list data"
// @Success 200 {object} models.ShoppingList
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 403 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Router /shopping-lists/{id} [put]
func (h *ShoppingListHandler) UpdateShoppingList(c *gin.Context) {
	userID, exists := middleware.GetUserID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	idStr := c.Param("id")
	listID, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid shopping list ID"})
		return
	}

	var req models.ShoppingListUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.validator.Struct(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	list, err := h.shoppingListService.UpdateShoppingList(userID, listID, &req)
	if err != nil {
		if err.Error() == "unauthorized to update this shopping list" {
			c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, list)
}

// DeleteShoppingList godoc
// @Summary Delete shopping list
// @Description Delete a shopping list
// @Tags shopping-lists
// @Produce json
// @Security BearerAuth
// @Param id path string true "Shopping list ID"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 403 {object} map[string]interface{}
// @Router /shopping-lists/{id} [delete]
func (h *ShoppingListHandler) DeleteShoppingList(c *gin.Context) {
	userID, exists := middleware.GetUserID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	idStr := c.Param("id")
	listID, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid shopping list ID"})
		return
	}

	if err := h.shoppingListService.DeleteShoppingList(userID, listID); err != nil {
		if err.Error() == "unauthorized to delete this shopping list" {
			c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Shopping list deleted successfully"})
}

// AddItem godoc
// @Summary Add item to shopping list
// @Description Add a new item to a shopping list
// @Tags shopping-lists
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Shopping list ID"
// @Param request body models.ShoppingListItemCreateRequest true "Item data"
// @Success 201 {object} models.ShoppingListItem
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 403 {object} map[string]interface{}
// @Router /shopping-lists/{id}/items [post]
func (h *ShoppingListHandler) AddItem(c *gin.Context) {
	userID, exists := middleware.GetUserID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	idStr := c.Param("id")
	listID, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid shopping list ID"})
		return
	}

	var req models.ShoppingListItemCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.validator.Struct(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	item, err := h.shoppingListService.AddItem(userID, listID, &req)
	if err != nil {
		if err.Error() == "unauthorized to modify this shopping list" {
			c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, item)
}

// UpdateItem godoc
// @Summary Update shopping list item
// @Description Update an existing shopping list item
// @Tags shopping-lists
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Shopping list ID"
// @Param itemId path string true "Item ID"
// @Param request body models.ShoppingListItemUpdateRequest true "Item data"
// @Success 200 {object} models.ShoppingListItem
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 403 {object} map[string]interface{}
// @Router /shopping-lists/{id}/items/{itemId} [put]
func (h *ShoppingListHandler) UpdateItem(c *gin.Context) {
	userID, exists := middleware.GetUserID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	idStr := c.Param("id")
	listID, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid shopping list ID"})
		return
	}

	itemIDStr := c.Param("itemId")
	itemID, err := uuid.Parse(itemIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid item ID"})
		return
	}

	var req models.ShoppingListItemUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.validator.Struct(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	item, err := h.shoppingListService.UpdateItem(userID, listID, itemID, &req)
	if err != nil {
		if err.Error() == "unauthorized to modify this shopping list" {
			c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, item)
}

// DeleteItem godoc
// @Summary Delete shopping list item
// @Description Delete an item from a shopping list
// @Tags shopping-lists
// @Produce json
// @Security BearerAuth
// @Param id path string true "Shopping list ID"
// @Param itemId path string true "Item ID"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 403 {object} map[string]interface{}
// @Router /shopping-lists/{id}/items/{itemId} [delete]
func (h *ShoppingListHandler) DeleteItem(c *gin.Context) {
	userID, exists := middleware.GetUserID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	idStr := c.Param("id")
	listID, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid shopping list ID"})
		return
	}

	itemIDStr := c.Param("itemId")
	itemID, err := uuid.Parse(itemIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid item ID"})
		return
	}

	if err := h.shoppingListService.DeleteItem(userID, listID, itemID); err != nil {
		if err.Error() == "unauthorized to modify this shopping list" {
			c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Item deleted successfully"})
}