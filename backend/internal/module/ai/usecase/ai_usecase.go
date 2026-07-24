package usecase

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"hardware-tracker-backend/internal/domain"
	"hardware-tracker-backend/internal/pkg/ai"

	"github.com/google/uuid"
)

type aiUsecase struct {
	geminiClient  ai.GeminiClient
	deviceRepo    domain.DeviceRepository
	workspaceRepo domain.WorkspaceRepository
}

func NewAIUsecase(gClient ai.GeminiClient, dRepo domain.DeviceRepository, wRepo domain.WorkspaceRepository) domain.AIUsecase {
	return &aiUsecase{
		geminiClient:  gClient,
		deviceRepo:    dRepo,
		workspaceRepo: wRepo,
	}
}

func (u *aiUsecase) AnalyzeReceipt(ctx context.Context, userID string, req *domain.OCRReceiptRequest) (*domain.OCRReceiptResponse, error) {
	// Remove data URL scheme if present (e.g. data:image/jpeg;base64,...)
	b64Data := req.Base64Image
	if idx := strings.Index(b64Data, ","); idx != -1 {
		b64Data = b64Data[idx+1:]
	}

	imgBytes, err := base64.StdEncoding.DecodeString(b64Data)
	if err != nil {
		return nil, fmt.Errorf("aiUsecase: failed to decode base64 image: %w", err)
	}

	prompt := `Analyze this receipt. Extract the grand total cost as a number. 
Respond ONLY with a valid JSON object in this exact format: {"total_cost": 123.45}`

	respText, err := u.geminiClient.GenerateContentFromImage(ctx, prompt, req.MimeType, imgBytes)
	if err != nil {
		return nil, fmt.Errorf("aiUsecase: gemini generate failed: %w", err)
	}

	// Clean up markdown code blocks if gemini returns them
	respText = strings.TrimPrefix(respText, "```json\n")
	respText = strings.TrimPrefix(respText, "```json")
	respText = strings.TrimSuffix(respText, "\n```")
	respText = strings.TrimSuffix(respText, "```")
	respText = strings.TrimSpace(respText)

	var resp domain.OCRReceiptResponse
	if err := json.Unmarshal([]byte(respText), &resp); err != nil {
		return nil, fmt.Errorf("aiUsecase: failed to parse gemini json response: %w. Raw: %s", err, respText)
	}

	return &resp, nil
}

func (u *aiUsecase) GenerateHealthSummary(ctx context.Context, userID string, deviceID uuid.UUID) (*domain.AIHealthSummaryResponse, error) {
	device, err := u.deviceRepo.GetByID(ctx, deviceID)
	if err != nil {
		return nil, fmt.Errorf("aiUsecase: failed to get device: %w", err)
	}

	// Auth check: get workspace
	_, err = u.workspaceRepo.GetByID(ctx, device.WorkspaceID.String(), userID)
	if err != nil {
		return nil, fmt.Errorf("aiUsecase: unauthorized or workspace not found: %w", err)
	}

	parts, err := u.deviceRepo.GetPartsByDeviceID(ctx, deviceID)
	if err != nil {
		return nil, fmt.Errorf("aiUsecase: failed to get device parts: %w", err)
	}

	// Build the prompt context
	var partsContext strings.Builder
	for _, p := range parts {
		partsContext.WriteString(fmt.Sprintf("- %s (%s), purchased: %s\n", p.Name, p.PartType, p.PurchaseDate.Format("2006-01-02")))
	}

	prompt := fmt.Sprintf(`You are a PC hardware expert. Analyze the following PC build and provide a short, professional 1-paragraph health summary and maintenance recommendation.
Device: %s
Category: %s
Workload Intensity: %s
Parts:
%s

Keep it concise, under 100 words. Provide only the recommendation text, no markdown formatting.`, device.Name, device.Category, device.WorkloadIntensity, partsContext.String())

	recommendation, err := u.geminiClient.GenerateContent(ctx, prompt)
	if err != nil {
		return nil, fmt.Errorf("aiUsecase: gemini generation failed: %w", err)
	}
	recommendation = strings.TrimSpace(recommendation)

	// Save to database
	device.AIHealthSummary = &recommendation
	now := time.Now()
	device.LastAIAnalyzedAt = &now
	
	if err := u.deviceRepo.Update(ctx, device); err != nil {
		return nil, fmt.Errorf("aiUsecase: failed to save recommendation to DB: %w", err)
	}

	return &domain.AIHealthSummaryResponse{Recommendation: recommendation}, nil
}
