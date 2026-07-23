package http

import (
	"net/http"

	"hardware-tracker-backend/internal/domain"

	"github.com/gin-gonic/gin"
)

type WorkspaceHandler struct {
	usecase domain.WorkspaceUsecase
}

// NewWorkspaceHandler initializes the HTTP routes for workspace
// It expects a RouterGroup that is already protected by the AuthMiddleware
func NewWorkspaceHandler(rg *gin.RouterGroup, usecase domain.WorkspaceUsecase) {
	handler := &WorkspaceHandler{
		usecase: usecase,
	}

	// Register routes in the provided RouterGroup
	wsGroup := rg.Group("/workspaces")
	{
		wsGroup.POST("", handler.Create)
		wsGroup.GET("", handler.List)
		wsGroup.GET("/:id", handler.Get)
		wsGroup.DELETE("/:id", handler.Delete)
	}
}

// Create handles the creation of a new workspace
func (h *WorkspaceHandler) Create(c *gin.Context) {
	// Extract userID from context (set by AuthMiddleware)
	userIDVal, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userID := userIDVal.(string)

	var req domain.CreateWorkspaceRequest
	// ShouldBindJSON automatically applies validations defined in the struct (e.g. binding:"required")
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload", "details": err.Error()})
		return
	}

	ws, err := h.usecase.CreateWorkspace(c.Request.Context(), userID, &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": ws})
}

// List handles fetching all workspaces for the logged-in user
func (h *WorkspaceHandler) List(c *gin.Context) {
	userIDVal, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userID := userIDVal.(string)

	workspaces, err := h.usecase.ListUserWorkspaces(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": workspaces})
}

// Get handles fetching a specific workspace by ID
func (h *WorkspaceHandler) Get(c *gin.Context) {
	userIDVal, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userID := userIDVal.(string)
	
	id := c.Param("id")

	ws, err := h.usecase.GetWorkspace(c.Request.Context(), id, userID)
	if err != nil {
		// Depending on the exact error, this could be a 404 or 500, simplified here
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": ws})
}

// Delete handles removing a workspace
func (h *WorkspaceHandler) Delete(c *gin.Context) {
	userIDVal, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userID := userIDVal.(string)
	
	id := c.Param("id")

	err := h.usecase.DeleteWorkspace(c.Request.Context(), id, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Workspace deleted successfully"})
}
