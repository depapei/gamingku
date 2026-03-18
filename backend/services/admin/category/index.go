package AdminCategoryService

import (
	DataAccess "backend/db"
	"backend/model"
)

type ResCategory struct {
	ID       uint     `json:"id"`
	Image    string `json:"image"`
	Name     string   `json:"name"`
	ParentId *int `json:"parentId,omitempty"`
	Childs []*CategoryChild `json:"childs,omitempty"`
}

type CategoryChild struct {
	ID uint `json:"id"`
	Name string `json:"name"`
	Image string `json:"image"`
}

func GetCategories(search string, sortBy string, sort string) ([]ResCategory, error) {

	var categories []model.Category

	raw := DataAccess.DB

	if len(search) > 0 {
		searchPattern := "%" + search + "%"
		raw = raw.Where("LOWER(name) LIKE LOWER(?)", searchPattern)
	}

	if len(sortBy) > 0 {
		sortByPattern := sortBy + " " + sort
		raw = raw.Order(sortByPattern)
	}

	raw.Find(&categories)
	err := raw.Error;

	var response []ResCategory
	for _, cat := range categories {
		response = append(response, ResCategory{
			ID: cat.ID,
			Image: cat.Image,
			Name: cat.Name,
			ParentId: cat.ParentId,
		})
	}

	return response, err
}