package main

import (
	"context"
	"log"

	"hardware-tracker-backend/config"
	"hardware-tracker-backend/internal/delivery/http/middleware"
	"hardware-tracker-backend/internal/infrastructure/database"
	
	workspaceHttp "hardware-tracker-backend/internal/module/workspace/delivery/http"
	workspaceRepo "hardware-tracker-backend/internal/module/workspace/repository"
	workspaceUsecase "hardware-tracker-backend/internal/module/workspace/usecase"

	deviceHttp "hardware-tracker-backend/internal/module/device/delivery/http"
	deviceRepo "hardware-tracker-backend/internal/module/device/repository"
	deviceUsecase "hardware-tracker-backend/internal/module/device/usecase"

	maintenanceHttp "hardware-tracker-backend/internal/module/maintenance/delivery/http"
	maintenanceRepo "hardware-tracker-backend/internal/module/maintenance/repository"
	maintenanceUsecase "hardware-tracker-backend/internal/module/maintenance/usecase"

	serviceLogHttp "hardware-tracker-backend/internal/module/servicelog/delivery/http"
	serviceLogRepo "hardware-tracker-backend/internal/module/servicelog/repository"
	serviceLogUsecase "hardware-tracker-backend/internal/module/servicelog/usecase"

	aiPkg "hardware-tracker-backend/internal/pkg/ai"
	aiHttp "hardware-tracker-backend/internal/module/ai/delivery/http"
	aiUsecase "hardware-tracker-backend/internal/module/ai/usecase"

	"github.com/gin-gonic/gin"
)

func main() {
	// Load config
	cfg := config.Load()

	// Init Database Connection
	ctx := context.Background()
	dbPool, err := database.NewPostgresPool(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer dbPool.Close()

	// Wire Workspace Module
	wsRepo := workspaceRepo.NewWorkspaceRepository(dbPool)
	wsUsecase := workspaceUsecase.NewWorkspaceUsecase(wsRepo)

	// Wire Device Module
	devRepo := deviceRepo.NewDeviceRepository(dbPool)
	devUsecase := deviceUsecase.NewDeviceUsecase(devRepo, wsRepo)

	// Wire Maintenance Module
	maintRepo := maintenanceRepo.NewMaintenanceRepository(dbPool)
	maintUsecase := maintenanceUsecase.NewMaintenanceUsecase(maintRepo, devRepo, wsRepo)

	// Wire Service Log Module
	slRepo := serviceLogRepo.NewServiceLogRepository(dbPool)
	slUsecase := serviceLogUsecase.NewServiceLogUsecase(slRepo, maintUsecase, maintRepo)

	// Init Gemini Client
	geminiClient, err := aiPkg.NewGeminiClient(ctx, cfg.GeminiAPIKey)
	if err != nil {
		log.Printf("Warning: failed to initialize Gemini AI SDK: %v", err)
	} else {
		defer geminiClient.Close()
	}

	// Wire AI Module
	aiUc := aiUsecase.NewAIUsecase(geminiClient, devRepo, wsRepo)
	
	router := gin.Default()

	// Health check endpoint
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "OK",
		})
	})

	// Protected routes group
	protected := router.Group("/api")
	protected.Use(middleware.SupabaseAuthMiddleware(cfg.SupabaseJWTSecret))
	{
		// Example protected route
		protected.GET("/me", func(c *gin.Context) {
			userID, _ := c.Get("userID")
			c.JSON(200, gin.H{
				"message": "You are authenticated",
				"userID":  userID,
			})
		})

		// Register Workspace routes
		workspaceHttp.NewWorkspaceHandler(protected, wsUsecase)

		// Register Device routes
		deviceHttp.NewDeviceHandler(protected, devUsecase)

		// Register Maintenance routes
		maintenanceHttp.NewMaintenanceHandler(protected, maintUsecase)

		// Register Service Log routes
		serviceLogHttp.NewServiceLogHandler(protected, slUsecase)

		// Register AI routes
		aiHttp.NewAIHandler(protected, aiUc)
	}

	log.Printf("Server is starting on port %s...", cfg.Port)
	if err := router.Run(":" + cfg.Port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
