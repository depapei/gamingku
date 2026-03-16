package factory

import (
	"backend/model"
	"crypto/rand"
	"fmt"
	"log"
	"math/big"

	gorm_seeder "github.com/kachit/gorm-seeder"
	"gorm.io/gorm"
)

type ProductVariantsSeeder struct {
    gorm_seeder.SeederAbstract
}

func NewProductVariantsSeeder(cfg gorm_seeder.SeederConfiguration) ProductVariantsSeeder {
    return ProductVariantsSeeder{gorm_seeder.NewSeederAbstract(cfg)}
}

// Implement Seed method to insert data
func (s *ProductVariantsSeeder) Seed(db *gorm.DB) error {
    var variants []model.ProductVariants
    for i := 0; i < s.Configuration.Rows; i++ {
		min := big.NewInt(10000)
		max := big.NewInt(99999)
		rangeVal := new(big.Int).Sub(max, min)
		rangeVal.Add(rangeVal, big.NewInt(1))
		n, err := rand.Int(rand.Reader, rangeVal)
		if err != nil {
			log.Fatal(err)
		}

        product := model.ProductVariants{
            Name: fmt.Sprintf("Color #%d", n),
			ProductId: i + 1,
			CreatedById: 1,
        }
        variants = append(variants, product)
    }
    return db.CreateInBatches(variants, s.Configuration.Rows).Error
}

// Implement Clear method to remove seeded data
func (s *ProductVariantsSeeder) Clear(db *gorm.DB) error {
    // ... logic to delete seeded data
    return s.SeederAbstract.Delete(db, "product_variants")
}
