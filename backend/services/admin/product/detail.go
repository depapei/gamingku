package AdminProductService

import (
	DataAccess "backend/db"
	Product "backend/helper/type/product"
	"backend/helper/type/user"
	"backend/model"
	"errors"
	"strings"

	"github.com/lib/pq"
	"gorm.io/gorm"
)

// GetDetail returns a single admin product with specifications, variants,
// options and creator info. It returns ErrProductNotFound when no row matches.
func GetDetail(slug string) (Product.ResProduct, error) {
	if strings.TrimSpace(slug) == "" {
		return Product.ResProduct{}, errors.New("product slug is required")
	}

	var product model.Product
	err := DataAccess.DB.
		Preload("Specifications").
		Preload("Variants").
		Preload("Variants.Options").
		Preload("CreatedBy").
		Preload("Category").
		First(&product, "slug = ?", strings.TrimSpace(slug)).
		Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return Product.ResProduct{}, ErrProductNotFound
		}
		return Product.ResProduct{}, err
	}

	specifications := make([]Product.ResSpec, 0, len(product.Specifications))
	for _, spec := range product.Specifications {
		specifications = append(specifications, Product.ResSpec{
			Key:  spec.Key,
			Name: spec.Name,
		})
	}

	variants := make([]Product.ResVariant, 0, len(product.Variants))
	for _, variant := range product.Variants {
		variant := variant
		options := make([]Product.ResOption, 0, len(variant.Options))
		for _, option := range variant.Options {
			option := option
			options = append(options, Product.ResOption{
				ID:          option.ID,
				Name:        option.Name,
				IsAvailable: option.IsAvailable,
			})
		}
		variants = append(variants, Product.ResVariant{
			ID:      variant.ID,
			Name:    variant.Name,
			Options: options,
		})
	}

	categoryName := product.Category.Name

	return Product.ResProduct{
		ID:             product.ID,
		Name:           product.Name,
		Slug:           product.Slug,
		Price:          product.Price,
		DiscountPrice:  product.DiscountPrice,
		Stock:          product.Stock,
		Images:         pq.StringArray(product.Images),
		Rating:         int(product.Rating),
		CategoryId:     product.CategoryId,
		Category:       &categoryName,
		ReviewCount:    int(product.ReviewCount),
		Description:    product.Description,
		Featured:       product.Featured,
		Variants:       variants,
		Specifications: specifications,
		CreatedAt:      product.CreatedAt,
		UpdatedAt:      product.UpdatedAt,
		CreatedBy: user.UserInfo{
			Name:     product.CreatedBy.Name,
			Email:    product.CreatedBy.Email,
			Role:     product.CreatedBy.Role,
			IsActive: product.CreatedBy.IsActive,
			Avatar:   product.CreatedBy.Avatar,
		},
	}, nil
}
