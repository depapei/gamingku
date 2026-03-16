package PubProductService

import (
	DataAccess "backend/db"
	"backend/model"
	"log"
)

func GetDetail(slug string) (ResProduct, error) {
	var product model.Product
	product = model.Product{
		Slug: slug,
	}

	err := DataAccess.DB.Find(&product).First(&product).Error

	if err != nil {
		log.Fatal(err.Error())
	}

	var variants []ResVariant
	for _, variant := range product.Variants{
		var options []string
		for _, option := range variant.Options{
			options = append(options, option.Name)
		}

		variants = append(variants, ResVariant{
			ID: variant.ID,
			Name: variant.Name,
			Options: options,
		})
	}

	response := ResProduct{
		ID: product.ID,
		Name: product.Name,
		Slug: slug,
		Price: product.Price,
		DiscountPrice: product.DiscountPrice,
		Stock: product.Stock,
		CategoryId: product.CategoryId,
		Images: product.Images,
		Rating: int(product.Rating),
		ReviewCount: int(product.ReviewCount),
		Description: product.Description,
		Variants: variants,
	}

	return response, err
}