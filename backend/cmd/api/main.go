package main

import (
	"log"

	"github.com/gin-gonic/gin"
)

func main() {
	// TODO: Load config
	// TODO: Init Database Connection
	// TODO: Wire Usecases & Repositories
	
	router := gin.Default()

	// Health check endpoint
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "OK",
		})
	})

	log.Println("Server is starting on port 8080...")
	if err := router.Run(":8080"); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
