package middleware

import (
	"time"

	"dob_calculator/internal/logger"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/requestid"
	"go.uber.org/zap"
)

// RequestLogger middleware logs request ID, method, path, status, and duration
func RequestLogger() fiber.Handler {
	return func(c *fiber.Ctx) error {
		start := time.Now()
		
		// Continue chain
		err := c.Next()
		
		duration := time.Since(start)
		status := c.Response().StatusCode()
		requestID := c.Get(fiber.HeaderXRequestID)

		fields := []zap.Field{
			zap.String("request_id", requestID),
			zap.String("method", c.Method()),
			zap.String("path", c.Path()),
			zap.Int("status", status),
			zap.Duration("duration", duration),
		}

		if err != nil {
			fields = append(fields, zap.Error(err))
			logger.Log.Error("HTTP Request Error", fields...)
		} else if status >= 400 {
			logger.Log.Warn("HTTP Request Warning", fields...)
		} else {
			logger.Log.Info("HTTP Request Success", fields...)
		}

		return err
	}
}

// RequestID returns the standard Fiber RequestID middleware
func RequestID() fiber.Handler {
	return requestid.New()
}

