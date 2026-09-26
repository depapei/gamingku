package AdminCategoryService

import (
	DataAccess "backend/db"
	Category "backend/helper/type/category"
	"backend/model"
	"errors"
	"strings"

	"gorm.io/gorm"
)

// UpdateCategory updates exactly one category row. The id argument (from the
// route) is the source of truth; a mismatched body id is rejected.
func UpdateCategory(id uint, input Category.UpdateCategoryInput) error {
	if input.ID != 0 && input.ID != id {
		return ErrIDMismatch
	}

	if strings.TrimSpace(input.Name) == "" || strings.TrimSpace(input.Slug) == "" || strings.TrimSpace(input.Image) == "" {
		return errors.New("name, slug and image are required")
	}

	db := DataAccess.DB

	var current model.Category
	if err := db.First(&current, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrCategoryNotFound
		}
		return err
	}

	if input.ParentId != nil {
		if *input.ParentId == int(id) {
			return ErrInvalidParent
		}
		var parent model.Category
		if err := db.First(&parent, "id = ?", *input.ParentId).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return ErrParentNotFound
			}
			return err
		}
		if parent.ParentId != nil && *parent.ParentId == int(id) {
			return ErrInvalidParent
		}
	}

	var clash model.Category
	if err := db.Where("slug = ? AND id <> ?", strings.TrimSpace(input.Slug), id).First(&clash).Error; err == nil {
		return ErrSlugConflict
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		return err
	}

	updates := map[string]interface{}{
		"name":       strings.TrimSpace(input.Name),
		"slug":       strings.TrimSpace(input.Slug),
		"image":      strings.TrimSpace(input.Image),
		"parent_id":  input.ParentId,
	}

	if err := db.Model(&model.Category{}).Where("id = ?", id).Updates(updates).Error; err != nil {
		if strings.Contains(strings.ToLower(err.Error()), "duplicate") {
			return ErrSlugConflict
		}
		return err
	}

	return nil
}
