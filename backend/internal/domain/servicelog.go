package domain

import (
	"context"
	"time"

	"github.com/google/uuid"
)

type ServiceLog struct {
	ID              uuid.UUID  `json:"id"`
	TaskID          uuid.UUID  `json:"task_id"`
	PerformedAt     time.Time  `json:"performed_at"`
	CostSpent       float64    `json:"cost_spent"`
	Notes           string     `json:"notes"`
	ReceiptImageURL *string    `json:"receipt_image_url,omitempty"`
	CreatedAt       time.Time  `json:"created_at"`
}

type CreateServiceLogRequest struct {
	TaskID          uuid.UUID `json:"task_id" binding:"required"`
	PerformedAt     time.Time `json:"performed_at" binding:"required"`
	CostSpent       float64   `json:"cost_spent"`
	Notes           string    `json:"notes"`
	ReceiptImageURL *string   `json:"receipt_image_url,omitempty"`
}

type ServiceLogRepository interface {
	CreateWithTaskUpdate(ctx context.Context, log *ServiceLog, task *MaintenanceTask) error
	ListByTaskID(ctx context.Context, taskID uuid.UUID) ([]*ServiceLog, error)
}

type ServiceLogUsecase interface {
	CreateServiceLog(ctx context.Context, userID string, req *CreateServiceLogRequest) (*ServiceLog, error)
	ListServiceLogs(ctx context.Context, userID string, taskID uuid.UUID) ([]*ServiceLog, error)
}
