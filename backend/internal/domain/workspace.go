package domain

import (
	"context"
	"time"
)

// Workspace represents the workspace entity corresponding to the database schema.
type Workspace struct {
	ID              string    `json:"id"`
	UserID          string    `json:"user_id"`
	Name            string    `json:"name"`
	EnvironmentType string    `json:"environment_type"` // e.g., 'AC', 'NON_AC'
	DustLevel       string    `json:"dust_level"`       // e.g., 'LOW', 'MEDIUM', 'HIGH'
	CreatedAt       time.Time `json:"created_at"`
}

// CreateWorkspaceRequest represents the payload for creating a new workspace.
type CreateWorkspaceRequest struct {
	Name            string `json:"name" binding:"required,max=100"`
	EnvironmentType string `json:"environment_type" binding:"required,oneof=AC NON_AC"`
	DustLevel       string `json:"dust_level" binding:"required,oneof=LOW MEDIUM HIGH"`
}

// AITelemetryResponse represents the AI-generated real-time telemetry data.
type AITelemetryResponse struct {
	Temperature float64 `json:"temperature"`
	Humidity    float64 `json:"humidity"`
	DustLevel   float64 `json:"dust_level"`
	PowerUsage  float64 `json:"power_usage"`
	Timestamp   string  `json:"timestamp"`
}

// AIHealthScanResponse represents the predictive maintenance analysis.
type AIHealthScanResponse struct {
	OverallHealthScore int                       `json:"overall_health_score"` // 0-100
	Status             string                    `json:"status"`               // "Critical", "Warning", "Healthy"
	Issues             []string                  `json:"issues"`
	Predictions        []AIMaintenancePrediction `json:"predictions"`
}

// AIMaintenancePrediction represents a prediction for a single component/device.
type AIMaintenancePrediction struct {
	Component                  string `json:"component"`
	EstimatedDaysUntilFailure  int    `json:"estimated_days_until_failure"`
	RecommendedAction          string `json:"recommended_action"`
}

// WorkspaceRepository defines the data access contract for workspaces.
// Repositories should only receive and return domain models.
type WorkspaceRepository interface {
	Create(ctx context.Context, ws *Workspace) error
	GetByID(ctx context.Context, id string, userID string) (*Workspace, error)
	ListByUserID(ctx context.Context, userID string) ([]*Workspace, error)
	Delete(ctx context.Context, id string, userID string) error
}

// WorkspaceUsecase defines the business logic contract for workspaces.
// Usecases orchestrate the flow between HTTP delivery and repositories.
type WorkspaceUsecase interface {
	CreateWorkspace(ctx context.Context, userID string, req *CreateWorkspaceRequest) (*Workspace, error)
	GetWorkspace(ctx context.Context, id string, userID string) (*Workspace, error)
	ListUserWorkspaces(ctx context.Context, userID string) ([]*Workspace, error)
	DeleteWorkspace(ctx context.Context, id string, userID string) error
	GetAITelemetry(ctx context.Context, id string, userID string) (*AITelemetryResponse, error)
	GetAIHealthScan(ctx context.Context, id string, userID string) (*AIHealthScanResponse, error)
}
