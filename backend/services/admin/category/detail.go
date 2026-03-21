package AdminCategoryService

import (
	DataAccess "backend/db"
	"backend/model"
)

func GetDetail(id string) (ResCategory, error) {

	var category model.Category
	var childrens []model.Category

	raw := DataAccess.DB
	raw.Find(&childrens, "parent_id = ?", id)

	err := raw.First(&category, "id = ?", id).Error

	var response ResCategory
	var resChilds []*CategoryChild
	for _, catChild := range childrens{
		resChilds = append(resChilds, &CategoryChild{
			ID: catChild.ID,
			Name: catChild.Name,
			Image: catChild.Image,
		})
	}

	response = ResCategory{
		ID: category.ID,
		Image: category.Image,
		Name: category.Name,
		ParentId: category.ParentId,
		Childs: resChilds,
	}

	return response, err
}