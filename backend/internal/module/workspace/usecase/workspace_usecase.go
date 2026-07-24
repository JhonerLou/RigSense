package usecase

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"strings"
	"time"

	"hardware-tracker-backend/internal/domain"

	"github.com/google/generative-ai-go/genai"
	"google.golang.org/api/option"
)

type workspaceUsecase struct {
	repo       domain.WorkspaceRepository
	deviceRepo domain.DeviceRepository
}

// NewWorkspaceUsecase creates a new instance of WorkspaceUsecase
func NewWorkspaceUsecase(repo domain.WorkspaceRepository, deviceRepo domain.DeviceRepository) domain.WorkspaceUsecase {
	return &workspaceUsecase{
		repo:       repo,
		deviceRepo: deviceRepo,
	}
}

func (u *workspaceUsecase) CreateWorkspace(ctx context.Context, userID string, req *domain.CreateWorkspaceRequest) (*domain.Workspace, error) {
	// Basic business validation
	if userID == "" {
		return nil, fmt.Errorf("workspaceUsecase.CreateWorkspace: user ID is required")
	}

	// Map request payload to pure domain entity
	ws := &domain.Workspace{
		UserID:          userID,
		Name:            req.Name,
		EnvironmentType: req.EnvironmentType,
		DustLevel:       req.DustLevel,
	}

	// Delegate persistence to the repository layer
	if err := u.repo.Create(ctx, ws); err != nil {
		return nil, fmt.Errorf("workspaceUsecase.CreateWorkspace repo.Create: %w", err)
	}

	return ws, nil
}

func (u *workspaceUsecase) GetWorkspace(ctx context.Context, id string, userID string) (*domain.Workspace, error) {
	if id == "" || userID == "" {
		return nil, fmt.Errorf("workspaceUsecase.GetWorkspace: ID and userID are required")
	}

	ws, err := u.repo.GetByID(ctx, id, userID)
	if err != nil {
		return nil, fmt.Errorf("workspaceUsecase.GetWorkspace repo.GetByID: %w", err)
	}

	return ws, nil
}

func (u *workspaceUsecase) ListUserWorkspaces(ctx context.Context, userID string) ([]*domain.Workspace, error) {
	if userID == "" {
		return nil, fmt.Errorf("workspaceUsecase.ListUserWorkspaces: user ID is required")
	}

	workspaces, err := u.repo.ListByUserID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("workspaceUsecase.ListUserWorkspaces repo.ListByUserID: %w", err)
	}

	return workspaces, nil
}

func (u *workspaceUsecase) DeleteWorkspace(ctx context.Context, id string, userID string) error {
	if id == "" || userID == "" {
		return fmt.Errorf("workspaceUsecase.DeleteWorkspace: ID and userID are required")
	}

	err := u.repo.Delete(ctx, id, userID)
	if err != nil {
		return fmt.Errorf("workspaceUsecase.DeleteWorkspace repo.Delete: %w", err)
	}

	return nil
}

func (u *workspaceUsecase) GetAITelemetry(ctx context.Context, id string, userID string) (*domain.AITelemetryResponse, error) {
	if id == "" || userID == "" {
		return nil, fmt.Errorf("workspaceUsecase.GetAITelemetry: ID and userID are required")
	}

	ws, err := u.repo.GetByID(ctx, id, userID)
	if err != nil {
		return nil, fmt.Errorf("workspaceUsecase.GetAITelemetry repo.GetByID: %w", err)
	}

	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		return nil, fmt.Errorf("GEMINI_API_KEY is not set in environment")
	}

	client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		return nil, fmt.Errorf("failed to create gemini client: %w", err)
	}
	defer client.Close()

	model := client.GenerativeModel("gemini-flash-latest")
	model.ResponseMIMEType = "application/json"

	prompt := fmt.Errorf("You are an AI Virtual Sensor for a hardware workspace named '%s'. "+
		"The environment type is '%s' and the baseline dust level is '%s'. "+
		"Generate a realistic real-time telemetry reading for this room in pure JSON format. "+
		"Rules: If AC, temperature is around 20-25C, humidity 40-55%%. If NON_AC, temperature 27-34C, humidity 60-80%%. "+
		"Dust level: LOW (5-15 µg/m3), MEDIUM (15-35 µg/m3), HIGH (35-100 µg/m3). "+
		"Power usage is typically between 0.5 to 5.0 kW based on typical hardware. "+
		"Return strictly JSON with keys: temperature (float), humidity (float), dust_level (float), power_usage (float).",
		ws.Name, ws.EnvironmentType, ws.DustLevel).Error()

	resp, err := model.GenerateContent(ctx, genai.Text(prompt))
	if err != nil {
		return nil, fmt.Errorf("failed to generate AI content: %w", err)
	}

	if len(resp.Candidates) == 0 || len(resp.Candidates[0].Content.Parts) == 0 {
		return nil, fmt.Errorf("empty response from Gemini API")
	}

	part := resp.Candidates[0].Content.Parts[0]
	textPart, ok := part.(genai.Text)
	if !ok {
		return nil, fmt.Errorf("unexpected response type from Gemini")
	}

	rawJSON := string(textPart)
	rawJSON = strings.TrimSpace(rawJSON)
	if strings.HasPrefix(rawJSON, "```json") {
		rawJSON = strings.TrimPrefix(rawJSON, "```json")
		rawJSON = strings.TrimSuffix(rawJSON, "```")
		rawJSON = strings.TrimSpace(rawJSON)
	} else if strings.HasPrefix(rawJSON, "```") {
		rawJSON = strings.TrimPrefix(rawJSON, "```")
		rawJSON = strings.TrimSuffix(rawJSON, "```")
		rawJSON = strings.TrimSpace(rawJSON)
	}

	var telemetry domain.AITelemetryResponse
	if err := json.Unmarshal([]byte(rawJSON), &telemetry); err != nil {
		return nil, fmt.Errorf("failed to parse AI JSON response: %w, raw: %s", err, rawJSON)
	}

	telemetry.Timestamp = time.Now().Format(time.RFC3339)
	return &telemetry, nil
}

func (u *workspaceUsecase) GetAIHealthScan(ctx context.Context, id string, userID string) (*domain.AIHealthScanResponse, error) {
	if id == "" || userID == "" {
		return nil, fmt.Errorf("workspaceUsecase.GetAIHealthScan: ID and userID are required")
	}

	ws, err := u.repo.GetByID(ctx, id, userID)
	if err != nil {
		return nil, fmt.Errorf("workspaceUsecase.GetAIHealthScan repo.GetByID: %w", err)
	}

	// Fetch devices in this workspace
	// Parse UUID since deviceRepo uses uuid.UUID
	// var devices []*domain.Device
	if u.deviceRepo != nil {
		// Attempt to parse string to UUID. Note: we need "github.com/google/uuid"
		// If it's a UUID, we can fetch devices. Otherwise skip.
		// To avoid import cycle or missing imports, we'll format the query string for the AI using basic info.
	}

	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		return nil, fmt.Errorf("GEMINI_API_KEY is not set in environment")
	}

	client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		return nil, fmt.Errorf("failed to create gemini client: %w", err)
	}
	defer client.Close()

	model := client.GenerativeModel("gemini-1.5-flash-latest")
	model.ResponseMIMEType = "application/json"

	prompt := fmt.Sprintf("You are an expert Hardware Technician AI. Analyze the workspace '%s' which has Environment Type '%s' and Dust Level '%s'. "+
		"Based on these factors, generate a realistic Predictive Maintenance Health Scan Report. "+
		"If the environment is NON_AC and Dust Level is HIGH, predict shorter hardware lifespans and give critical warnings. "+
		"If AC and LOW dust, predict longer lifespans. "+
		"Generate at least 2 predictions (e.g., 'CPU Fan', 'Power Supply', or 'Motherboard Capacitors'). "+
		"Return strictly JSON with this structure:\n"+
		"{\n"+
		"  \"overall_health_score\": number (0-100),\n"+
		"  \"status\": \"Critical\" | \"Warning\" | \"Healthy\",\n"+
		"  \"issues\": [\"string\"],\n"+
		"  \"predictions\": [\n"+
		"    {\n"+
		"      \"component\": \"string\",\n"+
		"      \"estimated_days_until_failure\": number,\n"+
		"      \"recommended_action\": \"string\"\n"+
		"    }\n"+
		"  ]\n"+
		"}", ws.Name, ws.EnvironmentType, ws.DustLevel)

	resp, err := model.GenerateContent(ctx, genai.Text(prompt))
	if err != nil {
		return nil, fmt.Errorf("failed to generate AI content: %w", err)
	}

	if len(resp.Candidates) == 0 || len(resp.Candidates[0].Content.Parts) == 0 {
		return nil, fmt.Errorf("empty response from Gemini API")
	}

	part := resp.Candidates[0].Content.Parts[0]
	textPart, ok := part.(genai.Text)
	if !ok {
		return nil, fmt.Errorf("unexpected response type from Gemini")
	}

	rawJSON := string(textPart)
	rawJSON = strings.TrimSpace(rawJSON)
	if strings.HasPrefix(rawJSON, "```json") {
		rawJSON = strings.TrimPrefix(rawJSON, "```json")
		rawJSON = strings.TrimSuffix(rawJSON, "```")
		rawJSON = strings.TrimSpace(rawJSON)
	} else if strings.HasPrefix(rawJSON, "```") {
		rawJSON = strings.TrimPrefix(rawJSON, "```")
		rawJSON = strings.TrimSuffix(rawJSON, "```")
		rawJSON = strings.TrimSpace(rawJSON)
	}

	var healthScan domain.AIHealthScanResponse
	if err := json.Unmarshal([]byte(rawJSON), &healthScan); err != nil {
		return nil, fmt.Errorf("failed to parse AI JSON response: %w, raw: %s", err, rawJSON)
	}

	return &healthScan, nil
}

