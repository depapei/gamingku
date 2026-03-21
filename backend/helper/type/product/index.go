package Product

import (
	"backend/helper/type/user"

	"github.com/lib/pq"
)

type ResSpec struct {
	Key  string `json:"key" binding:"required"`
	Name string `json:"name" binding:"required"`
}

type ResOption struct {
	ID          *int   `json:"id,omitempty" binding:"required"`
	Name        string `json:"name" binding:"required"`
	IsAvailable bool   `json:"isAvailable" binding:"required"`
}

type ResVariant struct {
	ID      uint        `json:"id,omitempty"`
	Name    string      `json:"name" binding:"required"`
	Options []ResOption `json:"options" binding:"required,dive"`
}

type ResProduct struct {
	ID             uint           `json:"id,omitempty"`
	Name           string         `json:"name" binding:"required"`
	Slug           string         `json:"slug" binding:"required"`
	Price          float64        `json:"price" binding:"required"`
	DiscountPrice  float64        `json:"discountPrice" binding:"required"`
	Stock          float64        `json:"stock" binding:"required"`
	CategoryId     int            `json:"categoryId" binding:"required"`
	Images         pq.StringArray `json:"images" binding:"required"`
	Rating         int            `json:"rating"`
	ReviewCount    int            `json:"reviewCount"`
	Description    string         `json:"description" binding:"required"`
	Variants       []ResVariant   `json:"variants" binding:"required"`
	Featured       *bool          `json:"featured,omitempty"`
	Specifications []ResSpec      `json:"specifications" binding:"required"`
	CreatedById    *int           `json:"createdBy,omitempty" binding:"required"`

	CreatedBy user.UserInfo `json:"createdByUser"`
}

type ResIndexProduct struct {
	ID            uint           `json:"id"`
	Name          string         `json:"name"`
	Slug          string         `json:"slug"`
	Price         float64        `json:"price"`
	DiscountPrice float64        `json:"discountPrice"`
	Stock         float64        `json:"stock"`
	CategoryId    *int           `json:"categoryId,omitempty"`
	Category      *string        `json:"category"`
	Featured      bool           `json:"featured"`
	Images        pq.StringArray `json:"images"`
}
