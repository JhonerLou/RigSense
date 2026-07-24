package domain

import (
	"context"
	"time"

	"github.com/google/uuid"
)

type DeviceCategory string
type WorkloadIntensity string

const (
	CategoryPCDesktop DeviceCategory = "PC_DESKTOP"
	CategoryLaptop    DeviceCategory = "LAPTOP"
	CategoryMonitor   DeviceCategory = "MONITOR"
	CategoryKeyboard  DeviceCategory = "KEYBOARD"
	CategoryMouse     DeviceCategory = "MOUSE"
	CategoryHeadset   DeviceCategory = "HEADSET"

	WorkloadLight  WorkloadIntensity = "LIGHT"
	WorkloadMedium WorkloadIntensity = "MEDIUM"
	WorkloadHeavy  WorkloadIntensity = "HEAVY"
)

type Device struct {
	ID                uuid.UUID         `json:"id"`
	WorkspaceID       uuid.UUID         `json:"workspace_id"`
	Name              string            `json:"name"`
	Category          DeviceCategory    `json:"category"`
	WorkloadIntensity WorkloadIntensity `json:"workload_intensity"`
	PurchaseDate      *time.Time        `json:"purchase_date,omitempty"`
	EstimatedPrice    float64           `json:"estimated_price"`
	CreatedAt         time.Time         `json:"created_at"`
	AIHealthSummary   *string           `json:"ai_health_summary,omitempty"`
	LastAIAnalyzedAt  *time.Time        `json:"last_ai_analyzed_at,omitempty"`
}

type DeviceRepository interface {
	CreateWithParts(ctx context.Context, device *Device, parts []*DevicePart) error
	GetByID(ctx context.Context, id uuid.UUID) (*Device, error)
	GetByWorkspaceID(ctx context.Context, workspaceID uuid.UUID) ([]*Device, error)
	GetPartsByDeviceID(ctx context.Context, deviceID uuid.UUID) ([]*DevicePart, error)
	Update(ctx context.Context, device *Device) error
	Delete(ctx context.Context, id uuid.UUID) error
}

type DeviceUsecase interface {
	CreateDevice(ctx context.Context, userID string, req *CreateDeviceRequest) (*Device, error)
	GetDevice(ctx context.Context, id uuid.UUID, userID string) (*Device, error)
	ListDevicesByWorkspace(ctx context.Context, workspaceID uuid.UUID, userID string) ([]*Device, error)
}

type CreateDeviceRequest struct {
	WorkspaceID       uuid.UUID                 `json:"workspace_id" binding:"required"`
	Name              string                    `json:"name" binding:"required"`
	Category          DeviceCategory            `json:"category" binding:"required"`
	WorkloadIntensity WorkloadIntensity         `json:"workload_intensity"`
	PurchaseDate      *time.Time                `json:"purchase_date"`
	EstimatedPrice    float64                   `json:"estimated_price"`
	Parts             []CreateDevicePartRequest `json:"parts,omitempty"`
}

type CreateDevicePartRequest struct {
	PartType          PartType   `json:"part_type" binding:"required"`
	Name              string     `json:"name" binding:"required"`
	PurchaseDate      *time.Time `json:"purchase_date"`
	WarrantyExpiresAt *time.Time `json:"warranty_expires_at"`
}

type PartType string

const (
	PartTypeCPU         PartType = "CPU"
	PartTypeGPU         PartType = "GPU"
	PartTypeRAM         PartType = "RAM"
	PartTypeStorage     PartType = "STORAGE"
	PartTypePSU         PartType = "PSU"
	PartTypeCooler      PartType = "COOLER"
	PartTypeMotherboard PartType = "MOTHERBOARD"
)

type DevicePart struct {
	ID                uuid.UUID  `json:"id"`
	DeviceID          uuid.UUID  `json:"device_id"`
	PartType          PartType   `json:"part_type"`
	Name              string     `json:"name"`
	PurchaseDate      *time.Time `json:"purchase_date,omitempty"`
	WarrantyExpiresAt *time.Time `json:"warranty_expires_at,omitempty"`
	CreatedAt         time.Time  `json:"created_at"`
}
