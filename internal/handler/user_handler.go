package handler

import (
	"database/sql"
	"errors"
	"fmt"
	"net/http"
	"strconv"

	"dob_calculator/internal/logger"
	"dob_calculator/internal/models"
	"dob_calculator/internal/service"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"go.uber.org/zap"
)

type UserHandler struct {
	service   service.UserService
	validator *validator.Validate
}

func NewUserHandler(s service.UserService) *UserHandler {
	return &UserHandler{
		service:   s,
		validator: validator.New(),
	}
}

func (h *UserHandler) CreateUser(c *fiber.Ctx) error {
	var req models.CreateUserRequest
	if err := c.BodyParser(&req); err != nil {
		logger.Log.Error("Failed to parse request body", zap.Error(err))
		return c.Status(fiber.StatusBadRequest).JSON(models.ErrorResponse{
			Error: "Invalid request payload",
		})
	}

	if err := h.validator.Struct(req); err != nil {
		var valErrs validator.ValidationErrors
		if errors.As(err, &valErrs) {
			for _, errField := range valErrs {
				msg := fmt.Sprintf("Field validation for '%s' failed on the '%s' tag", errField.Field(), errField.Tag())
				return c.Status(fiber.StatusBadRequest).JSON(models.ErrorResponse{
					Error: msg,
				})
			}
		}
		return c.Status(fiber.StatusBadRequest).JSON(models.ErrorResponse{
			Error: "Request validation failed",
		})
	}

	res, err := h.service.CreateUser(c.UserContext(), req)
	if err != nil {
		logger.Log.Error("Failed to create user", zap.Error(err))
		return c.Status(fiber.StatusInternalServerError).JSON(models.ErrorResponse{
			Error: err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(res)
}

func (h *UserHandler) GetUserByID(c *fiber.Ctx) error {
	idStr := c.Params("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(models.ErrorResponse{
			Error: "Invalid user ID, must be an integer",
		})
	}

	res, err := h.service.GetUserByID(c.UserContext(), int32(id))
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return c.Status(fiber.StatusNotFound).JSON(models.ErrorResponse{
				Error: "User not found",
			})
		}
		logger.Log.Error("Failed to fetch user by ID", zap.Int("id", id), zap.Error(err))
		return c.Status(fiber.StatusInternalServerError).JSON(models.ErrorResponse{
			Error: "Failed to fetch user",
		})
	}

	return c.Status(fiber.StatusOK).JSON(res)
}

func (h *UserHandler) UpdateUser(c *fiber.Ctx) error {
	idStr := c.Params("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(models.ErrorResponse{
			Error: "Invalid user ID, must be an integer",
		})
	}

	var req models.UpdateUserRequest
	if err := c.BodyParser(&req); err != nil {
		logger.Log.Error("Failed to parse request body on update", zap.Error(err))
		return c.Status(fiber.StatusBadRequest).JSON(models.ErrorResponse{
			Error: "Invalid request payload",
		})
	}

	if err := h.validator.Struct(req); err != nil {
		var valErrs validator.ValidationErrors
		if errors.As(err, &valErrs) {
			for _, errField := range valErrs {
				msg := fmt.Sprintf("Field validation for '%s' failed on the '%s' tag", errField.Field(), errField.Tag())
				return c.Status(fiber.StatusBadRequest).JSON(models.ErrorResponse{
					Error: msg,
				})
			}
		}
		return c.Status(fiber.StatusBadRequest).JSON(models.ErrorResponse{
			Error: "Request validation failed",
		})
	}

	res, err := h.service.UpdateUser(c.UserContext(), int32(id), req)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return c.Status(fiber.StatusNotFound).JSON(models.ErrorResponse{
				Error: "User not found",
			})
		}
		logger.Log.Error("Failed to update user", zap.Int("id", id), zap.Error(err))
		return c.Status(fiber.StatusInternalServerError).JSON(models.ErrorResponse{
			Error: err.Error(),
		})
	}

	// The prompt response for PUT /users/:id is not specified (just "Update User"),
	// but it's standard to return the updated user object.
	return c.Status(fiber.StatusOK).JSON(res)
}

func (h *UserHandler) DeleteUser(c *fiber.Ctx) error {
	idStr := c.Params("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(models.ErrorResponse{
			Error: "Invalid user ID, must be an integer",
		})
	}

	err = h.service.DeleteUser(c.UserContext(), int32(id))
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return c.Status(fiber.StatusNotFound).JSON(models.ErrorResponse{
				Error: "User not found",
			})
		}
		logger.Log.Error("Failed to delete user", zap.Int("id", id), zap.Error(err))
		return c.Status(fiber.StatusInternalServerError).JSON(models.ErrorResponse{
			Error: "Failed to delete user",
		})
	}

	// Return: HTTP 204 No Content
	return c.SendStatus(http.StatusNoContent)
}

func (h *UserHandler) ListUsers(c *fiber.Ctx) error {
	// Support search query param: /users?search=Alice
	search := c.Query("search")

	res, err := h.service.ListUsers(c.UserContext(), search)
	if err != nil {
		logger.Log.Error("Failed to list users", zap.Error(err))
		return c.Status(fiber.StatusInternalServerError).JSON(models.ErrorResponse{
			Error: "Failed to list users",
		})
	}

	return c.Status(fiber.StatusOK).JSON(res)
}
