package user

import "time"

// UserResponse is the canonical read model for a user. It never includes Password.
type UserResponse struct {
	ID        uint      `json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	Role      string    `json:"role"`
	IsActive  bool      `json:"isActive"`
	Avatar    string    `json:"avatar,omitempty"`
	CreatedAt time.Time `json:"createdAt,omitempty"`
	UpdatedAt time.Time `json:"updatedAt,omitempty"`
}

// UserInfo is a backward-compatible alias of UserResponse for existing importers.
type UserInfo = UserResponse

// CreateUserInput is the validated payload for admin-driven user creation.
type CreateUserInput struct {
	Name     string `json:"name" binding:"required,min=3"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
	Role     string `json:"role,omitempty" binding:"omitempty,oneof=superadmin admin customer"`
	IsActive *bool  `json:"isActive,omitempty"`
	Avatar   string `json:"avatar,omitempty" binding:"omitempty,url"`
}

// UpdateUserInput is the validated payload for updating a user.
// ID is optional in the body because the route :id is the source of truth;
// when both are present they must match. Password is excluded (dedicated endpoint).
type UpdateUserInput struct {
	ID     uint   `json:"id,omitempty"`
	Name   string `json:"name,omitempty" binding:"omitempty,min=3"`
	Email  string `json:"email,omitempty" binding:"omitempty,email"`
	Avatar string `json:"avatar,omitempty" binding:"omitempty,url"`
	Role   string `json:"role,omitempty" binding:"omitempty,oneof=superadmin admin customer"`
}

// UpdateUserStatusInput carries an explicit presence-safe bool: a *bool with
// required binding accepts false, unlike plain binding:"required" on a bool
// which rejects false.
type UpdateUserStatusInput struct {
	IsActive *bool `json:"isActive" binding:"required"`
}

// ResetPasswordInput is the validated payload for admin-triggered password reset.
type ResetPasswordInput struct {
	Password string `json:"password" binding:"required,min=8"`
}

// UserListParams carries validated list/search/filter/sort/pagination options.
type UserListParams struct {
	Search   string
	Role     string
	IsActive *bool
	SortBy   string
	Sort     string
	Page     int
	Limit    int
}

// PaginatedUserResponse is the envelope for paginated admin list results.
type PaginatedUserResponse struct {
	Data  []UserResponse `json:"data"`
	Total int64          `json:"total"`
	Page  int            `json:"page"`
	Limit int            `json:"limit"`
}
