package PubProductService

import (
	DataAccess "backend/db"
	"backend/model"

	"github.com/lib/pq"
)

type ResVariant struct {
	ID uint `json:"id"`
	Name string `json:"name"`
	Options []string `json:"options"`
}

type ResProduct struct {
	ID             uint `json:"id"`
	Name           string `json:"name"`
	Slug           string `json:"slug"`
	Price          float64 `json:"price"`
	DiscountPrice  float64 `json:"discountPrice"`
	Stock          float64 `json:"stock"`
	CategoryId     int `json:"categoryId"`
	Images         pq.StringArray `json:"images"`
	Rating         int `json:"rating"`
	ReviewCount    int `json:"reviewCount"`
	Description    string `json:"description"`
	Variants       []ResVariant `json:"variants"`
	Featured       bool `json:"featured"`
	Specifications map[string]string `json:"specifications"`
}

func GetProducts() ([]ResProduct, error){
	var products []model.Product
	raw := DataAccess.DB.
		Preload("Specifications").
		Preload("Variants").
		Find(&products)

	err := raw.Error

	var response []ResProduct
	for _, product := range products{
		
		specifications := make(map[string]string)
		for _, spec := range product.Specifications{
			specifications[spec.Key] = spec.Name
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

		response = append(response, ResProduct{
			ID: product.ID,
			Name: product.Name,
			Slug: product.Slug,
			Price: product.Price,
			DiscountPrice: product.DiscountPrice,
			Stock: product.Stock,
			Images: product.Images,
			Rating: int(product.Rating),
			CategoryId: product.CategoryId,
			ReviewCount: int(product.ReviewCount),
			Description: product.Description,
			Featured: product.Featured,
			Variants: variants,
			Specifications: specifications,
		})
	}

	return response, err
}