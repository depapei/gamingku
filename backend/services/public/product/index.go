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
	ID             uint
	Name           string
	Slug           string
	Price          float64
	DiscountPrice  float64
	Stock          float64
	CategoryId     int
	Images         pq.StringArray
	Rating         int
	ReviewCount    int
	Description    string
	Variants       []ResVariant
	Featured       bool
	Specifications map[string]string
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