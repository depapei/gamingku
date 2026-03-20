package AdminCategoryService

import (
	DataAccess "backend/db"
	"backend/model"
	"log"
)

func DeleteCategory(id string) error {
	raw := DataAccess.DB

	var deletedCategory model.Category

	err := raw.Where("id = ?", id).Delete(&deletedCategory).Error; if err != nil {
		log.Println(err.Error())
		return err
	}

	return err
}