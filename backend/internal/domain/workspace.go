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
}
