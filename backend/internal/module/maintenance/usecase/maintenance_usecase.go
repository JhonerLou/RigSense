package usecase

import (
	"context"
	"fmt"
	"math"
	"time"

	"hardware-tracker-backend/internal/domain"

	"github.com/google/uuid"
)

type maintenanceUsecase struct {
	maintenanceRepo domain.MaintenanceRepository
	deviceRepo      domain.DeviceRepository
	workspaceRepo   domain.WorkspaceRepository
}

func NewMaintenanceUsecase(
	mRepo domain.MaintenanceRepository,
	dRepo domain.DeviceRepository,
	wRepo domain.WorkspaceRepository,
) domain.MaintenanceUsecase {
	return &maintenanceUsecase{
		maintenanceRepo: mRepo,
		deviceRepo:      dRepo,
		workspaceRepo:   wRepo,
	}
}

// calculateNextDueDate applies the predictive time algorithm
// Jika Device Workload HEAVY dan Workspace Dust Level HIGH, maka interval standar akan dikurangi.
func (u *maintenanceUsecase) calculateNextDueDate(
	baseMonths int,
	workload domain.WorkloadIntensity,
	dustLevel string,
	lastPerformed *time.Time,
) time.Time {
	// Base interval in months
	interval := float64(baseMonths)

	// Apply workload penalty
	if workload == domain.WorkloadHeavy {
		interval = interval * 0.75 // 25% reduction in time
	} else if workload == domain.WorkloadMedium {
		interval = interval * 0.90 // 10% reduction in time
	}

	// Apply dust penalty
	if dustLevel == "HIGH" {
		interval = interval * 0.75 // another 25% reduction
	} else if dustLevel == "MEDIUM" {
		interval = interval * 0.90 // another 10% reduction
	}

	// Calculate target start date
	var startDate time.Time
	if lastPerformed != nil {
		startDate = *lastPerformed
	} else {
		startDate = time.Now()
	}

	// Add the adjusted interval in days (approximate 30 days per month)
	daysToAdd := int(math.Round(interval * 30))
	return startDate.AddDate(0, 0, daysToAdd)
}

// evaluateStatus computes if a task is OK, DUE_SOON, or OVERDUE
func evaluateStatus(nextDueDate time.Time) domain.MaintenanceStatus {
	// Calculate total days remaining until the due date
	daysRemaining := int(time.Until(nextDueDate).Hours() / 24)
	
	if daysRemaining < 0 {
		return domain.MaintenanceStatusOverdue
	} else if daysRemaining <= 30 {
		return domain.MaintenanceStatusDueSoon
	}
	return domain.MaintenanceStatusOK
}

func (u *maintenanceUsecase) CreateTask(ctx context.Context, userID string, req *domain.CreateMaintenanceTaskRequest) (*domain.MaintenanceTask, error) {
	// 1. Fetch device to validate existence and get WorkloadIntensity
	device, err := u.deviceRepo.GetByID(ctx, req.DeviceID)
	if err != nil {
		return nil, fmt.Errorf("maintenanceUsecase: failed to fetch device: %w", err)
	}

	// 2. Fetch workspace for DustLevel and Security Ownership Validation
	workspace, err := u.workspaceRepo.GetByID(ctx, device.WorkspaceID.String(), userID)
	if err != nil {
		return nil, fmt.Errorf("maintenanceUsecase: unauthorized or workspace not found: %w", err)
	}

	// 3. Calculate Next Due Date based on the predictive algorithm
	nextDueDate := u.calculateNextDueDate(
		req.BaseIntervalMonths,
		device.WorkloadIntensity,
		workspace.DustLevel,
		nil, // Not performed yet since it's newly created
	)

	// 4. Initial status evaluation
	status := evaluateStatus(nextDueDate)

	task := &domain.MaintenanceTask{
		DeviceID:           req.DeviceID,
		TaskName:           req.TaskName,
		BaseIntervalMonths: req.BaseIntervalMonths,
		NextDueDate:        nextDueDate,
		RiskImpactCost:     req.RiskImpactCost,
		Status:             status,
	}

	// 5. Delegate persistence
	if err := u.maintenanceRepo.Create(ctx, task); err != nil {
		return nil, fmt.Errorf("maintenanceUsecase: repo create failed: %w", err)
	}

	return task, nil
}

func (u *maintenanceUsecase) ListTasksByDevice(ctx context.Context, userID string, deviceID uuid.UUID) ([]*domain.MaintenanceTask, error) {
	// Validation checks
	device, err := u.deviceRepo.GetByID(ctx, deviceID)
	if err != nil {
		return nil, fmt.Errorf("maintenanceUsecase: failed to fetch device: %w", err)
	}
	_, err = u.workspaceRepo.GetByID(ctx, device.WorkspaceID.String(), userID)
	if err != nil {
		return nil, fmt.Errorf("maintenanceUsecase: unauthorized: %w", err)
	}

	tasks, err := u.maintenanceRepo.ListByDeviceID(ctx, deviceID)
	if err != nil {
		return nil, err
	}

	return tasks, nil
}

func (u *maintenanceUsecase) RefreshTaskStatus(ctx context.Context, taskID uuid.UUID) (*domain.MaintenanceTask, error) {
	task, err := u.maintenanceRepo.GetByID(ctx, taskID)
	if err != nil {
		return nil, err
	}

	newStatus := evaluateStatus(task.NextDueDate)
	if newStatus != task.Status {
		task.Status = newStatus
		if err := u.maintenanceRepo.UpdateStatus(ctx, task.ID, newStatus); err != nil {
			return nil, err
		}
	}
	return task, nil
}

func (u *maintenanceUsecase) GetNextMaintenanceTarget(ctx context.Context, taskID uuid.UUID, userID string, lastPerformed time.Time) (time.Time, domain.MaintenanceStatus, error) {
	task, err := u.maintenanceRepo.GetByID(ctx, taskID)
	if err != nil {
		return time.Time{}, "", fmt.Errorf("maintenanceUsecase.GetNextMaintenanceTarget task: %w", err)
	}

	device, err := u.deviceRepo.GetByID(ctx, task.DeviceID)
	if err != nil {
		return time.Time{}, "", fmt.Errorf("maintenanceUsecase.GetNextMaintenanceTarget device: %w", err)
	}

	workspace, err := u.workspaceRepo.GetByID(ctx, device.WorkspaceID.String(), userID)
	if err != nil {
		return time.Time{}, "", fmt.Errorf("maintenanceUsecase.GetNextMaintenanceTarget workspace auth: %w", err)
	}

	nextDue := u.calculateNextDueDate(task.BaseIntervalMonths, device.WorkloadIntensity, workspace.DustLevel, &lastPerformed)
	status := evaluateStatus(nextDue)

	return nextDue, status, nil
}

