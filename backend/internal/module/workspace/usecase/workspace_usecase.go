package usecase

import (
	"context"
	"fmt"

	"hardware-tracker-backend/internal/domain"
)

type workspaceUsecase struct {
	repo domain.WorkspaceRepository
}

// NewWorkspaceUsecase creates a new instance of WorkspaceUsecase
// Zero Dependency Inversion Leak: We only accept the domain.WorkspaceRepository interface here.
func NewWorkspaceUsecase(repo domain.WorkspaceRepository) domain.WorkspaceUsecase {
	return &workspaceUsecase{
		repo: repo,
	}
}

func (u *workspaceUsecase) CreateWorkspace(ctx context.Context, userID string, req *domain.CreateWorkspaceRequest) (*domain.Workspace, error) {
	// Basic business validation
	if userID == "" {
		return nil, fmt.Errorf("workspaceUsecase.CreateWorkspace: user ID is required")
	}

	// Map request payload to pure domain entity
	ws := &domain.Workspace{
		UserID:          userID,
		Name:            req.Name,
		EnvironmentType: req.EnvironmentType,
		DustLevel:       req.DustLevel,
	}

	// Delegate persistence to the repository layer
	if err := u.repo.Create(ctx, ws); err != nil {
		return nil, fmt.Errorf("workspaceUsecase.CreateWorkspace repo.Create: %w", err)
	}

	return ws, nil
}

func (u *workspaceUsecase) GetWorkspace(ctx context.Context, id string, userID string) (*domain.Workspace, error) {
	if id == "" || userID == "" {
		return nil, fmt.Errorf("workspaceUsecase.GetWorkspace: ID and userID are required")
	}

	ws, err := u.repo.GetByID(ctx, id, userID)
	if err != nil {
		return nil, fmt.Errorf("workspaceUsecase.GetWorkspace repo.GetByID: %w", err)
	}

	return ws, nil
}

func (u *workspaceUsecase) ListUserWorkspaces(ctx context.Context, userID string) ([]*domain.Workspace, error) {
	if userID == "" {
		return nil, fmt.Errorf("workspaceUsecase.ListUserWorkspaces: user ID is required")
	}

	workspaces, err := u.repo.ListByUserID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("workspaceUsecase.ListUserWorkspaces repo.ListByUserID: %w", err)
	}

	return workspaces, nil
}

func (u *workspaceUsecase) DeleteWorkspace(ctx context.Context, id string, userID string) error {
	if id == "" || userID == "" {
		return fmt.Errorf("workspaceUsecase.DeleteWorkspace: ID and userID are required")
	}

	err := u.repo.Delete(ctx, id, userID)
	if err != nil {
		return fmt.Errorf("workspaceUsecase.DeleteWorkspace repo.Delete: %w", err)
	}

	return nil
}
