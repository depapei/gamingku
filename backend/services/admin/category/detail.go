package AdminCategoryService

import (
	DataAccess "backend/db"
	Category "backend/helper/type/category"
	UserInfo "backend/helper/type/user"
	"backend/model"
	"errors"

	"gorm.io/gorm"
)

// GetDetail returns a single category with its direct children.
func GetDetail(id uint) (Category.CategoryResponse, error) {
	var category model.Category
	if err := DataAccess.DB.Preload("CreatedBy").First(&category, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return Category.CategoryResponse{}, ErrCategoryNotFound
		}
		return Category.CategoryResponse{}, err
	}

	var children []model.Category
	if err := DataAccess.DB.Where("parent_id = ?", id).Find(&children).Error; err != nil {
		return Category.CategoryResponse{}, err
	}

	childs := make([]*Category.CategoryChild, 0, len(children))
	for _, child := range children {
		child := child
		childs = append(childs, &Category.CategoryChild{
			ID:    child.ID,
			Name:  child.Name,
			Image: child.Image,
			Slug:  child.Slug,
		})
	}

	return Category.CategoryResponse{
		ID:          category.ID,
		Name:        category.Name,
		Slug:        category.Slug,
		Image:       category.Image,
		ParentId:    category.ParentId,
		CreatedById: category.CreatedById,
		CreatedBy: UserInfo.UserInfo{
			Name:     category.CreatedBy.Name,
			Email:    category.CreatedBy.Email,
			Role:     category.CreatedBy.Role,
			IsActive: category.CreatedBy.IsActive,
			Avatar:   category.CreatedBy.Avatar,
		},
		Childs:    childs,
		CreatedAt: category.CreatedAt,
		UpdatedAt: category.UpdatedAt,
	}, nil
}
