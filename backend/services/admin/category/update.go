package AdminCategoryService

import (
	DataAccess "backend/db"
	Category "backend/helper/type/category"
	"backend/model"
	"time"
)

func UpdateCategory(input Category.UpdateCategory) error {
	raw := DataAccess.DB

	updatedCategory := model.Category{
		ID: input.ID,
		Name: input.Name,
		Image: input.Image,
		Slug: *input.Slug,
		ParentId: input.ParentId,
		UpdatedAt: time.Now(),
	}

	err := raw.UpdateColumns(&updatedCategory).Where("id = ?", input.ID).Error; if err != nil {
		return err
	}

	return err
}