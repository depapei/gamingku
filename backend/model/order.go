package model

import (
	"time"

	"gorm.io/gorm"
)

type Order struct {
	ID         uint           `gorm:"primaryKey"`
	UserId     int            `json:"userId"`
	TotalPrice float64        `json:"totalPrice"`
	Status     string         `gorm:"type:varchar(20);check:status IN ('pending','processing','shipped','delivered','cancelled')" json:"status"`
	CreatedAt  time.Time      `json:"createdAt"`
	UpdatedAt  time.Time      `json:"updatedAt"`
	DeletedAt  gorm.DeletedAt `gorm:"index"`

	User  User
	Items []OrderItem `gorm:"foreignKey:OrderId;references:ID"`
}

type OrderItem struct {
	ID        uint    `gorm:"primaryKey"`
	OrderId   int     `json:"orderId"`
	Quantity  float64 `json:"quantity"`
	Price     float64 `json:"price"`
	ProductId int     `json:"productId"`
	VariantId int     `json:"variantId"`

	// Order Order 
	Product Product
	Variant ProductVariants
}
