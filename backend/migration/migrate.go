package Migration

import (
	"backend/model"

	"gorm.io/gorm"
)

// Migrate runs GORM AutoMigrate for all domain models, including the
// refresh-token session table used by the JWT rotation flow.
func Migrate(db *gorm.DB) {
	db.AutoMigrate(
		&model.User{},
		&model.RefreshToken{},
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
