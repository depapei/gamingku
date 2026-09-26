package AdminUserService

import (
	DataAccess "backend/db"
	UserType "backend/helper/type/user"
	"backend/model"
	"errors"
	"strings"
)

// sortColumnAllowlist maps public sort keys to safe DB columns.
var sortColumnAllowlist = map[string]string{
	"name":       "name",
	"email":      "email",
	"role":       "role",
	"createdAt":  "created_at",
	"created_at": "created_at",
}

// roleAllowlist is the set of filterable/assignable roles.
var roleAllowlist = map[string]bool{
	"superadmin": true,
	"admin":      true,
	"customer":   true,
}

// MapUserToResponse converts a model.User to its shared response DTO.
// The password hash is never copied.
func MapUserToResponse(user model.User) UserType.UserResponse {
	return UserType.UserResponse{
		ID:        user.ID,
		Name:      user.Name,
		Email:     user.Email,
		Role:      user.Role,
		IsActive:  user.IsActive,
		Avatar:    user.Avatar,
		CreatedAt: user.CreatedAt,
		UpdatedAt: user.UpdatedAt,
	}
}

// GetUsers returns a paginated, searchable, safely-sorted user list.
// Search matches name or email case-insensitively. Unknown sort keys fall
// back to name ASC instead of concatenating raw input into Order.
// Soft-deleted rows are excluded by the default GORM scope.
func GetUsers(params UserType.UserListParams) (UserType.PaginatedUserResponse, error) {
	page := params.Page
	if page <= 0 {
		page = 1
	}
	limit := params.Limit
	if limit <= 0 {
		limit = 10
	}
	if limit > 50 {
		limit = 50
	}

	if params.Role != "" && !roleAllowlist[params.Role] {
		return UserType.PaginatedUserResponse{}, errors.New("invalid role filter: must be one of superadmin, admin, customer")
	}

	base := DataAccess.DB.Model(&model.User{})
	if trimmed := strings.TrimSpace(params.Search); trimmed != "" {
		pattern := "%" + trimmed + "%"
		base = base.Where("LOWER(name) LIKE LOWER(?) OR LOWER(email) LIKE LOWER(?)", pattern, pattern)
	}
	if params.Role != "" {
		base = base.Where("role = ?", params.Role)
	}
	if params.IsActive != nil {
		base = base.Where("is_active = ?", *params.IsActive)
	}

	var total int64
	if err := base.Count(&total).Error; err != nil {
		return UserType.PaginatedUserResponse{}, err
	}

	column, ok := sortColumnAllowlist[params.SortBy]
	if !ok {
		column = "name"
	}
	direction := "ASC"
	if strings.EqualFold(params.Sort, "desc") {
		direction = "DESC"
	}

	var users []model.User
	if err := base.
		Order(column + " " + direction).
		Limit(limit).
		Offset((page - 1) * limit).
		Find(&users).Error; err != nil {
		return UserType.PaginatedUserResponse{}, err
	}

	data := make([]UserType.UserResponse, 0, len(users))
	for _, user := range users {
		data = append(data, MapUserToResponse(user))
	}

	return UserType.PaginatedUserResponse{
		Data:  data,
		Total: total,
		Page:  page,
		Limit: limit,
	}, nil
}
