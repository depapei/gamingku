package Migration

import (
	"backend/model"

	"gorm.io/gorm"
)

// Migrate runs GORM AutoMigrate for all domain models, including the
// refresh-token session table used by the JWT rotation flow.
//
// Order status note: the orders check constraint now covers
// (pending,paid,processing,completed,cancelled,refunded); legacy rows using
// shipped/delivered are treated as processing/completed by the order service
// mapper. AutoMigrate does not rewrite an existing Postgres check
// constraint, so pre-existing databases need a manual ALTER TABLE to widen
// it; fresh installs get the target set directly.
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
