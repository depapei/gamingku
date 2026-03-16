package factory

import (
	"backend/model"
	"fmt"

	gorm_seeder "github.com/kachit/gorm-seeder"
	"gorm.io/gorm"
)

type CategoriesSeeder struct {
    gorm_seeder.SeederAbstract
}

func NewCategoriesSeeder(cfg gorm_seeder.SeederConfiguration) CategoriesSeeder {
    return CategoriesSeeder{gorm_seeder.NewSeederAbstract(cfg)}
}

// Implement Seed method to insert data
func (s *CategoriesSeeder) Seed(db *gorm.DB) error {
    var categories []model.Category
    for i := 0; i < s.Configuration.Rows; i++ {
        product := model.Category{
            Name: fmt.Sprintf("%d Keyboards", i+1),
			Slug: "keyboards",
			Image: "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=800",
			CreatedById: i + 1,
        }
        categories = append(categories, product)
    }
    return db.CreateInBatches(categories, s.Configuration.Rows).Error
}

// Implement Clear method to remove seeded data
func (s *CategoriesSeeder) Clear(db *gorm.DB) error {
    // ... logic to delete seeded data
    return s.SeederAbstract.Delete(db, "categories")
}
