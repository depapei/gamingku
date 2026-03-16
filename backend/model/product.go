package model

import (
	"time"

	"gorm.io/gorm"
)

type Category struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	Name        string         `json:"name"`
	Slug        string         `json:"slug"`
	ParentId    *int           `json:"parentId"`
	Image       string         `json:"image"`
	CreatedAt   time.Time      `json:"createdAt"`
	UpdatedAt   time.Time      `json:"updatedAt"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"deletedAt"`
	CreatedById int            `json:"createdBy"`

	CreatedBy User
	Product   []Product
}

type Product struct {
	ID            uint           `gorm:"primaryKey" json:"id"`
	Name          string         `json:"name"`
	Slug          string         `json:"slug"`
	Price         float64        `json:"price"`
	DiscountPrice float64        `json:"discountPrice"`
	Stock         float64        `json:"stock"`
	CategoryId    int            `json:"categoryId"`
	Rating        int8           `json:"rating"`
	ReviewCount   int64          `json:"reviewCount"`
	Description   string         `json:"description"`
	Featured      bool           `json:"featured"`
	CreatedAt     time.Time      `json:"createdAt"`
	UpdatedAt     time.Time      `json:"updatedAt"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"deletedAt"`
	CreatedById int              `gorm:"column:created_by" json:"createdBy"`

	CreatedBy      User
	Variants       []ProductVariants
	Specifications []ProductSpecifications
}

type ProductVariants struct {
	ID          uint           `gorm:"primaryKey"`
	ProductId   int            `json:"productId"`
	Name        string         `json:"name"`
	CreatedAt   time.Time      `json:"createdAt"`
	UpdatedAt   time.Time      `json:"updatedAt"`
	DeletedAt   gorm.DeletedAt `gorm:"index"`
	CreatedById int            `gorm:"column:created_by" json:"createdBy"`

	CreatedBy User
	Options   []VariantOptions `gorm:"foreignKey:ID;refrences:VariantId"`
}

type VariantOptions struct {
	ID          uint           `gorm:"primaryKey"`
	VariantId   int            `json:"variantId"`
	Name        string         `json:"name"`
	CreatedAt   time.Time      `json:"createdAt"`
	UpdatedAt   time.Time      `json:"updatedAt"`
	DeletedAt   gorm.DeletedAt `gorm:"index"`
	CreatedById int            `json:"createdBy"`

	CreatedBy       User
	ProductVariants ProductVariants `gorm:"foreignKey:VariantId;refrences:ID"`
}

type ProductSpecifications struct {
	ID          uint           `gorm:"primaryKey"`
	ProductId   int            `json:"productId"`
	Key         string         `json:"key"`
	Name        string         `json:"name"`
	CreatedAt   time.Time      `json:"createdAt"`
	UpdatedAt   time.Time      `json:"updatedAt"`
	DeletedAt   gorm.DeletedAt `gorm:"index"`
	CreatedById int            `json:"createdBy"`

	CreatedBy User
	Product   Product
}

type SpecificationKeys struct {
	ID          uint `gorm:"primaryKey"`
	Name        string
	CreatedAt   time.Time      `json:"createdAt"`
	UpdatedAt   time.Time      `json:"updatedAt"`
	DeletedAt   gorm.DeletedAt `gorm:"index"`
	CreatedById int            `json:"createdBy"`

	CreatedBy User
}
