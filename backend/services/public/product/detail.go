package PubProductService

import (
	DataAccess "backend/db"
	"backend/model"
)

func GetDetail(slug string) (ResProduct, error) {
	var product model.Product

	err := DataAccess.DB.
		Preload("Specifications").
		Preload("Variants").
		Preload("Variants.Options").
		First(&product, "slug = ?", slug).
		Error

	specifications := make(map[string]string)
	for _, spec := range product.Specifications {
		specifications[spec.Key] = spec.Name
	}

	var variants []ResVariant
	for _, variant := range product.Variants {

		var options []string
		for _, option := range variant.Options {
			options = append(options, option.Name)
		}

		variants = append(variants, ResVariant{
			ID:      variant.ID,
			Name:    variant.Name,
			Options: options,
		})
	}

	response := ResProduct{
		ID:             product.ID,
		Name:           product.Name,
		Slug:           product.Slug,
		Price:          product.Price,
		DiscountPrice:  product.DiscountPrice,
		Stock:          product.Stock,
		Images:         product.Images,
		Rating:         int(product.Rating),
		CategoryId:     product.CategoryId,
		ReviewCount:    int(product.ReviewCount),
		Description:    product.Description,
		Featured:       product.Featured,
		Variants:       variants,
		Specifications: specifications,
	}

	return response, err
}
