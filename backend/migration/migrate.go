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
		&model.VariantOptions{},
		&model.ProductVariants{},
		&model.Product{},
		&model.Order{},
		&model.OrderItem{},
	)
}