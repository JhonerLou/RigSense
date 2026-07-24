package repository

import (
	"context"
	"fmt"

	"hardware-tracker-backend/internal/domain"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type deviceRepository struct {
	db *pgxpool.Pool
}

func NewDeviceRepository(db *pgxpool.Pool) domain.DeviceRepository {
	return &deviceRepository{db: db}
}

func (r *deviceRepository) CreateWithParts(ctx context.Context, device *domain.Device, parts []*domain.DevicePart) error {
	// Start database transaction
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return fmt.Errorf("deviceRepository.CreateWithParts begin tx: %w", err)
	}
	// Automatically rollback if tx is not committed
	defer tx.Rollback(ctx)

	// Insert Device
	deviceQuery := `
		INSERT INTO devices (workspace_id, name, category, workload_intensity, purchase_date, estimated_price)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, created_at
	`
	err = tx.QueryRow(ctx, deviceQuery, 
		device.WorkspaceID, 
		device.Name, 
		device.Category, 
		device.WorkloadIntensity, 
		device.PurchaseDate, 
		device.EstimatedPrice,
	).Scan(&device.ID, &device.CreatedAt)

	if err != nil {
		return fmt.Errorf("deviceRepository.CreateWithParts insert device: %w", err)
	}

	// Insert Device Parts if provided
	if len(parts) > 0 {
		partQuery := `
			INSERT INTO device_parts (device_id, part_type, name, purchase_date, warranty_expires_at)
			VALUES ($1, $2, $3, $4, $5)
			RETURNING id, created_at
		`
		for _, part := range parts {
			part.DeviceID = device.ID // Ensure device ID is linked
			err = tx.QueryRow(ctx, partQuery,
				part.DeviceID,
				part.PartType,
				part.Name,
				part.PurchaseDate,
				part.WarrantyExpiresAt,
			).Scan(&part.ID, &part.CreatedAt)

			if err != nil {
				return fmt.Errorf("deviceRepository.CreateWithParts insert part: %w", err)
			}
		}
	}

	// Commit transaction. If successful, defer tx.Rollback() does nothing.
	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("deviceRepository.CreateWithParts commit tx: %w", err)
	}

	return nil
}

func (r *deviceRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.Device, error) {
	// To be implemented
	return nil, fmt.Errorf("not implemented")
}

func (r *deviceRepository) GetByWorkspaceID(ctx context.Context, workspaceID uuid.UUID) ([]*domain.Device, error) {
	query := `
		SELECT id, workspace_id, name, category, workload_intensity, purchase_date, estimated_price, created_at, ai_health_summary, last_ai_analyzed_at
		FROM devices
		WHERE workspace_id = $1
		ORDER BY created_at DESC
	`
	rows, err := r.db.Query(ctx, query, workspaceID)
	if err != nil {
		return nil, fmt.Errorf("deviceRepository.GetByWorkspaceID: %w", err)
	}
	defer rows.Close()

	var devices []*domain.Device
	for rows.Next() {
		dev := &domain.Device{}
		err := rows.Scan(
			&dev.ID, &dev.WorkspaceID, &dev.Name, &dev.Category, 
			&dev.WorkloadIntensity, &dev.PurchaseDate, &dev.EstimatedPrice, 
			&dev.CreatedAt, &dev.AIHealthSummary, &dev.LastAIAnalyzedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("deviceRepository.GetByWorkspaceID scan: %w", err)
		}
		devices = append(devices, dev)
	}

	if devices == nil {
		devices = make([]*domain.Device, 0)
	}
	return devices, nil
}

func (r *deviceRepository) Update(ctx context.Context, device *domain.Device) error {
	// To be implemented
	return fmt.Errorf("not implemented")
}

func (r *deviceRepository) Delete(ctx context.Context, id uuid.UUID) error {
	// To be implemented
	return fmt.Errorf("not implemented")
}
