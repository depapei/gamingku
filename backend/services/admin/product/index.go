package AdminProductService

import (
	DataAccess "backend/db"
	Product "backend/helper/type/product"
	"backend/model"
	"strings"

	"github.com/lib/pq"
	"gorm.io/gorm"
)

// sortColumnAllowlist maps public sort keys to safe DB columns.
var sortColumnAllowlist = map[string]string{
	"name":       "products.name",
	"price":      "products.price",
	"stock":      "products.stock",
	"createdAt":  "products.created_at",
	"created_at": "products.created_at",
	"updatedAt":  "products.updated_at",
	"updated_at": "products.updated_at",
}

// GetProducts returns a paginated, searchable, safely-sorted admin product list.
func GetProducts(params Product.ProductListParams) (Product.PaginatedProductResponse, error) {
	page := params.Page
	if page <= 0 {
		page = 1
	}
	limit := params.Limit
	if limit <= 0 {
		limit = 20
	}
	if limit > 50 {
		limit = 50
	}

	base := DataAccess.DB.Model(&model.Product{})
	if trimmed := strings.TrimSpace(params.Category); trimmed != "" {
		base = base.Where(`category_id = ? OR category_id IN (SELECT id FROM categories WHERE parent_id = ?)`, trimmed, trimmed)
	}
	if trimmed := strings.TrimSpace(params.Search); trimmed != "" {
		pattern := "%" + trimmed + "%"
		base = base.Where("LOWER(products.name) LIKE LOWER(?)", pattern)
	}

	var total int64
	if err := base.Count(&total).Error; err != nil {
		return Product.PaginatedProductResponse{}, err
	}

	column, ok := sortColumnAllowlist[params.SortBy]
	if !ok {
		if strings.EqualFold(params.SortBy, "arrival") {
			column = "products.created_at"
		} else {
			column = "products.name"
		}
	}
	direction := "ASC"
	if strings.EqualFold(params.Sort, "desc") {
		direction = "DESC"
	}

	var products []model.Product
	err := base.
		Select("id", "name", "price", "discount_price", "stock", "category_id", "featured", "slug", "images").
		Preload("Category", func(db *gorm.DB) *gorm.DB {
			return db.Select("id", "name", "parent_id")
		}).
		Order(column + " " + direction).
		Limit(limit).
		Offset((page - 1) * limit).
		Find(&products).Error
	if err != nil {
		return Product.PaginatedProductResponse{}, err
	}

	data := make([]Product.ResIndexProduct, 0, len(products))
	for _, product := range products {
		product := product
		categoryID := product.CategoryId
		data = append(data, Product.ResIndexProduct{
			ID:            product.ID,
			Name:          product.Name,
			Slug:          product.Slug,
			Price:         product.Price,
			DiscountPrice: product.DiscountPrice,
			Stock:         product.Stock,
			Images:        pq.StringArray(product.Images),
			CategoryId:    &categoryID,
			Category:      &product.Category.Name,
			Featured:      product.Featured,
		})
	}

	return Product.PaginatedProductResponse{
		Data:  data,
		Total: total,
		Page:  page,
		Limit: limit,
	}, nil
}
