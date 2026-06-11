package repository

import (
	"context"
	"database/sql"
	"time"

	"dob_calculator/db/sqlc"
)

type UserRepository interface {
	Create(ctx context.Context, name string, dob time.Time) (sqlc.User, error)
	GetByID(ctx context.Context, id int32) (sqlc.User, error)
	Update(ctx context.Context, id int32, name string, dob time.Time) (sqlc.User, error)
	Delete(ctx context.Context, id int32) error
	List(ctx context.Context) ([]sqlc.User, error)
	SearchByName(ctx context.Context, name string) ([]sqlc.User, error)
}

type sqlcUserRepository struct {
	queries *sqlc.Queries
	dbConn  *sql.DB
}

func NewUserRepository(dbConn *sql.DB) UserRepository {
	return &sqlcUserRepository{
		queries: sqlc.New(dbConn),
		dbConn:  dbConn,
	}
}

func (r *sqlcUserRepository) Create(ctx context.Context, name string, dob time.Time) (sqlc.User, error) {
	return r.queries.CreateUser(ctx, sqlc.CreateUserParams{
		Name: name,
		Dob:  dob,
	})
}

func (r *sqlcUserRepository) GetByID(ctx context.Context, id int32) (sqlc.User, error) {
	return r.queries.GetUserByID(ctx, id)
}

func (r *sqlcUserRepository) Update(ctx context.Context, id int32, name string, dob time.Time) (sqlc.User, error) {
	return r.queries.UpdateUser(ctx, sqlc.UpdateUserParams{
		Name: name,
		Dob:  dob,
		ID:   id,
	})
}

func (r *sqlcUserRepository) Delete(ctx context.Context, id int32) error {
	return r.queries.DeleteUser(ctx, id)
}

func (r *sqlcUserRepository) List(ctx context.Context) ([]sqlc.User, error) {
	return r.queries.ListUsers(ctx)
}

func (r *sqlcUserRepository) SearchByName(ctx context.Context, name string) ([]sqlc.User, error) {
	// Search filter: prefix wildcards for ILIKE query
	searchPattern := "%" + name + "%"
	return r.queries.SearchUsersByName(ctx, searchPattern)
}
