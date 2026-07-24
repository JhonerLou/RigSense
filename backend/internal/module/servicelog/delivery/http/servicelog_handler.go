package http

import (
	"net/http"

	"hardware-tracker-backend/internal/domain"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type ServiceLogHandler struct {
	usecase domain.ServiceLogUsecase
}

func NewServiceLogHandler(rg *gin.RouterGroup, usecase domain.ServiceLogUsecase) {
	handler := &ServiceLogHandler{
		usecase: usecase,
	}

	slGroup := rg.Group("/service-logs")
	{
		slGroup.POST("", handler.Create)
	}

	// Route to get logs by task
	taskLogGroup := rg.Group("/maintenance-tasks/:taskID/service-logs")
	{
		taskLogGroup.GET("", handler.ListByTask)
	}
}

func (h *ServiceLogHandler) Create(c *gin.Context) {
	userIDVal, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userID := userIDVal.(string)

	var req domain.CreateServiceLogRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload", "details": err.Error()})
		return
	}

	log, err := h.usecase.CreateServiceLog(c.Request.Context(), userID, &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": log})
}

func (h *ServiceLogHandler) ListByTask(c *gin.Context) {
	userIDVal, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userID := userIDVal.(string)

	taskIDStr := c.Param("taskID")
	taskID, err := uuid.Parse(taskIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid task ID format"})
		return
	}

	logs, err := h.usecase.ListServiceLogs(c.Request.Context(), userID, taskID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": logs})
}
