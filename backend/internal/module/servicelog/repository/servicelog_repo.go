package repository

import (
	"context"
	"fmt"

	"hardware-tracker-backend/internal/domain"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type serviceLogRepository struct {
	db *pgxpool.Pool
}

func NewServiceLogRepository(db *pgxpool.Pool) domain.ServiceLogRepository {
	return &serviceLogRepository{db: db}
}

func (r *serviceLogRepository) CreateWithTaskUpdate(ctx context.Context, log *domain.ServiceLog, task *domain.MaintenanceTask) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return fmt.Errorf("serviceLogRepository begin tx: %w", err)
	}
	defer tx.Rollback(ctx)

	// 1. Insert Service Log
	logQuery := `
		INSERT INTO service_logs (task_id, performed_at, cost_spent, notes, receipt_image_url)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, created_at
	`
	err = tx.QueryRow(ctx, logQuery,
		log.TaskID, log.PerformedAt, log.CostSpent, log.Notes, log.ReceiptImageURL,
	).Scan(&log.ID, &log.CreatedAt)

	if err != nil {
		return fmt.Errorf("serviceLogRepository insert log: %w", err)
	}

	// 2. Update Maintenance Task
	taskQuery := `
		UPDATE maintenance_tasks
		SET last_performed_at = $1, next_due_date = $2, status = $3, updated_at = CURRENT_TIMESTAMP
		WHERE id = $4
		RETURNING updated_at
	`
	err = tx.QueryRow(ctx, taskQuery,
		task.LastPerformedAt, task.NextDueDate, task.Status, task.ID,
	).Scan(&task.UpdatedAt)

	if err != nil {
		return fmt.Errorf("serviceLogRepository update task: %w", err)
	}

	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("serviceLogRepository commit tx: %w", err)
	}

	return nil
}

func (r *serviceLogRepository) ListByTaskID(ctx context.Context, taskID uuid.UUID) ([]*domain.ServiceLog, error) {
	query := `
		SELECT id, task_id, performed_at, cost_spent, notes, receipt_image_url, created_at
		FROM service_logs
		WHERE task_id = $1
		ORDER BY performed_at DESC
	`
	rows, err := r.db.Query(ctx, query, taskID)
	if err != nil {
		return nil, fmt.Errorf("serviceLogRepository list: %w", err)
	}
	defer rows.Close()

	var logs []*domain.ServiceLog
	for rows.Next() {
		log := &domain.ServiceLog{}
		var receiptURL interface{}
		err := rows.Scan(
			&log.ID, &log.TaskID, &log.PerformedAt, &log.CostSpent,
			&log.Notes, &receiptURL, &log.CreatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("serviceLogRepository list scan: %w", err)
		}
		if receiptURL != nil {
			if s, ok := receiptURL.(string); ok {
				log.ReceiptImageURL = &s
			}
		}
		logs = append(logs, log)
	}

	if logs == nil {
		logs = make([]*domain.ServiceLog, 0)
	}
	return logs, nil
}
