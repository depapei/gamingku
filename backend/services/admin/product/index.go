package AdminProductService

import (
	DataAccess "backend/db"
	Product "backend/helper/type/product"
	"backend/model"
	"strconv"
)

func GetProducts(category string, search string, sortBy string, sort string) ([]Product.ResIndexProduct, error) {
	var products []model.Product
	raw := DataAccess.DB

	if len(category) > 0 {
		var cats []model.Category
		raw.Where("parent_id = ?", category).Find(&cats)
		var all_ids []string
		all_ids = append(all_ids, category)
		for _, cat := range cats {
			all_ids = append(all_ids, strconv.Itoa(int(cat.ID)))
		}
		raw = raw.Where("category_id IN ?", all_ids)
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

	raw.Find(&products)

	err := raw.Error

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
			CategoryId:    product.CategoryId,
			Featured:      product.Featured,
		})
	}

	return response, err
}
