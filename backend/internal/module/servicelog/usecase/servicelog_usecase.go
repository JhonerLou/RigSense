package usecase

import (
	"context"
	"fmt"
	"time"

	"hardware-tracker-backend/internal/domain"

	"github.com/google/uuid"
)

type serviceLogUsecase struct {
	logRepo       domain.ServiceLogRepository
	maintUsecase  domain.MaintenanceUsecase
	maintRepo     domain.MaintenanceRepository
}

func NewServiceLogUsecase(
	lRepo domain.ServiceLogRepository,
	mUsecase domain.MaintenanceUsecase,
	mRepo domain.MaintenanceRepository,
) domain.ServiceLogUsecase {
	return &serviceLogUsecase{
		logRepo:      lRepo,
		maintUsecase: mUsecase,
		maintRepo:    mRepo,
	}
}

func (u *serviceLogUsecase) CreateServiceLog(ctx context.Context, userID string, req *domain.CreateServiceLogRequest) (*domain.ServiceLog, error) {
	// 1. Fetch existing task
	task, err := u.maintRepo.GetByID(ctx, req.TaskID)
	if err != nil {
		return nil, fmt.Errorf("serviceLogUsecase: failed to fetch maintenance task: %w", err)
	}

	// 2. Trigger Business Logic (Milestone 1 algorithm) to recalculate next due date based on performed date
	nextDueDate, newStatus, err := u.maintUsecase.GetNextMaintenanceTarget(ctx, req.TaskID, userID, req.PerformedAt)
	if err != nil {
		return nil, fmt.Errorf("serviceLogUsecase: failed to recalculate next due date (or auth failed): %w", err)
	}

	// Update task in-memory before passing to repository transaction
	task.LastPerformedAt = &req.PerformedAt
	task.NextDueDate = nextDueDate
	task.Status = newStatus

	// 3. Create Service Log payload
	log := &domain.ServiceLog{
		TaskID:          req.TaskID,
		PerformedAt:     req.PerformedAt,
		CostSpent:       req.CostSpent,
		Notes:           req.Notes,
		ReceiptImageURL: req.ReceiptImageURL,
	}

	// 4. Delegate to repository to insert log and update task atomically
	if err := u.logRepo.CreateWithTaskUpdate(ctx, log, task); err != nil {
		return nil, fmt.Errorf("serviceLogUsecase transaction failed: %w", err)
	}

	return log, nil
}

func (u *serviceLogUsecase) ListServiceLogs(ctx context.Context, userID string, taskID uuid.UUID) ([]*domain.ServiceLog, error) {
	// Simple validation to check if user has access to this task (Authorization check)
	// We reuse GetNextMaintenanceTarget just for its internal security validation up to the workspace
	_, _, err := u.maintUsecase.GetNextMaintenanceTarget(ctx, taskID, userID, time.Now())
	if err != nil {
		return nil, fmt.Errorf("serviceLogUsecase: unauthorized or task not found: %w", err)
	}

	logs, err := u.logRepo.ListByTaskID(ctx, taskID)
	if err != nil {
		return nil, fmt.Errorf("serviceLogUsecase list failed: %w", err)
	}

	return logs, nil
}
