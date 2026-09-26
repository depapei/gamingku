package AdminCategoryService

import (
	DataAccess "backend/db"
	"backend/model"
)

// DeleteCategory soft-deletes a leaf category. It returns ErrCategoryNotFound
// when no row matches and a 409-style sentinel when children or products
// still reference the category.
func DeleteCategory(id uint) error {
	db := DataAccess.DB

	var childCount int64
	if err := db.Model(&model.Category{}).Where("parent_id = ?", id).Count(&childCount).Error; err != nil {
		return err
	}
	if childCount > 0 {
		return ErrCategoryHasChildren
	}

	var productCount int64
	if err := db.Model(&model.Product{}).Where("category_id = ?", int(id)).Count(&productCount).Error; err != nil {
		return err
	}
	if productCount > 0 {
		return ErrCategoryHasProducts
	}

	result := db.Where("id = ?", id).Delete(&model.Category{})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return ErrCategoryNotFound
	}

	return nil
}
