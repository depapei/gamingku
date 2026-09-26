package PubCategoryService

import (
	DataAccess "backend/db"
	Category "backend/helper/type/category"
	"backend/model"
)

// GetCategories returns the public read-only category list using the shared DTO.
func GetCategories() ([]Category.CategoryResponse, error) {
	var categories []model.Category

	if err := DataAccess.DB.Order("name ASC").Find(&categories).Error; err != nil {
		return nil, err
	}

	result := make([]Category.CategoryResponse, 0, len(categories))
	for _, category := range categories {
		result = append(result, Category.CategoryResponse{
			ID:          category.ID,
			Name:        category.Name,
			Slug:        category.Slug,
			Image:       category.Image,
			ParentId:    category.ParentId,
			CreatedById: category.CreatedById,
			CreatedAt:   category.CreatedAt,
			UpdatedAt:   category.UpdatedAt,
		})
	}

	return result, nil
}
