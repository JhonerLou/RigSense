package domain

import (
	"context"

	"github.com/google/uuid"
)

type OCRReceiptRequest struct {
	Base64Image string `json:"base64_image" binding:"required"`
	MimeType    string `json:"mime_type" binding:"required"` // e.g. "image/jpeg"
}

type OCRReceiptResponse struct {
	TotalCost float64 `json:"total_cost"`
}

type AIHealthSummaryResponse struct {
	Recommendation string `json:"recommendation"`
}

type AIUsecase interface {
	AnalyzeReceipt(ctx context.Context, userID string, req *OCRReceiptRequest) (*OCRReceiptResponse, error)
	GenerateHealthSummary(ctx context.Context, userID string, deviceID uuid.UUID) (*AIHealthSummaryResponse, error)
}
