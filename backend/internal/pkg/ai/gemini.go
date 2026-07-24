package ai

import (
	"context"
	"fmt"

	"github.com/google/generative-ai-go/genai"
	"google.golang.org/api/option"
)

type GeminiClient interface {
	GenerateContent(ctx context.Context, prompt string) (string, error)
	GenerateContentFromImage(ctx context.Context, prompt string, mimeType string, imageData []byte) (string, error)
	Close()
}

type geminiClient struct {
	client *genai.Client
	model  *genai.GenerativeModel
}

func NewGeminiClient(ctx context.Context, apiKey string) (GeminiClient, error) {
	if apiKey == "" {
		return nil, fmt.Errorf("gemini api key is required")
	}

	client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		return nil, fmt.Errorf("failed to create gemini client: %w", err)
	}

	// Use the model required by rules.md
	model := client.GenerativeModel("gemini-2.5-flash")

	return &geminiClient{
		client: client,
		model:  model,
	}, nil
}

func (g *geminiClient) GenerateContent(ctx context.Context, prompt string) (string, error) {
	resp, err := g.model.GenerateContent(ctx, genai.Text(prompt))
	if err != nil {
		return "", fmt.Errorf("gemini generate error: %w", err)
	}
	return parseResponse(resp), nil
}

func (g *geminiClient) GenerateContentFromImage(ctx context.Context, prompt string, mimeType string, imageData []byte) (string, error) {
	promptText := genai.Text(prompt)
	imgData := genai.ImageData(mimeType, imageData)

	resp, err := g.model.GenerateContent(ctx, imgData, promptText)
	if err != nil {
		return "", fmt.Errorf("gemini image generate error: %w", err)
	}
	return parseResponse(resp), nil
}

func parseResponse(resp *genai.GenerateContentResponse) string {
	if len(resp.Candidates) > 0 && len(resp.Candidates[0].Content.Parts) > 0 {
		if textPart, ok := resp.Candidates[0].Content.Parts[0].(genai.Text); ok {
			return string(textPart)
		}
	}
	return ""
}

func (g *geminiClient) Close() {
	if g.client != nil {
		g.client.Close()
	}
}
