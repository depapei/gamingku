package Category

import (
	"backend/helper/type/user"
	"time"
)

// CategoryChild is the lightweight representation of a child category.
type CategoryChild struct {
	ID    uint   `json:"id"`
	Name  string `json:"name"`
	Image string `json:"image"`
	Slug  string `json:"slug,omitempty"`
}

// CategoryResponse is the canonical read model for a category.
type CategoryResponse struct {
	ID          uint            `json:"id"`
	Name        string          `json:"name"`
	Slug        string          `json:"slug"`
	Image       string          `json:"image"`
	ParentId    *int            `json:"parentId,omitempty"`
	CreatedById int             `json:"createdBy"`
	CreatedBy   user.UserInfo   `json:"createdByUser,omitempty"`
	Childs      []*CategoryChild `json:"childs,omitempty"`
	CreatedAt   time.Time       `json:"createdAt,omitempty"`
	UpdatedAt   time.Time       `json:"updatedAt,omitempty"`
}

// ResCategory is a backward-compatible alias of CategoryResponse.
type ResCategory = CategoryResponse

// CreateCategoryInput is the validated payload for creating a category.
// CreatedById is optional: when omitted the server derives the creator
// from the authenticated JWT identity. The json key "createdBy" is kept
// for backward compatibility with existing clients.
type CreateCategoryInput struct {
	Name        string `json:"name" binding:"required,min=2"`
	Slug        string `json:"slug" binding:"required,min=2"`
	Image       string `json:"image" binding:"required"`
	ParentId    *int   `json:"parentId,omitempty"`
	CreatedById *int   `json:"createdBy,omitempty"`
}

// UpdateCategoryInput is the validated payload for updating a category.
// ID is optional in the body because the route :id is the source of truth;
// when both are present they must match.
type UpdateCategoryInput struct {
	ID       uint   `json:"id,omitempty"`
	Name     string `json:"name" binding:"required,min=2"`
	Slug     string `json:"slug" binding:"required,min=2"`
	Image    string `json:"image" binding:"required"`
	ParentId *int   `json:"parentId,omitempty"`
}

// UpdateCategory is a backward-compatible alias of UpdateCategoryInput.
type UpdateCategory = UpdateCategoryInput

// CategoryListParams carries validated list/search/sort/pagination options.
type CategoryListParams struct {
	Search string
	SortBy string
	Sort   string
	Page   int
	Limit  int
}

// PaginatedCategoryResponse is the envelope for paginated admin list results.
type PaginatedCategoryResponse struct {
	Data  []CategoryResponse `json:"data"`
	Total int64              `json:"total"`
	Page  int                `json:"page"`
	Limit int                `json:"limit"`
}
