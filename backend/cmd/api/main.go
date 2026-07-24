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
	
	router := gin.Default()

	// Health check endpoint
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "OK",
		})
	})

	// Protected routes group
	protected := router.Group("/api")
	protected.Use(middleware.SupabaseAuthMiddleware(cfg.JWTSecret))
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
	}

	log.Printf("Server is starting on port %s...", cfg.Port)
	if err := router.Run(":" + cfg.Port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
