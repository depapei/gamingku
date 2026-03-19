package factory

import (
	"backend/model"
	"fmt"

	gorm_seeder "github.com/kachit/gorm-seeder"
	"gorm.io/gorm"
)

type ProductOptionsSeeder struct {
	gorm_seeder.SeederAbstract
}

func NewProductOptionsSeeder(cfg gorm_seeder.SeederConfiguration) ProductOptionsSeeder {
	return ProductOptionsSeeder{gorm_seeder.NewSeederAbstract(cfg)}
}

// Implement Seed method to insert data
func (s *ProductOptionsSeeder) Seed(db *gorm.DB) error {
	var categories []model.VariantOptions
	for i := 0; i < s.Configuration.Rows; i++ {
		isAvailable := i%2 == 0
		product := model.VariantOptions{
			Name:        fmt.Sprintf("Options %d", i+1),
			VariantId:   i + 1,
			CreatedById: 1,
			IsAvailable: isAvailable,
		}
		categories = append(categories, product)
	}
	return db.CreateInBatches(categories, s.Configuration.Rows).Error
}

// Implement Clear method to remove seeded data
func (s *ProductOptionsSeeder) Clear(db *gorm.DB) error {
	// ... logic to delete seeded data
	return s.SeederAbstract.Delete(db, "product_option")
}
