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

	// Wire Usecases & Repositories
	wsRepo := workspaceRepo.NewWorkspaceRepository(dbPool)
	wsUsecase := workspaceUsecase.NewWorkspaceUsecase(wsRepo)
	
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
	}

	log.Printf("Server is starting on port %s...", cfg.Port)
	if err := router.Run(":" + cfg.Port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
