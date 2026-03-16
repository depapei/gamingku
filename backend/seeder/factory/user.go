package factory

import (
	"backend/model"
	"fmt"

	gorm_seeder "github.com/kachit/gorm-seeder"
	"gorm.io/gorm"
)

type UsersSeeder struct {
    gorm_seeder.SeederAbstract
}

func NewUsersSeeder(cfg gorm_seeder.SeederConfiguration) UsersSeeder {
    return UsersSeeder{gorm_seeder.NewSeederAbstract(cfg)}
}

// Implement Seed method to insert data
func (s *UsersSeeder) Seed(db *gorm.DB) error {
    var users []model.User
    for i := 0; i < s.Configuration.Rows; i++ {
        product := model.User{
            Name: fmt.Sprintf("Test %d", i + 1),
            Email: fmt.Sprintf("test%d@example.com", i),
			Role: "admin",
        }
        users = append(users, product)
    }
    return db.CreateInBatches(users, s.Configuration.Rows).Error
}

// Implement Clear method to remove seeded data
func (s *UsersSeeder) Clear(db *gorm.DB) error {
    // ... logic to delete seeded data
    return s.SeederAbstract.Delete(db, "users")
}
