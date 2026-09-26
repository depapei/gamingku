package AdminProductService

import (
	DataAccess "backend/db"
	Product "backend/helper/type/product"
	"backend/model"
	"errors"
	"strings"

	"gorm.io/gorm"
)

// TempVariants stages a variant with its options before batch insert.
type TempVariants struct {
	Variant model.ProductVariants
	Options []model.VariantOptions
}

// CreateProduct creates a product with its variants, options and
// specifications in a single transaction. creatorEmail (from the JWT
// identity) takes precedence over any client-sent creator id. It never
// dereferences a nil pointer and skips empty batch inserts.
func CreateProduct(input Product.CreateProductInput, creatorEmail string) error {
	db := DataAccess.DB

	if strings.TrimSpace(input.Name) == "" || strings.TrimSpace(input.Slug) == "" || strings.TrimSpace(input.Description) == "" {
		return errors.New("name, slug and description are required")
	}
	if len(input.Images) == 0 {
		return errors.New("product images are required")
	}
	if input.DiscountPrice != 0 && input.DiscountPrice > input.Price {
		return errors.New("invalid discount price: must be less than or equal to price")
	}

	creatorID := 0
	if strings.TrimSpace(creatorEmail) != "" {
		var creator model.User
		if err := db.Where("email = ?", strings.TrimSpace(creatorEmail)).First(&creator).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return ErrProductCreatorNotFound
			}
			return err
		}
		creatorID = int(creator.ID)
	} else if input.CreatedById != nil {
		var creator model.User
		if err := db.First(&creator, "id = ?", *input.CreatedById).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return ErrProductCreatorNotFound
			}
			return err
		}
		creatorID = *input.CreatedById
	} else {
		return ErrProductCreatorNotFound
	}

	var category model.Category
	if err := db.Select("id").First(&category, "id = ?", input.CategoryId).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrProductCategoryNotFound
		}
		return err
	}

	var existing model.Product
	if err := db.Where("slug = ?", strings.TrimSpace(input.Slug)).First(&existing).Error; err == nil {
		return ErrProductSlugConflict
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		return err
	}

	tx := db.Begin()
	if tx.Error != nil {
		return tx.Error
	}

	nProduct := model.Product{
		Name:          strings.TrimSpace(input.Name),
		Slug:          strings.TrimSpace(input.Slug),
		Price:         input.Price,
		DiscountPrice: input.DiscountPrice,
		Stock:         input.Stock,
		CategoryId:    input.CategoryId,
		Images:        model.StringArray(input.Images),
		Description:   strings.TrimSpace(input.Description),
		Featured:      input.Featured,
		CreatedById:   creatorID,
	}

	if err := tx.Create(&nProduct).Error; err != nil {
		tx.Rollback()
		if strings.Contains(strings.ToLower(err.Error()), "duplicate") {
			return ErrProductSlugConflict
		}
		return err
	}

	var tempVariants []TempVariants
	for _, variant := range input.Variants {
		tv := TempVariants{
			Variant: model.ProductVariants{
				ProductId:   int(nProduct.ID),
				Name:        variant.Name,
				CreatedById: creatorID,
			},
		}
		for _, opt := range variant.Options {
			tv.Options = append(tv.Options, model.VariantOptions{
				Name:        opt.Name,
				IsAvailable: opt.IsAvailable,
				CreatedById: creatorID,
			})
		}
		tempVariants = append(tempVariants, tv)
	}

	if len(tempVariants) > 0 {
		nVariants := make([]model.ProductVariants, 0, len(tempVariants))
		for _, tv := range tempVariants {
			nVariants = append(nVariants, tv.Variant)
		}
		if err := tx.CreateInBatches(&nVariants, 100).Error; err != nil {
			tx.Rollback()
			return err
		}
		var nOptions []model.VariantOptions
		for i, tv := range tempVariants {
			variantID := nVariants[i].ID
			for _, nOpt := range tv.Options {
				nOptions = append(nOptions, model.VariantOptions{
					VariantId:   int(variantID),
					Name:        nOpt.Name,
					IsAvailable: nOpt.IsAvailable,
					CreatedById: creatorID,
				})
			}
		}
		if len(nOptions) > 0 {
			if err := tx.CreateInBatches(&nOptions, 100).Error; err != nil {
				tx.Rollback()
				return err
			}
		}
	}

	if len(input.Specifications) > 0 {
		nSpecs := make([]model.ProductSpecifications, 0, len(input.Specifications))
		for _, spec := range input.Specifications {
			nSpecs = append(nSpecs, model.ProductSpecifications{
				ProductId:   int(nProduct.ID),
				Key:         spec.Key,
				Name:        spec.Name,
				CreatedById: creatorID,
			})
		}
		if err := tx.CreateInBatches(&nSpecs, 100).Error; err != nil {
			tx.Rollback()
			return err
		}
	}

	if err := tx.Commit().Error; err != nil {
		return err
	}

	return nil
}
