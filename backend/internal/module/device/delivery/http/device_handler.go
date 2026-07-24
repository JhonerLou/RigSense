package http

import (
	"net/http"

	"hardware-tracker-backend/internal/domain"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type DeviceHandler struct {
	usecase domain.DeviceUsecase
}

// NewDeviceHandler initializes routes for devices
func NewDeviceHandler(rg *gin.RouterGroup, usecase domain.DeviceUsecase) {
	handler := &DeviceHandler{
		usecase: usecase,
	}

	// Routes under /api/devices
	devGroup := rg.Group("/devices")
	{
		devGroup.POST("", handler.Create)
	}

	// Routes under /api/workspaces/:workspaceID/devices
	wsDevGroup := rg.Group("/workspaces/:workspaceID/devices")
	{
		wsDevGroup.GET("", handler.ListByWorkspace)
	}
}

// Create handles device creation including its parts
func (h *DeviceHandler) Create(c *gin.Context) {
	userIDVal, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userID := userIDVal.(string)

	var req domain.CreateDeviceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload", "details": err.Error()})
		return
	}

	device, err := h.usecase.CreateDevice(c.Request.Context(), userID, &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": device})
}

// ListByWorkspace fetches all devices under a specific workspace
func (h *DeviceHandler) ListByWorkspace(c *gin.Context) {
	userIDVal, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userID := userIDVal.(string)

	wsIDStr := c.Param("workspaceID")
	workspaceID, err := uuid.Parse(wsIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid workspace ID format"})
		return
	}

	devices, err := h.usecase.ListDevicesByWorkspace(c.Request.Context(), workspaceID, userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": devices})
}
