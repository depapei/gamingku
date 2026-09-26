package factory

import (
	"backend/model"

	gorm_seeder "github.com/kachit/gorm-seeder"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// UsersSeeder seeds the fixed admin-matrix accounts for local development.
// Dev passwords (documented here only, never logged): superadmin/admin/
// customer accounts all use "password123".
type UsersSeeder struct {
	gorm_seeder.SeederAbstract
}

// NewUsersSeeder builds a UsersSeeder with the given configuration.
func NewUsersSeeder(cfg gorm_seeder.SeederConfiguration) UsersSeeder {
	return UsersSeeder{gorm_seeder.NewSeederAbstract(cfg)}
}

// seedAccount describes one idempotent seed row.
type seedAccount struct {
	name     string
	email    string
	password string
	role     string
}

// Seed upserts users by email so re-seeding never duplicates rows.
func (s *UsersSeeder) Seed(db *gorm.DB) error {
	accounts := []seedAccount{
		{name: "Super Admin", email: "admin@gamingku.com", password: "password123", role: "superadmin"},
		{name: "Admin", email: "staff@gamingku.com", password: "password123", role: "admin"},
		{name: "Customer One", email: "customer1@gamingku.com", password: "password123", role: "customer"},
		{name: "Customer Two", email: "customer2@gamingku.com", password: "password123", role: "customer"},
		{name: "Customer Three", email: "customer3@gamingku.com", password: "password123", role: "customer"},
		{name: "Customer Four", email: "customer4@gamingku.com", password: "password123", role: "customer"},
		{name: "Customer Five", email: "customer5@gamingku.com", password: "password123", role: "customer"},
	}

	for _, account := range accounts {
		hashed, err := bcrypt.GenerateFromPassword([]byte(account.password), bcrypt.DefaultCost)
		if err != nil {
			return err
		}
		user := model.User{
			Name:     account.name,
			Email:    account.email,
			Password: string(hashed),
			Role:     account.role,
			IsActive: true,
		}
		if err := db.Where("email = ?", account.email).Attrs(user).FirstOrCreate(&user).Error; err != nil {
			return err
		}
	}

	return nil
}

// Clear removes seeded data.
func (s *UsersSeeder) Clear(db *gorm.DB) error {
	// ... logic to delete seeded data
	return s.SeederAbstract.Delete(db, "users")
}
