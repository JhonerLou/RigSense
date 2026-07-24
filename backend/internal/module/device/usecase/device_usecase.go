package usecase

import (
	"context"
	"fmt"

	"hardware-tracker-backend/internal/domain"

	"github.com/google/uuid"
)

type deviceUsecase struct {
	deviceRepo    domain.DeviceRepository
	workspaceRepo domain.WorkspaceRepository
}

func NewDeviceUsecase(dRepo domain.DeviceRepository, wRepo domain.WorkspaceRepository) domain.DeviceUsecase {
	return &deviceUsecase{
		deviceRepo:    dRepo,
		workspaceRepo: wRepo,
	}
}

func (u *deviceUsecase) CreateDevice(ctx context.Context, userID string, req *domain.CreateDeviceRequest) (*domain.Device, error) {
	// 1. Validate if workspace belongs to the logged-in user (Security / Authorization)
	wsIDStr := req.WorkspaceID.String()
	_, err := u.workspaceRepo.GetByID(ctx, wsIDStr, userID)
	if err != nil {
		return nil, fmt.Errorf("deviceUsecase.CreateDevice workspace validation: unauthorized or not found: %w", err)
	}

	// 2. Map payload to Device Entity
	device := &domain.Device{
		WorkspaceID:       req.WorkspaceID,
		Name:              req.Name,
		Category:          req.Category,
		WorkloadIntensity: req.WorkloadIntensity,
		PurchaseDate:      req.PurchaseDate,
		EstimatedPrice:    req.EstimatedPrice,
	}

	// 3. Map device parts
	var parts []*domain.DevicePart
	for _, pReq := range req.Parts {
		part := &domain.DevicePart{
			PartType:          pReq.PartType,
			Name:              pReq.Name,
			PurchaseDate:      pReq.PurchaseDate,
			WarrantyExpiresAt: pReq.WarrantyExpiresAt,
		}
		parts = append(parts, part)
	}

	// 4. Delegate to repository (which handles ACID tx)
	if err := u.deviceRepo.CreateWithParts(ctx, device, parts); err != nil {
		return nil, fmt.Errorf("deviceUsecase.CreateDevice db error: %w", err)
	}

	return device, nil
}

func (u *deviceUsecase) GetDevice(ctx context.Context, id uuid.UUID, userID string) (*domain.Device, error) {
	// Dummy for now, would typically fetch device, then check if its workspace belongs to userID
	return nil, fmt.Errorf("not implemented")
}

func (u *deviceUsecase) ListDevicesByWorkspace(ctx context.Context, workspaceID uuid.UUID, userID string) ([]*domain.Device, error) {
	// 1. Security check: does this workspace belong to the user?
	wsIDStr := workspaceID.String()
	_, err := u.workspaceRepo.GetByID(ctx, wsIDStr, userID)
	if err != nil {
		return nil, fmt.Errorf("deviceUsecase.ListDevicesByWorkspace workspace validation: %w", err)
	}

	// 2. Fetch devices
	devices, err := u.deviceRepo.GetByWorkspaceID(ctx, workspaceID)
	if err != nil {
		return nil, fmt.Errorf("deviceUsecase.ListDevicesByWorkspace repo error: %w", err)
	}

	return devices, nil
}
