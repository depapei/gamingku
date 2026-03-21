package factory

import (
	"backend/model"
	"crypto/rand"
	"log"
	"math/big"

	gorm_seeder "github.com/kachit/gorm-seeder"
	"gorm.io/gorm"
)

type ProductSpecsSeeder struct {
    gorm_seeder.SeederAbstract
}

func NewProductSpecsSeeder(cfg gorm_seeder.SeederConfiguration) ProductSpecsSeeder {
    return ProductSpecsSeeder{gorm_seeder.NewSeederAbstract(cfg)}
}

var key_constant = []string{
	"brand",
	"connection",
	"weight", 
	"size",
	"switchType",
}
var value_constant = []string{
	"Noir",
	"Triple Connections",
	"1.2 kg", 
	"65%",
	"KTT KU Orange Linear",
}

// Implement Seed method to insert data
func (s *ProductSpecsSeeder) Seed(db *gorm.DB) error {
    var specifications []model.ProductSpecifications
    for i := 0; i < s.Configuration.Rows; i++ {
		min := big.NewInt(1)
		max := big.NewInt(5)
		rangeVal := new(big.Int).Sub(max, min)
		rangeVal.Add(rangeVal, big.NewInt(1))
		n, err := rand.Int(rand.Reader, rangeVal)
		if err != nil {
			log.Fatal(err)
		}
		array_key := int(n.Int64())

        specification := model.ProductSpecifications{
			Key: key_constant[array_key],
            Name: value_constant[array_key],
			ProductId: i + 1,
			CreatedById: 1,
        }
        specifications = append(specifications, specification)
    }
    return db.CreateInBatches(specifications, s.Configuration.Rows).Error
}

// Implement Clear method to remove seeded data
func (s *ProductSpecsSeeder) Clear(db *gorm.DB) error {
    // ... logic to delete seeded data
    return s.SeederAbstract.Delete(db, "product_specifications")
}
