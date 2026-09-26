package model

import (
	"database/sql/driver"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/lib/pq"
	"gorm.io/gorm"
)

// Category is a product category node in a self-referential hierarchy.
// ParentId is nullable for root categories and indexed for child lookups.
// Slug is globally unique. Soft-delete is enabled via DeletedAt.
type Category struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	Name        string         `gorm:"not null" json:"name"`
	Slug        string         `gorm:"uniqueIndex;not null" json:"slug"`
	ParentId    *int           `gorm:"index" json:"parentId"`
	Image       string         `json:"image"`
	CreatedAt   time.Time      `json:"createdAt"`
	UpdatedAt   time.Time      `json:"updatedAt"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"deletedAt"`
	CreatedById int            `gorm:"column:created_by" json:"createdBy"`

	CreatedBy User      `gorm:"foreignKey:CreatedById;references:ID" json:"createdByUser,omitempty"`
	Product   []Product `gorm:"foreignKey:CategoryId;references:ID" json:"-"`
}

// StringArray is a string slice stored as a JSON array in a text column.
// It decodes both JSON arrays (["a","b"]) and legacy postgres array literals
// ({"a","b"}) on read, so a single legacy row can never fail a whole query,
// and it always encodes JSON on write.
type StringArray []string

// GormDataType returns the column type for StringArray.
func (StringArray) GormDataType() string {
	return "text"
}

// Scan implements sql.Scanner for StringArray.
func (a *StringArray) Scan(value any) error {
	if value == nil {
		*a = nil
		return nil
	}
	var s string
	switch v := value.(type) {
	case string:
		s = v
	case []byte:
		s = string(v)
	default:
		return fmt.Errorf("unsupported scan type %T for StringArray", value)
	}
	s = strings.TrimSpace(s)
	if s == "" || s == "null" {
		*a = nil
		return nil
	}
	if strings.HasPrefix(s, "[") {
		var out []string
		if err := json.Unmarshal([]byte(s), &out); err != nil {
			return err
		}
		*a = out
		return nil
	}
	var out []string
	if err := pq.Array(&out).Scan(value); err != nil {
		return err
	}
	*a = out
	return nil
}

// Value implements driver.Valuer for StringArray.
func (a StringArray) Value() (driver.Value, error) {
	if a == nil {
		return "[]", nil
	}
	b, err := json.Marshal([]string(a))
	if err != nil {
		return nil, err
	}
	return string(b), nil
}

// Product is a sellable item belonging to a Category.
// Slug is globally unique. Soft-delete is enabled via DeletedAt.
type Product struct {
	ID            uint        `gorm:"primaryKey" json:"id"`
	Name          string      `gorm:"not null" json:"name"`
	Slug          string      `gorm:"uniqueIndex;not null" json:"slug"`
	Price         float64     `gorm:"not null" json:"price"`
	DiscountPrice float64     `json:"discountPrice"`
	Stock         float64     `gorm:"not null" json:"stock"`
	CategoryId    int         `gorm:"not null;index" json:"categoryId"`
	Images        StringArray `json:"images"`
	Rating        int8           `json:"rating"`
	ReviewCount   int64          `json:"reviewCount"`
	Description   string         `json:"description"`
	Featured      bool           `gorm:"default:false" json:"featured"`
	CreatedAt     time.Time      `json:"createdAt"`
	UpdatedAt     time.Time      `json:"updatedAt"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`
	CreatedById   int            `gorm:"column:created_by" json:"createdBy"`

	CreatedBy      User                   `gorm:"foreignKey:CreatedById;references:ID" json:"-"`
	Category       Category               `gorm:"foreignKey:CategoryId;references:ID" json:"-"`
	Variants       []ProductVariants      `gorm:"foreignKey:ProductId;references:ID" json:"-"`
	Specifications []ProductSpecifications `gorm:"foreignKey:ProductId;references:ID" json:"-"`
}

// ProductVariants groups variant options for a Product.
type ProductVariants struct {
	ID          uint           `gorm:"primaryKey"`
	ProductId   int            `gorm:"index" json:"productId"`
	Name        string         `gorm:"not null" json:"name"`
	CreatedAt   time.Time      `json:"createdAt"`
	UpdatedAt   time.Time      `json:"updatedAt"`
	DeletedAt   gorm.DeletedAt `gorm:"index"`
	CreatedById int            `gorm:"column:created_by" json:"createdBy"`

	CreatedBy User            `gorm:"foreignKey:CreatedById;references:ID" json:"-"`
	Options   []VariantOptions `gorm:"foreignKey:VariantId;references:ID" json:"-"`
}

// VariantOptions is a selectable option within a ProductVariants group.
type VariantOptions struct {
	ID          uint           `gorm:"primaryKey"`
	VariantId   int            `gorm:"index" json:"variantId"`
	Name        string         `gorm:"not null" json:"name"`
	IsAvailable bool           `json:"available"`
	CreatedAt   time.Time      `json:"createdAt"`
	UpdatedAt   time.Time      `json:"updatedAt"`
	DeletedAt   gorm.DeletedAt `gorm:"index"`
	CreatedById int            `gorm:"column:created_by" json:"createdBy"`

	CreatedBy       User            `gorm:"foreignKey:CreatedById;references:ID" json:"-"`
	ProductVariants ProductVariants `gorm:"foreignKey:VariantId;references:ID" json:"-"`
}

// ProductSpecifications is a key/value spec entry for a Product.
type ProductSpecifications struct {
	ID          uint           `gorm:"primaryKey"`
	ProductId   int            `gorm:"index" json:"productId"`
	Key         string         `gorm:"not null" json:"key"`
	Name        string         `gorm:"not null" json:"name"`
	CreatedAt   time.Time      `json:"createdAt"`
	UpdatedAt   time.Time      `json:"updatedAt"`
	DeletedAt   gorm.DeletedAt `gorm:"index"`
	CreatedById int            `gorm:"column:created_by" json:"createdBy"`

	CreatedBy User    `gorm:"foreignKey:CreatedById;references:ID" json:"-"`
	Product   Product `gorm:"foreignKey:ProductId;references:ID" json:"-"`
}

// SpecificationKeys is the master list of specification key names.
type SpecificationKeys struct {
	ID          uint `gorm:"primaryKey"`
	Name        string
	CreatedAt   time.Time      `json:"createdAt"`
	UpdatedAt   time.Time      `json:"updatedAt"`
	DeletedAt   gorm.DeletedAt `gorm:"index"`
	CreatedById int            `gorm:"column:created_by" json:"createdBy"`

	CreatedBy User
}
