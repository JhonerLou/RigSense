package http

import (
	"net/http"

	"hardware-tracker-backend/internal/domain"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type AIHandler struct {
	usecase domain.AIUsecase
}

func NewAIHandler(rg *gin.RouterGroup, usecase domain.AIUsecase) {
	handler := &AIHandler{
		usecase: usecase,
	}

	aiGroup := rg.Group("/ai")
	{
		aiGroup.POST("/ocr-receipt", handler.AnalyzeReceipt)
		aiGroup.POST("/devices/:deviceID/health-summary", handler.GenerateHealthSummary)
	}
}

func (h *AIHandler) AnalyzeReceipt(c *gin.Context) {
	userIDVal, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userID := userIDVal.(string)

	var req domain.OCRReceiptRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload", "details": err.Error()})
		return
	}

	resp, err := h.usecase.AnalyzeReceipt(c.Request.Context(), userID, &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": resp})
}

func (h *AIHandler) GenerateHealthSummary(c *gin.Context) {
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

	resp, err := h.usecase.GenerateHealthSummary(c.Request.Context(), userID, deviceID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": resp})
}
