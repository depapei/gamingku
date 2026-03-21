package PubCategoryService

import (
	DataAccess "backend/db"
	"backend/model"
)

type ResCategory struct {
	ID       uint   `json:"id"`
	Name     string `json:"name"`
	Slug     string `json:"slug"`
	ParentId *int `json:"parentId,omitempty"`
	Image    string `json:"image"`
}

func GetCategories() ([]ResCategory, error) {
	var categories []model.Category

	err := DataAccess.DB.Find(&categories).Error

	var result []ResCategory
	for _, category := range categories {
		result = append(result, ResCategory{
			ID: category.ID,
			Name: category.Name,
			Slug: category.Slug,
			ParentId: category.ParentId,
			Image: category.Image,
		})
	}

	return result, err
}
