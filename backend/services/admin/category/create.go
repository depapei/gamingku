package AdminCategoryService

import (
	DataAccess "backend/db"
	Category "backend/helper/type/category"
	"backend/model"
	"log"
)

func CreateCategory(input Category.ResCategory) error {
	raw := DataAccess.DB

	newCategory := model.Category{
		Name:        input.Name,
		Slug:        *input.Slug,
		ParentId:    input.ParentId,
		Image:       input.Image,
		CreatedById: input.CreatedById,
	}

	err := raw.Create(&newCategory).Error
	if err != nil {
		log.Println(err.Error())
		return err
	}

	return err
}
