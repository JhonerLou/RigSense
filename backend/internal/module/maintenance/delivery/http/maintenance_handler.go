package http

import (
	"net/http"

	"hardware-tracker-backend/internal/domain"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type MaintenanceHandler struct {
	usecase domain.MaintenanceUsecase
}

func NewMaintenanceHandler(rg *gin.RouterGroup, usecase domain.MaintenanceUsecase) {
	handler := &MaintenanceHandler{
		usecase: usecase,
	}

	mGroup := rg.Group("/maintenance-tasks")
	{
		mGroup.POST("", handler.Create)
	}

	// Route to get tasks by device
	devMGroup := rg.Group("/devices/:deviceID/maintenance-tasks")
	{
		devMGroup.GET("", handler.ListByDevice)
	}
}

func (h *MaintenanceHandler) Create(c *gin.Context) {
	userIDVal, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userID := userIDVal.(string)

	var req domain.CreateMaintenanceTaskRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload", "details": err.Error()})
		return
	}

	task, err := h.usecase.CreateTask(c.Request.Context(), userID, &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": task})
}

func (h *MaintenanceHandler) ListByDevice(c *gin.Context) {
	userIDVal, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userID := userIDVal.(string)

	deviceIDStr := c.Param("deviceID")
	deviceID, err := uuid.Parse(deviceIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid device ID format"})
		return
	}

	tasks, err := h.usecase.ListTasksByDevice(c.Request.Context(), userID, deviceID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": tasks})
}
