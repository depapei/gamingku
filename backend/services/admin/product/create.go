package AdminProductService

import (
	DataAccess "backend/db"
	Product "backend/helper/type/product"
	"backend/model"
	"log"
)

type TempVariants struct {
	Variant model.ProductVariants
	Options []model.VariantOptions
}

func CreateProduct(input Product.ResProduct) error {
	var nProduct model.Product
	var nSpecs []model.ProductSpecifications
	var nVariants []model.ProductVariants
	var tempVariants []TempVariants
	var nOptions []model.VariantOptions
	var err error

	nProduct = model.Product{
		Name:          input.Name,
		Slug:          input.Slug,
		Price:         input.Price,
		DiscountPrice: input.DiscountPrice,
		Stock:         input.Stock,
		CategoryId:    input.CategoryId,
		Images:        input.Images,
		Description:   input.Description,
		Featured:      *input.Featured,
		CreatedById:   *input.CreatedById,
	}

	tx := DataAccess.DB.Begin()

	var category []model.Category
	err = tx.Select("name").First(&category, "id = ?", input.CategoryId).Error
	if err != nil {
		tx.Rollback()
		return err
	}

	err = tx.Create(&nProduct).Error
	if err != nil {
		log.Println(err.Error())
		tx.Rollback()
		return err
	}

	for _, variant := range input.Variants {
		tv := TempVariants{
			Variant: model.ProductVariants{
				ProductId:   int(nProduct.ID),
				Name:        variant.Name,
				CreatedById: *input.CreatedById,
			},
		}

		for _, opt := range variant.Options {
			tv.Options = append(tv.Options, model.VariantOptions{
				Name:        opt.Name,
				IsAvailable: opt.IsAvailable,
				CreatedById: *input.CreatedById,
			})
		}

		tempVariants = append(tempVariants, tv)
	}

	for _, tv := range tempVariants {
		nVariants = append(nVariants, tv.Variant)
	}

	err = tx.CreateInBatches(&nVariants, len(nVariants)).Error
	if err != nil {
		log.Println(err.Error())
		tx.Rollback()
		return err
	}

	for i, tv := range tempVariants {
		variantID := nVariants[i].ID
		for _, nOpt := range tv.Options {
			nOptions = append(nOptions, model.VariantOptions{
				VariantId:   int(variantID),
				Name:        nOpt.Name,
				IsAvailable: nOpt.IsAvailable,
				CreatedById: *input.CreatedById,
			})
		}
	}

	err = tx.CreateInBatches(&nOptions, len(nOptions)).Error
	if err != nil {
		log.Println(err.Error())
		tx.Rollback()
		return err
	}

	for _, spec := range input.Specifications {
		nSpecs = append(nSpecs, model.ProductSpecifications{
			ProductId:   int(nProduct.ID),
			Key:         spec.Key,
			Name:        spec.Name,
			CreatedById: *input.CreatedById,
		})
	}

	err = tx.CreateInBatches(&nSpecs, len(nSpecs)).Error
	if err != nil {
		log.Println(err.Error())
		tx.Rollback()
		return err
	}

	tx.Commit()

	return err
}
