package repository

import (
	"context"
	"fmt"

	"hardware-tracker-backend/internal/domain"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type maintenanceRepository struct {
	db *pgxpool.Pool
}

func NewMaintenanceRepository(db *pgxpool.Pool) domain.MaintenanceRepository {
	return &maintenanceRepository{db: db}
}

func (r *maintenanceRepository) Create(ctx context.Context, task *domain.MaintenanceTask) error {
	query := `
		INSERT INTO maintenance_tasks (device_id, task_name, base_interval_months, last_performed_at, next_due_date, risk_impact_cost, status)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, updated_at
	`
	err := r.db.QueryRow(ctx, query,
		task.DeviceID,
		task.TaskName,
		task.BaseIntervalMonths,
		task.LastPerformedAt,
		task.NextDueDate,
		task.RiskImpactCost,
		task.Status,
	).Scan(&task.ID, &task.UpdatedAt)

	if err != nil {
		return fmt.Errorf("maintenanceRepository.Create: %w", err)
	}

	return nil
}

func (r *maintenanceRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.MaintenanceTask, error) {
	query := `
		SELECT id, device_id, task_name, base_interval_months, last_performed_at, next_due_date, risk_impact_cost, status, ai_recommendations, updated_at
		FROM maintenance_tasks
		WHERE id = $1
	`
	task := &domain.MaintenanceTask{}
	var aiRecs interface{}
	err := r.db.QueryRow(ctx, query, id).Scan(
		&task.ID, &task.DeviceID, &task.TaskName, &task.BaseIntervalMonths,
		&task.LastPerformedAt, &task.NextDueDate, &task.RiskImpactCost,
		&task.Status, &aiRecs, &task.UpdatedAt,
	)

	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, fmt.Errorf("maintenanceRepository.GetByID: task not found")
		}
		return nil, fmt.Errorf("maintenanceRepository.GetByID: %w", err)
	}

	if aiRecs != nil {
		if s, ok := aiRecs.(string); ok {
			task.AIRecommendations = &s
		}
	}

	return task, nil
}

func (r *maintenanceRepository) ListByDeviceID(ctx context.Context, deviceID uuid.UUID) ([]*domain.MaintenanceTask, error) {
	query := `
		SELECT id, device_id, task_name, base_interval_months, last_performed_at, next_due_date, risk_impact_cost, status, ai_recommendations, updated_at
		FROM maintenance_tasks
		WHERE device_id = $1
		ORDER BY next_due_date ASC
	`
	rows, err := r.db.Query(ctx, query, deviceID)
	if err != nil {
		return nil, fmt.Errorf("maintenanceRepository.ListByDeviceID: %w", err)
	}
	defer rows.Close()

	var tasks []*domain.MaintenanceTask
	for rows.Next() {
		task := &domain.MaintenanceTask{}
		var aiRecs interface{}
		err := rows.Scan(
			&task.ID, &task.DeviceID, &task.TaskName, &task.BaseIntervalMonths,
			&task.LastPerformedAt, &task.NextDueDate, &task.RiskImpactCost,
			&task.Status, &aiRecs, &task.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("maintenanceRepository.ListByDeviceID scan: %w", err)
		}
		if aiRecs != nil {
			if s, ok := aiRecs.(string); ok {
				task.AIRecommendations = &s
			}
		}
		tasks = append(tasks, task)
	}

	if tasks == nil {
		tasks = make([]*domain.MaintenanceTask, 0)
	}
	return tasks, nil
}

func (r *maintenanceRepository) UpdateStatus(ctx context.Context, id uuid.UUID, status domain.MaintenanceStatus) error {
	query := `
		UPDATE maintenance_tasks
		SET status = $1, updated_at = CURRENT_TIMESTAMP
		WHERE id = $2
	`
	commandTag, err := r.db.Exec(ctx, query, status, id)
	if err != nil {
		return fmt.Errorf("maintenanceRepository.UpdateStatus: %w", err)
	}
	if commandTag.RowsAffected() == 0 {
		return fmt.Errorf("maintenanceRepository.UpdateStatus: task not found")
	}
	return nil
}

func (r *maintenanceRepository) Update(ctx context.Context, task *domain.MaintenanceTask) error {
	query := `
		UPDATE maintenance_tasks
		SET last_performed_at = $1, next_due_date = $2, status = $3, ai_recommendations = $4, updated_at = CURRENT_TIMESTAMP
		WHERE id = $5
		RETURNING updated_at
	`
	err := r.db.QueryRow(ctx, query,
		task.LastPerformedAt, task.NextDueDate, task.Status, task.AIRecommendations, task.ID,
	).Scan(&task.UpdatedAt)

	if err != nil {
		return fmt.Errorf("maintenanceRepository.Update: %w", err)
	}
	return nil
}
