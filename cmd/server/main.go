package main

import (
	"database/sql"
	"fmt"
	"os"
	"os/signal"
	"syscall"
	"time"

	"dob_calculator/config"
	"dob_calculator/internal/handler"
	"dob_calculator/internal/logger"
	"dob_calculator/internal/repository"
	"dob_calculator/internal/routes"
	"dob_calculator/internal/service"

	"github.com/gofiber/fiber/v2"
	_ "github.com/lib/pq"
	"go.uber.org/zap"
)

func main() {
	// Initialize custom Zap logger
	logger.InitLogger()
	defer func() {
		_ = logger.Log.Sync()
	}()

	// Load configuration properties
	cfg, err := config.LoadConfig()
	if err != nil {
		logger.Log.Fatal("Failed to load environment variables", zap.Error(err))
	}

	// Auto-create database if not exists
	postgresDSN := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=postgres sslmode=%s",
		cfg.DBHost, cfg.DBPort, cfg.DBUser, cfg.DBPassword, cfg.DBSSLMode)
	
	tempDB, err := sql.Open("postgres", postgresDSN)
	if err == nil {
		var exists bool
		query := "SELECT EXISTS(SELECT 1 FROM pg_database WHERE datname = $1)"
		errExists := tempDB.QueryRow(query, cfg.DBName).Scan(&exists)
		if errExists == nil && !exists {
			logger.Log.Info("Database does not exist. Creating database...", zap.String("database", cfg.DBName))
			_, errCreate := tempDB.Exec("CREATE DATABASE " + cfg.DBName)
			if errCreate != nil {
				logger.Log.Error("Failed to create database", zap.Error(errCreate))
			} else {
				logger.Log.Info("Database created successfully!")
			}
		}
		tempDB.Close()
	}

	// Open SQL database connection pool
	logger.Log.Info("Connecting to application database...", zap.String("host", cfg.DBHost), zap.String("database", cfg.DBName))
	dbConn, err := sql.Open("postgres", cfg.GetDatabaseDSN())
	if err != nil {
		logger.Log.Fatal("Failed to initialize database pool", zap.Error(err))
	}

	// Configure pool parameters
	dbConn.SetMaxOpenConns(25)
	dbConn.SetMaxIdleConns(25)
	dbConn.SetConnMaxLifetime(5 * time.Minute)

	// Validate connectivity and auto-migrate table schema
	if err = dbConn.Ping(); err != nil {
		logger.Log.Warn("Database validation check failed (DB might be offline)", zap.Error(err))
	} else {
		logger.Log.Info("Database validation successful!")
		
		// Create users table if not exists
		logger.Log.Info("Ensuring tables are initialized...")
		createTableSQL := `
		CREATE TABLE IF NOT EXISTS users (
			id SERIAL PRIMARY KEY,
			name TEXT NOT NULL,
			dob DATE NOT NULL
		);`
		if _, errTable := dbConn.Exec(createTableSQL); errTable != nil {
			logger.Log.Error("Failed to initialize database table schema", zap.Error(errTable))
		} else {
			logger.Log.Info("Database table schema successfully verified!")
		}
	}


	// Dependency injection
	userRepo := repository.NewUserRepository(dbConn)
	userService := service.NewUserService(userRepo)
	userHandler := handler.NewUserHandler(userService)

	// Instantiating the Fiber Engine
	app := fiber.New(fiber.Config{
		DisableStartupMessage: true,
	})

	// Configure Routes
	routes.SetupRoutes(app, userHandler)

	// Channel to catch interrupts
	shutdownChan := make(chan os.Signal, 1)
	signal.Notify(shutdownChan, syscall.SIGINT, syscall.SIGTERM)

	// Launch server in background thread
	go func() {
		logger.Log.Info("Server is listening...", zap.String("port", cfg.Port))
		if err := app.Listen(":" + cfg.Port); err != nil {
			logger.Log.Fatal("Web application crash detected", zap.Error(err))
		}
	}()

	// Await OS terminate signal
	sig := <-shutdownChan
	logger.Log.Info("System caught shutdown signal, starting cleanup sequence", zap.String("signal", sig.String()))

	// Close Fiber listener with 10s timeout
	if err := app.ShutdownWithTimeout(10 * time.Second); err != nil {
		logger.Log.Error("Fiber shutdown failed", zap.Error(err))
	} else {
		logger.Log.Info("HTTP routing handlers closed.")
	}

	// Terminate DB pool connection
	if err := dbConn.Close(); err != nil {
		logger.Log.Error("Failed to close DB pool cleanly", zap.Error(err))
	} else {
		logger.Log.Info("Database resource pools terminated.")
	}

	logger.Log.Info("App exited cleanly. Goodbye!")
}
