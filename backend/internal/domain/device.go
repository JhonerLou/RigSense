package domain

import (
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
	Create(device *Device) error
	GetByID(id uuid.UUID) (*Device, error)
	GetByWorkspaceID(workspaceID uuid.UUID) ([]*Device, error)
	Update(device *Device) error
	Delete(id uuid.UUID) error
}

type DeviceUsecase interface {
	CreateDevice(req *CreateDeviceRequest) (*Device, error)
	GetDevice(id uuid.UUID) (*Device, error)
	ListDevicesByWorkspace(workspaceID uuid.UUID) ([]*Device, error)
}

type CreateDeviceRequest struct {
	WorkspaceID       uuid.UUID         `json:"workspace_id" binding:"required"`
	Name              string            `json:"name" binding:"required"`
	Category          DeviceCategory    `json:"category" binding:"required"`
	WorkloadIntensity WorkloadIntensity `json:"workload_intensity"`
	PurchaseDate      *time.Time        `json:"purchase_date"`
	EstimatedPrice    float64           `json:"estimated_price"`
}
