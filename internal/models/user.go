package models

type CreateUserRequest struct {
	Name string `json:"name" validate:"required,min=2,max=100"`
	DOB  string `json:"dob" validate:"required"` // Format: YYYY-MM-DD
}

type UpdateUserRequest struct {
	Name string `json:"name" validate:"required,min=2,max=100"`
	DOB  string `json:"dob" validate:"required"` // Format: YYYY-MM-DD
}

type UserResponse struct {
	ID   int32  `json:"id"`
	Name string `json:"name"`
	DOB  string `json:"dob"`  // Format: YYYY-MM-DD
	Age  *int   `json:"age,omitempty"` // Omitted in POST response, included in GET
}
type ErrorResponse struct {
	Error string `json:"error"`
}
