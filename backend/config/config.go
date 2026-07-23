package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	DatabaseURL  string
	SupabaseURL  string
	SupabaseKey  string
	JWTSecret    string
	GeminiAPIKey string
	Port         string
}

func Load() *Config {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, relying on environment variables")
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	return &Config{
		DatabaseURL:  os.Getenv("DATABASE_URL"),
		SupabaseURL:  os.Getenv("SUPABASE_URL"),
		SupabaseKey:  os.Getenv("SUPABASE_KEY"),
		JWTSecret:    os.Getenv("SUPABASE_JWT_SECRET"),
		GeminiAPIKey: os.Getenv("GEMINI_API_KEY"),
		Port:         port,
	}
}
