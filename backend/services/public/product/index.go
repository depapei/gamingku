package PubProductService

import (
	DataAccess "backend/db"
	"backend/model"
	"strconv"

	"github.com/lib/pq"
	"gorm.io/gorm"
)

type ResVariant struct {
	ID      uint     `json:"id"`
	Name    string   `json:"name"`
	Options []string `json:"options"`
}

type ResProduct struct {
	ID             uint              `json:"id"`
	Name           string            `json:"name"`
	Slug           string            `json:"slug"`
	Price          float64           `json:"price"`
	DiscountPrice  float64           `json:"discountPrice"`
	Stock          float64           `json:"stock"`
	CategoryId     int               `json:"categoryId"`
	Images         pq.StringArray    `json:"images"`
	Rating         int               `json:"rating"`
	ReviewCount    int               `json:"reviewCount"`
	Description    string            `json:"description"`
	Variants       []ResVariant      `json:"variants"`
	Featured       bool              `json:"featured"`
	Specifications map[string]string `json:"specifications"`
}

type ResIndexProduct struct {
	ID            uint           `json:"id"`
	Name          string         `json:"name"`
	Slug          string         `json:"slug"`
	Price         float64        `json:"price"`
	DiscountPrice float64        `json:"discountPrice"`
	Stock         float64        `json:"stock"`
	CategoryId    int            `json:"categoryId"`
	Featured      bool           `json:"featured"`
	Images        pq.StringArray `json:"images"`
}

func GetProducts(category string, search string, sortBy string, sort string, limit string) ([]ResIndexProduct, error) {
	var products []model.Product
	var response []ResIndexProduct
	raw := DataAccess.DB.
		Select("id", "name", "price", "discount_price", "stock", "category_id", "featured", "images", "slug").
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

	if len(limit) > 0 {
		intLimit, err := strconv.ParseInt(limit, 0, 64)
		if err != nil {
			return response, err
		}
		if intLimit >= 50 {
			raw = raw.Limit(50)
		} else {
			raw = raw.Limit(int(intLimit))
		}
	} else {
		raw = raw.Limit(20)
	}

	raw.Find(&products)

	err := raw.Error

	// mapping response
	for _, product := range products {
		response = append(response, ResIndexProduct{
			ID:            product.ID,
			Name:          product.Name,
			Slug:          product.Slug,
			Price:         product.Price,
			DiscountPrice: product.DiscountPrice,
			Stock:         product.Stock,
			Images:        product.Images,
			CategoryId:    product.CategoryId,
			Featured:      product.Featured,
		})
	}

	return response, err
}
