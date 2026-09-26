package Product

import (
	"backend/helper/type/user"
	"time"

	"github.com/lib/pq"
)

// ResSpec is a key/value specification entry for a product.
type ResSpec struct {
	Key  string `json:"key" binding:"required"`
	Name string `json:"name" binding:"required"`
}

// ResOption is a selectable option within a product variant.
type ResOption struct {
	ID          uint   `json:"id,omitempty"`
	Name        string `json:"name" binding:"required"`
	IsAvailable bool   `json:"isAvailable"`
}

// ResVariant groups options under a named variant (e.g. "Color").
type ResVariant struct {
	ID      uint        `json:"id,omitempty"`
	Name    string      `json:"name" binding:"required"`
	Options []ResOption `json:"options" binding:"required,dive"`
}

// ResProduct is the canonical admin read model for a product.
type ResProduct struct {
	ID             uint           `json:"id,omitempty"`
	Name           string         `json:"name" binding:"required"`
	Slug           string         `json:"slug" binding:"required"`
	Price          float64        `json:"price" binding:"required,gt=0"`
	DiscountPrice  float64        `json:"discountPrice,omitempty"`
	Stock          float64        `json:"stock" binding:"required,gte=0"`
	CategoryId     int            `json:"categoryId" binding:"required"`
	Category       *string        `json:"category,omitempty"`
	Images         pq.StringArray `json:"images" binding:"required,min=1"`
	Rating         int            `json:"rating"`
	ReviewCount    int            `json:"reviewCount"`
	Description    string         `json:"description" binding:"required"`
	Variants       []ResVariant   `json:"variants,omitempty" binding:"omitempty,dive"`
	Featured       bool           `json:"featured"`
	Specifications []ResSpec      `json:"specifications,omitempty" binding:"omitempty,dive"`
	CreatedById    *int           `json:"createdBy,omitempty"`
	CreatedAt      time.Time      `json:"createdAt,omitempty"`
	UpdatedAt      time.Time      `json:"updatedAt,omitempty"`

	CreatedBy user.UserInfo `json:"createdByUser"`
}

// ProductResponse is the canonical alias of ResProduct.
type ProductResponse = ResProduct

// CreateProductInput is the validated payload for creating a product.
// CreatedById is optional: when omitted the server derives the creator
// from the authenticated JWT identity. The json key "createdBy" is kept
// for backward compatibility with existing clients.
type CreateProductInput struct {
	Name           string         `json:"name" binding:"required,min=2"`
	Slug           string         `json:"slug" binding:"required,min=2"`
	Price          float64        `json:"price" binding:"required,gt=0"`
	DiscountPrice  float64        `json:"discountPrice,omitempty"`
	Stock          float64        `json:"stock" binding:"required,gte=0"`
	CategoryId     int            `json:"categoryId" binding:"required"`
	Images         pq.StringArray `json:"images" binding:"required,min=1"`
	Description    string         `json:"description" binding:"required"`
	Featured       bool           `json:"featured"`
	Variants       []ResVariant   `json:"variants,omitempty" binding:"omitempty,dive"`
	Specifications []ResSpec      `json:"specifications,omitempty" binding:"omitempty,dive"`
	CreatedById    *int           `json:"createdBy,omitempty"`
}

// UpdateProductInput is the validated payload for updating a product.
// Slug is immutable: when the body carries a slug it must match the route
// :slug, otherwise the request is rejected with a mismatch error.
type UpdateProductInput struct {
	Slug           string         `json:"slug,omitempty"`
	Name           string         `json:"name" binding:"required,min=2"`
	Price          float64        `json:"price" binding:"required,gt=0"`
	DiscountPrice  float64        `json:"discountPrice,omitempty"`
	Stock          float64        `json:"stock" binding:"required,gte=0"`
	CategoryId     int            `json:"categoryId" binding:"required"`
	Images         pq.StringArray `json:"images" binding:"required,min=1"`
	Description    string         `json:"description" binding:"required"`
	Featured       bool           `json:"featured"`
	Variants       []ResVariant   `json:"variants,omitempty" binding:"omitempty,dive"`
	Specifications []ResSpec      `json:"specifications,omitempty" binding:"omitempty,dive"`
}

// ResIndexProduct is the lightweight row model for the admin product list.
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

// ProductListParams carries validated list/search/sort/pagination options.
type ProductListParams struct {
	Category string
	Search   string
	SortBy   string
	Sort     string
	Page     int
	Limit    int
}

// PaginatedProductResponse is the envelope for paginated admin list results.
type PaginatedProductResponse struct {
	Data  []ResIndexProduct `json:"data"`
	Total int64             `json:"total"`
	Page  int               `json:"page"`
	Limit int               `json:"limit"`
}
