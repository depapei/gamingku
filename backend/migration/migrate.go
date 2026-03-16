package Migration

import (
	"backend/model"

	"gorm.io/gorm"
)

func Migrate(db *gorm.DB) {
	db.AutoMigrate(
		&model.User{},
		&model.Category{},
		&model.SpecificationKeys{},
		&model.ProductSpecifications{},
		&model.ProductVariants{},
		&model.VariantOptions{},
		&model.Product{},
		&model.Order{},
		&model.OrderItem{},
	)
}