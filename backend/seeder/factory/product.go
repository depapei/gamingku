package factory

import (
	"backend/model"
	"fmt"

	gorm_seeder "github.com/kachit/gorm-seeder"
	"gorm.io/gorm"
)

type ProductsSeeder struct {
    gorm_seeder.SeederAbstract
}

func NewProductsSeeder(cfg gorm_seeder.SeederConfiguration) ProductsSeeder {
    return ProductsSeeder{gorm_seeder.NewSeederAbstract(cfg)}
}

// Implement Seed method to insert data
func (s *ProductsSeeder) Seed(db *gorm.DB) error {
    var products []model.Product
    for i := 0; i < s.Configuration.Rows; i++ {
        product := model.Product{
            Name: fmt.Sprintf("Pro Mechanical Keyboard X%d", i),
            Slug: fmt.Sprintf("pro-mechanical-keyboard-x%d", i),
            Price: 1499000,
			DiscountPrice: 1299000,
			Stock: 50,
			CategoryId: 1,
			Images: []string{
                "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=1200",
                "https://images.unsplash.com/photo-1601445638532-3c6f6c3aa1d6?auto=format&fit=crop&q=80&w=1200",
                "https://unsplash.com/photos/a-keyboard-and-a-mouse-on-a-table-Nzlzf7e3g8k",
            },
			Rating: 4,
			ReviewCount: 125,
			Description: "A premium mechanical keyboard with custom tactile switches, RGB backlighting, and an aluminum frame. Perfect for both gaming and typing.",
			Featured: true,
            CreatedById: 1,
        }
        products = append(products, product)
    }
    return db.CreateInBatches(products, s.Configuration.Rows).Error
}

// Implement Clear method to remove seeded data
func (s *ProductsSeeder) Clear(db *gorm.DB) error {
    // ... logic to delete seeded data
    return s.SeederAbstract.Delete(db, "products")
}
