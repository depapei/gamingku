package AdminProductService

import (
	DataAccess "backend/db"
	Product "backend/helper/type/product"
	"backend/model"

	"gorm.io/gorm"
)

func GetProducts(category string, search string, sortBy string, sort string) ([]Product.ResIndexProduct, error) {
	var products []model.Product
	raw := DataAccess.DB.
		Select("id", "name", "price", "discount_price", "stock", "category_id", "featured", "slug", "images").
		Preload("Category", func(db *gorm.DB) *gorm.DB {
			return db.Select("id", "name", "parent_id")
		})

	if len(category) > 0 {
		raw = raw.Where(`category_id = ? OR category_id IN (SELECT id FROM categories WHERE parent_id = ?)`, category, category)
	}

	if len(search) > 0 {
		searchPattern := "%" + search + "%"
		raw = raw.Where("LOWER(name) LIKE LOWER(?)", searchPattern)
	}

	if len(sortBy) > 0 && len(sort) > 0 {
		switch sortBy {
		case "arrival":
			raw = raw.Order("created_at ASC")
		default:
			sortByPattern := sortBy + " " + sort
			raw = raw.Order(sortByPattern)
		}
	} else {
		raw = raw.Order("name ASC")
	}

	err := raw.Find(&products).Error

	// mapping response
	var response []Product.ResIndexProduct
	for _, product := range products {
		response = append(response, Product.ResIndexProduct{
			ID:            product.ID,
			Name:          product.Name,
			Slug:          product.Slug,
			Price:         product.Price,
			DiscountPrice: product.DiscountPrice,
			Stock:         product.Stock,
			Images:        product.Images,
			Category:      &product.Category.Name,
			Featured:      product.Featured,
		})
	}

	return response, err
}
