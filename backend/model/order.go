package model

import (
	"time"

	"github.com/lib/pq"
	"gorm.io/gorm"
)

// Order is a customer purchase with lifecycle status.
// OrderNumber (ORD-YYYYMMDD-XXXX) is generated server-side and unique.
// Status is one of pending, paid, processing, completed, cancelled, refunded.
// Soft-delete is enabled via DeletedAt.
type Order struct {
	ID            uint           `gorm:"primaryKey" json:"id"`
	OrderNumber   string         `gorm:"uniqueIndex;not null" json:"orderNumber"`
	UserId        *int           `gorm:"index" json:"userId,omitempty"`
	Customer      string         `gorm:"not null" json:"customer"`
	Address       string         `gorm:"not null" json:"address"`
	Email         string         `gorm:"not null" json:"email"`
	Status        string         `gorm:"type:varchar(20);not null;default:pending;check:status IN ('pending','paid','processing','completed','cancelled','refunded')" json:"status"`
	TotalPrice    float64        `gorm:"not null" json:"totalPrice"`
	PaymentMethod string         `gorm:"type:varchar(20);not null;default:cod" json:"paymentMethod"`
	CreatedAt     time.Time      `json:"createdAt"`
	UpdatedAt     time.Time      `json:"updatedAt"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`

	User  User        `gorm:"foreignKey:UserId;references:ID" json:"-"`
	Items []OrderItem `gorm:"foreignKey:OrderId;references:ID" json:"items,omitempty"`
}

// OrderItem is a single product line within an Order.
// VariantId stores option IDs as a JSON array.
type OrderItem struct {
	ID        uint          `gorm:"primaryKey" json:"id"`
	OrderId   int           `gorm:"not null;index" json:"orderId"`
	Quantity  float64       `gorm:"not null" json:"quantity"`
	Price     float64       `gorm:"not null" json:"price"`
	ProductId int           `gorm:"not null;index" json:"productId"`
	VariantId pq.Int64Array `gorm:"serializer:json" json:"variantId"`

	Product Product `gorm:"foreignKey:ProductId;references:ID" json:"-"`
}
