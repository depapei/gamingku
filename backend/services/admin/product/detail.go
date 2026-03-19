package AdminProductService

import (
	DataAccess "backend/db"
	Product "backend/helper/type/product"
	"backend/helper/type/user"
	"backend/model"
)

func GetDetail(slug string) (Product.ResProduct, error) {
	var product model.Product

	err := DataAccess.DB.
		Preload("Specifications").
		Preload("Variants").
		Preload("Variants.Options").
		Preload("CreatedBy").
		First(&product, "slug = ?", slug).
		Error

	var specifications []Product.ResSpec
	for _, spec := range product.Specifications {
		specifications = append(specifications, Product.ResSpec{
			Key:  spec.Key,
			Name: spec.Name,
		})
	}

	var variants []Product.ResVariant
	for _, variant := range product.Variants {

		var options []Product.ResOption
		for _, option := range variant.Options {
			options = append(options, Product.ResOption{
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

	userInfo := user.UserInfo{
		Name:   product.CreatedBy.Name,
		Email:  product.CreatedBy.Email,
		Role:   product.CreatedBy.Role,
		Avatar: product.CreatedBy.Avatar,
	}

	response := Product.ResProduct{
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
		Featured:       &product.Featured,
		Variants:       variants,
		Specifications: specifications,
		CreatedBy:      userInfo,
	}

	return response, err
}
