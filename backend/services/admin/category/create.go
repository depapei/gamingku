package AdminCategoryService

import (
	DataAccess "backend/db"
	Category "backend/helper/type/category"
	"backend/model"
	"errors"
	"strings"

	"gorm.io/gorm"
)

// CreateCategory creates a category. creatorEmail (from the JWT identity) takes
// precedence over any client-sent creator id. It validates parent existence
// and slug uniqueness without ever dereferencing a nil pointer.
func CreateCategory(input Category.CreateCategoryInput, creatorEmail string) error {
	db := DataAccess.DB

	if strings.TrimSpace(input.Name) == "" || strings.TrimSpace(input.Slug) == "" || strings.TrimSpace(input.Image) == "" {
		return errors.New("name, slug and image are required")
	}

	creatorID := 0
	if strings.TrimSpace(creatorEmail) != "" {
		var creator model.User
		if err := db.Where("email = ?", strings.TrimSpace(creatorEmail)).First(&creator).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return ErrCreatorNotFound
			}
			return err
		}
		creatorID = int(creator.ID)
	} else if input.CreatedById != nil {
		var creator model.User
		if err := db.First(&creator, "id = ?", *input.CreatedById).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return ErrCreatorNotFound
			}
			return err
		}
		creatorID = *input.CreatedById
	} else {
		return ErrCreatorNotFound
	}

	if input.ParentId != nil {
		var parent model.Category
		if err := db.First(&parent, "id = ?", *input.ParentId).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return ErrParentNotFound
			}
			return err
		}
	}

	var existing model.Category
	if err := db.Where("slug = ?", input.Slug).First(&existing).Error; err == nil {
		return ErrSlugConflict
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		return err
	}

	newCategory := model.Category{
		Name:        strings.TrimSpace(input.Name),
		Slug:        strings.TrimSpace(input.Slug),
		ParentId:    input.ParentId,
		Image:       strings.TrimSpace(input.Image),
		CreatedById: creatorID,
	}

	if err := db.Create(&newCategory).Error; err != nil {
		if strings.Contains(strings.ToLower(err.Error()), "duplicate") {
			return ErrSlugConflict
		}
		return err
	}

	return nil
}
