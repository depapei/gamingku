package seeder

import (
	DataAccess "backend/db"
	"backend/seeder/factory"
	"fmt"

	gorm_seeder "github.com/kachit/gorm-seeder"
)

func Stack() {

	userSeeder := &factory.UsersSeeder{
		SeederAbstract: gorm_seeder.NewSeederAbstract(gorm_seeder.SeederConfiguration{
			Rows: 1,
		}),
	}
	categorySeeder := &factory.CategoriesSeeder{
        SeederAbstract: gorm_seeder.NewSeederAbstract(gorm_seeder.SeederConfiguration{
			Rows: 1,
		}),
    }
	productSeeder := &factory.ProductsSeeder{
        SeederAbstract: gorm_seeder.NewSeederAbstract(gorm_seeder.SeederConfiguration{
			Rows: 10,
		}),
    }
	variantSeeder := &factory.ProductVariantsSeeder{
        SeederAbstract: gorm_seeder.NewSeederAbstract(gorm_seeder.SeederConfiguration{
			Rows: 10,
		}),
    }
	OptionsSeeder := &factory.ProductOptionsSeeder{
        SeederAbstract: gorm_seeder.NewSeederAbstract(gorm_seeder.SeederConfiguration{
			Rows: 10,
		}),
    }
	SpecsSeeder := &factory.ProductSpecsSeeder{
        SeederAbstract: gorm_seeder.NewSeederAbstract(gorm_seeder.SeederConfiguration{
			Rows: 10,
		}),
    }

	stack := gorm_seeder.NewSeedersStack(DataAccess.DB)

	stack.AddSeeder(userSeeder)
	stack.AddSeeder(categorySeeder)
	stack.AddSeeder(productSeeder)
	stack.AddSeeder(variantSeeder)
	stack.AddSeeder(OptionsSeeder)
	stack.AddSeeder(SpecsSeeder)


	seedErr := stack.Seed()
	fmt.Println(seedErr)

	// Apply clear
	// seedErr = stack.Clear()
	// fmt.Println(seedErr)
}