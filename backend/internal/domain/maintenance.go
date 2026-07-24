package domain

import (
	"context"
	"time"

	"github.com/google/uuid"
)

type MaintenanceStatus string

const (
	MaintenanceStatusOK      MaintenanceStatus = "OK"
	MaintenanceStatusDueSoon MaintenanceStatus = "DUE_SOON"
	MaintenanceStatusOverdue MaintenanceStatus = "OVERDUE"
)

type MaintenanceTask struct {
	ID                 uuid.UUID         `json:"id"`
	DeviceID           uuid.UUID         `json:"device_id"`
	TaskName           string            `json:"task_name"`
	BaseIntervalMonths int               `json:"base_interval_months"`
	LastPerformedAt    *time.Time        `json:"last_performed_at,omitempty"`
	NextDueDate        time.Time         `json:"next_due_date"`
	RiskImpactCost     float64           `json:"risk_impact_cost"`
	Status             MaintenanceStatus `json:"status"`
	AIRecommendations  *string           `json:"ai_recommendations,omitempty"` // JSON string representation
	UpdatedAt          time.Time         `json:"updated_at"`
}

type CreateMaintenanceTaskRequest struct {
	DeviceID           uuid.UUID `json:"device_id" binding:"required"`
	TaskName           string    `json:"task_name" binding:"required"`
	BaseIntervalMonths int       `json:"base_interval_months" binding:"required,min=1"`
	RiskImpactCost     float64   `json:"risk_impact_cost"`
}

type MaintenanceRepository interface {
	Create(ctx context.Context, task *MaintenanceTask) error
	GetByID(ctx context.Context, id uuid.UUID) (*MaintenanceTask, error)
	ListByDeviceID(ctx context.Context, deviceID uuid.UUID) ([]*MaintenanceTask, error)
	UpdateStatus(ctx context.Context, id uuid.UUID, status MaintenanceStatus) error
	Update(ctx context.Context, task *MaintenanceTask) error
}

type MaintenanceUsecase interface {
	CreateTask(ctx context.Context, userID string, req *CreateMaintenanceTaskRequest) (*MaintenanceTask, error)
	ListTasksByDevice(ctx context.Context, userID string, deviceID uuid.UUID) ([]*MaintenanceTask, error)
	RefreshTaskStatus(ctx context.Context, taskID uuid.UUID) (*MaintenanceTask, error) // Evaluates and updates status based on dates
	GetNextMaintenanceTarget(ctx context.Context, taskID uuid.UUID, userID string, lastPerformed time.Time) (time.Time, MaintenanceStatus, error)
}
