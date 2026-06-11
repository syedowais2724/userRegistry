package service

import (
	"context"
	"errors"
	"time"

	"dob_calculator/internal/models"
	"dob_calculator/internal/repository"
)

type UserService interface {
	CreateUser(ctx context.Context, req models.CreateUserRequest) (models.UserResponse, error)
	GetUserByID(ctx context.Context, id int32) (models.UserResponse, error)
	UpdateUser(ctx context.Context, id int32, req models.UpdateUserRequest) (models.UserResponse, error)
	DeleteUser(ctx context.Context, id int32) error
	ListUsers(ctx context.Context, search string) ([]models.UserResponse, error)
}

type userService struct {
	repo repository.UserRepository
}

func NewUserService(repo repository.UserRepository) UserService {
	return &userService{repo: repo}
}

func CalculateAge(dob time.Time) int {
	today := time.Now()
	age := today.Year() - dob.Year()

	if today.YearDay() < dob.YearDay() {
		age--
	}

	return age
}

func (s *userService) CreateUser(ctx context.Context, req models.CreateUserRequest) (models.UserResponse, error) {
	dob, err := time.Parse("2006-01-02", req.DOB)
	if err != nil {
		return models.UserResponse{}, errors.New("invalid date of birth format, must be YYYY-MM-DD")
	}

	if dob.After(time.Now()) {
		return models.UserResponse{}, errors.New("date of birth cannot be in the future")
	}

	user, err := s.repo.Create(ctx, req.Name, dob)
	if err != nil {
		return models.UserResponse{}, err
	}

	return models.UserResponse{
		ID:   user.ID,
		Name: user.Name,
		DOB:  user.Dob.Format("2006-01-02"),
		// For create response: prompt doesn't show age, so we leave Age as nil
		Age:  nil,
	}, nil
}

func (s *userService) GetUserByID(ctx context.Context, id int32) (models.UserResponse, error) {
	user, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return models.UserResponse{}, err
	}

	ageVal := CalculateAge(user.Dob)

	return models.UserResponse{
		ID:   user.ID,
		Name: user.Name,
		DOB:  user.Dob.Format("2006-01-02"),
		Age:  &ageVal,
	}, nil
}

func (s *userService) UpdateUser(ctx context.Context, id int32, req models.UpdateUserRequest) (models.UserResponse, error) {
	dob, err := time.Parse("2006-01-02", req.DOB)
	if err != nil {
		return models.UserResponse{}, errors.New("invalid date of birth format, must be YYYY-MM-DD")
	}

	if dob.After(time.Now()) {
		return models.UserResponse{}, errors.New("date of birth cannot be in the future")
	}

	// First verify user exists
	_, err = s.repo.GetByID(ctx, id)
	if err != nil {
		return models.UserResponse{}, err
	}

	user, err := s.repo.Update(ctx, id, req.Name, dob)
	if err != nil {
		return models.UserResponse{}, err
	}

	ageVal := CalculateAge(user.Dob)

	return models.UserResponse{
		ID:   user.ID,
		Name: user.Name,
		DOB:  user.Dob.Format("2006-01-02"),
		Age:  &ageVal,
	}, nil
}

func (s *userService) DeleteUser(ctx context.Context, id int32) error {
	// First verify user exists
	_, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	return s.repo.Delete(ctx, id)
}

func (s *userService) ListUsers(ctx context.Context, search string) ([]models.UserResponse, error) {
	if search != "" {
		res, err := s.repo.SearchByName(ctx, search)
		if err != nil {
			return nil, err
		}
		
		responses := make([]models.UserResponse, len(res))
		for i, u := range res {
			ageVal := CalculateAge(u.Dob)
			responses[i] = models.UserResponse{
				ID:   u.ID,
				Name: u.Name,
				DOB:  u.Dob.Format("2006-01-02"),
				Age:  &ageVal,
			}
		}
		return responses, nil
	}

	res, err := s.repo.List(ctx)
	if err != nil {
		return nil, err
	}

	responses := make([]models.UserResponse, len(res))
	for i, u := range res {
		ageVal := CalculateAge(u.Dob)
		responses[i] = models.UserResponse{
			ID:   u.ID,
			Name: u.Name,
			DOB:  u.Dob.Format("2006-01-02"),
			Age:  &ageVal,
		}
	}
	return responses, nil
}

