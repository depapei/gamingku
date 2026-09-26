package model

import (
	"time"

	"gorm.io/gorm"
)

// User is the canonical account record for admins and customers.
// Password holds a bcrypt hash and is never serialized to JSON.
type User struct {
	ID       uint   `gorm:"primaryKey" json:"id"`
	Name     string `gorm:"not null" json:"name"`
	Email    string `gorm:"uniqueIndex;not null" json:"email"`
	Password string `gorm:"not null" json:"-"`

	// Role is one of superadmin, admin, customer. NOTE: postgres does not
	// rewrite an existing CHECK via AutoMigrate; existing databases need the
	// one-off SQL: ALTER TABLE users DROP CONSTRAINT IF EXISTS <role_check>;
	// ALTER TABLE users ADD CONSTRAINT <role_check> CHECK (role IN
	// ('superadmin','admin','customer')); UPDATE users SET is_active = true
	// WHERE is_active IS NULL; fresh databases need nothing.
	Role     string `gorm:"not null;default:customer;type:varchar(16);check:role IN ('superadmin','admin','customer')" json:"role"`
	IsActive bool   `gorm:"default:true" json:"isActive"`
	Avatar   string `json:"avatar,omitempty"`

	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	// Categories            []Category
	// Products              []Product
	// ProductVariants       []ProductVariants
	// VariantOptions        []VariantOptions
	// ProductSpecifications []ProductSpecifications
	// SpecificationKeys     []SpecificationKeys
}
