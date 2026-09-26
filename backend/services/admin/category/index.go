package AdminCategoryService

import (
	DataAccess "backend/db"
	Category "backend/helper/type/category"
	UserInfo "backend/helper/type/user"
	"backend/model"
	"strings"
)

// sortColumnAllowlist maps public sort keys to safe DB columns.
var sortColumnAllowlist = map[string]string{
	"name":       "name",
	"slug":       "slug",
	"createdAt":  "created_at",
	"created_at": "created_at",
	"updatedAt":  "updated_at",
	"updated_at": "updated_at",
}

// GetCategories returns a paginated, searchable, safely-sorted category list.
func GetCategories(params Category.CategoryListParams) (Category.PaginatedCategoryResponse, error) {
	page := params.Page
	if page <= 0 {
		page = 1
	}
	limit := params.Limit
	if limit <= 0 {
		limit = 10
	}
	if limit > 100 {
		limit = 100
	}

	base := DataAccess.DB.Model(&model.Category{})
	if trimmed := strings.TrimSpace(params.Search); trimmed != "" {
		pattern := "%" + trimmed + "%"
		base = base.Where("LOWER(name) LIKE LOWER(?)", pattern)
	}

	var total int64
	if err := base.Count(&total).Error; err != nil {
		return Category.PaginatedCategoryResponse{}, err
	}

	column, ok := sortColumnAllowlist[params.SortBy]
	if !ok {
		column = "name"
	}
	direction := "ASC"
	if strings.EqualFold(params.Sort, "desc") {
		direction = "DESC"
	}

	var categories []model.Category
	err := base.
		Preload("CreatedBy").
		Order(column + " " + direction).
		Limit(limit).
		Offset((page - 1) * limit).
		Find(&categories).Error
	if err != nil {
		return Category.PaginatedCategoryResponse{}, err
	}

	data := make([]Category.CategoryResponse, 0, len(categories))
	for _, cat := range categories {
		data = append(data, mapCategoryToResponse(cat))
	}

	return Category.PaginatedCategoryResponse{
		Data:  data,
		Total: total,
		Page:  page,
		Limit: limit,
	}, nil
}

// mapCategoryToResponse converts a model.Category to its shared response DTO.
func mapCategoryToResponse(cat model.Category) Category.CategoryResponse {
	return Category.CategoryResponse{
		ID:          cat.ID,
		Name:        cat.Name,
		Slug:        cat.Slug,
		Image:       cat.Image,
		ParentId:    cat.ParentId,
		CreatedById: cat.CreatedById,
		CreatedBy: UserInfo.UserInfo{
			Name:     cat.CreatedBy.Name,
			Email:    cat.CreatedBy.Email,
			Role:     cat.CreatedBy.Role,
			IsActive: cat.CreatedBy.IsActive,
			Avatar:   cat.CreatedBy.Avatar,
		},
		CreatedAt: cat.CreatedAt,
		UpdatedAt: cat.UpdatedAt,
	}
}
