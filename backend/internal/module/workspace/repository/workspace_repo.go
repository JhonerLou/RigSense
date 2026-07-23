package repository

import (
	"context"
	"fmt"

	"hardware-tracker-backend/internal/domain"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type workspaceRepository struct {
	db *pgxpool.Pool
}

// NewWorkspaceRepository creates a new instance of WorkspaceRepository
func NewWorkspaceRepository(db *pgxpool.Pool) domain.WorkspaceRepository {
	return &workspaceRepository{
		db: db,
	}
}

func (r *workspaceRepository) Create(ctx context.Context, ws *domain.Workspace) error {
	// Parameterized query to prevent SQL Injection
	query := `
		INSERT INTO workspaces (user_id, name, environment_type, dust_level)
		VALUES ($1, $2, $3, $4)
		RETURNING id, created_at
	`
	
	err := r.db.QueryRow(ctx, query, ws.UserID, ws.Name, ws.EnvironmentType, ws.DustLevel).
		Scan(&ws.ID, &ws.CreatedAt)
	
	if err != nil {
		// Wrap errors with context as specified in rules
		return fmt.Errorf("workspaceRepository.Create: %w", err)
	}
	
	return nil
}

func (r *workspaceRepository) GetByID(ctx context.Context, id string, userID string) (*domain.Workspace, error) {
	query := `
		SELECT id, user_id, name, environment_type, dust_level, created_at
		FROM workspaces
		WHERE id = $1 AND user_id = $2
	`
	
	ws := &domain.Workspace{}
	err := r.db.QueryRow(ctx, query, id, userID).Scan(
		&ws.ID, &ws.UserID, &ws.Name, &ws.EnvironmentType, &ws.DustLevel, &ws.CreatedAt,
	)
	
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, fmt.Errorf("workspaceRepository.GetByID: workspace not found")
		}
		return nil, fmt.Errorf("workspaceRepository.GetByID: %w", err)
	}
	
	return ws, nil
}

func (r *workspaceRepository) ListByUserID(ctx context.Context, userID string) ([]*domain.Workspace, error) {
	query := `
		SELECT id, user_id, name, environment_type, dust_level, created_at
		FROM workspaces
		WHERE user_id = $1
		ORDER BY created_at DESC
	`
	
	rows, err := r.db.Query(ctx, query, userID)
	if err != nil {
		return nil, fmt.Errorf("workspaceRepository.ListByUserID: %w", err)
	}
	defer rows.Close()
	
	var workspaces []*domain.Workspace
	for rows.Next() {
		ws := &domain.Workspace{}
		if err := rows.Scan(&ws.ID, &ws.UserID, &ws.Name, &ws.EnvironmentType, &ws.DustLevel, &ws.CreatedAt); err != nil {
			return nil, fmt.Errorf("workspaceRepository.ListByUserID scan: %w", err)
		}
		workspaces = append(workspaces, ws)
	}
	
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("workspaceRepository.ListByUserID iteration: %w", err)
	}
	
	// Guarantee we return an empty array instead of nil in JSON responses
	if workspaces == nil {
		workspaces = make([]*domain.Workspace, 0)
	}
	
	return workspaces, nil
}

func (r *workspaceRepository) Delete(ctx context.Context, id string, userID string) error {
	query := `
		DELETE FROM workspaces
		WHERE id = $1 AND user_id = $2
	`
	
	commandTag, err := r.db.Exec(ctx, query, id, userID)
	if err != nil {
		return fmt.Errorf("workspaceRepository.Delete: %w", err)
	}
	
	if commandTag.RowsAffected() == 0 {
		return fmt.Errorf("workspaceRepository.Delete: workspace not found or not owned by user")
	}
	
	return nil
}
