package routes

import (
	"dob_calculator/internal/handler"
	"dob_calculator/internal/middleware"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

func SetupRoutes(app *fiber.App, userHandler *handler.UserHandler) {
	// CORS Middleware Support
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
		AllowMethods: "GET, POST, PUT, DELETE, OPTIONS",
	}))

	// Tracing & Request Logger Middlewares
	app.Use(middleware.RequestID())
	app.Use(middleware.RequestLogger())

	// REST API Paths
	app.Post("/users", userHandler.CreateUser)
	app.Get("/users/:id", userHandler.GetUserByID)
	app.Put("/users/:id", userHandler.UpdateUser)
	app.Delete("/users/:id", userHandler.DeleteUser)
	app.Get("/users", userHandler.ListUsers)
}
