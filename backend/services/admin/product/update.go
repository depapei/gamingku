package AdminProductService

import (
	DataAccess "backend/db"
	Product "backend/helper/type/product"
	"backend/model"
	"errors"
	"strings"

	"gorm.io/gorm"
)

// UpdateProduct updates exactly one product row identified by its slug.
// The route slug is the source of truth; a mismatched body slug is rejected.
// Child collections (variants/options/specifications) use replace semantics:
// existing children are soft-deleted and re-created in the same transaction.
func UpdateProduct(slug string, input Product.UpdateProductInput, creatorEmail string) error {
	slug = strings.TrimSpace(slug)
	if slug == "" {
		return errors.New("product slug is required")
	}
	if strings.TrimSpace(input.Slug) != "" && strings.TrimSpace(input.Slug) != slug {
		return ErrProductSlugMismatch
	}
	if strings.TrimSpace(input.Name) == "" || strings.TrimSpace(input.Description) == "" {
		return errors.New("name and description are required")
	}
	if len(input.Images) == 0 {
		return errors.New("product images are required")
	}
	if input.DiscountPrice != 0 && input.DiscountPrice > input.Price {
		return errors.New("invalid discount price: must be less than or equal to price")
	}

	db := DataAccess.DB

	var existing model.Product
	if err := db.First(&existing, "slug = ?", slug).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrProductNotFound
		}
		return err
	}

	var category model.Category
	if err := db.Select("id").First(&category, "id = ?", input.CategoryId).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrProductCategoryNotFound
		}
		return err
	}

	creatorID := existing.CreatedById
	if strings.TrimSpace(creatorEmail) != "" {
		var creator model.User
		if err := db.Where("email = ?", strings.TrimSpace(creatorEmail)).First(&creator).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return ErrProductCreatorNotFound
			}
			return err
		}
		creatorID = int(creator.ID)
	}

	tx := db.Begin()
	if tx.Error != nil {
		return tx.Error
	}

	updates := map[string]interface{}{
		"name":           strings.TrimSpace(input.Name),
		"price":          input.Price,
		"discount_price": input.DiscountPrice,
		"stock":          input.Stock,
		"category_id":    input.CategoryId,
		"images":         model.StringArray(input.Images),
		"description":    strings.TrimSpace(input.Description),
		"featured":       input.Featured,
	}
	result := tx.Model(&model.Product{}).Where("id = ?", existing.ID).Updates(updates)
	if result.Error != nil {
		tx.Rollback()
		return result.Error
	}
	if result.RowsAffected == 0 {
		tx.Rollback()
		return ErrProductNotFound
	}

	var variantIDs []uint
	var variants []model.ProductVariants
	if err := tx.Where("product_id = ?", int(existing.ID)).Find(&variants).Error; err != nil {
		tx.Rollback()
		return err
	}
	for _, v := range variants {
		variantIDs = append(variantIDs, v.ID)
	}
	if len(variantIDs) > 0 {
		if err := tx.Where("variant_id IN ?", variantIDs).Delete(&model.VariantOptions{}).Error; err != nil {
			tx.Rollback()
			return err
		}
	}
	if err := tx.Where("product_id = ?", int(existing.ID)).Delete(&model.ProductVariants{}).Error; err != nil {
		tx.Rollback()
		return err
	}
	if err := tx.Where("product_id = ?", int(existing.ID)).Delete(&model.ProductSpecifications{}).Error; err != nil {
		tx.Rollback()
		return err
	}

	if len(input.Variants) > 0 {
		nVariants := make([]model.ProductVariants, 0, len(input.Variants))
		type staged struct {
			index   int
			options []Product.ResOption
		}
		var stagedOptions []staged
		for i, variant := range input.Variants {
			nVariants = append(nVariants, model.ProductVariants{
				ProductId:   int(existing.ID),
				Name:        variant.Name,
				CreatedById: creatorID,
			})
			stagedOptions = append(stagedOptions, staged{index: i, options: variant.Options})
		}
		if err := tx.CreateInBatches(&nVariants, 100).Error; err != nil {
			tx.Rollback()
			return err
		}
		var nOptions []model.VariantOptions
		for _, s := range stagedOptions {
			for _, opt := range s.options {
				nOptions = append(nOptions, model.VariantOptions{
					VariantId:   int(nVariants[s.index].ID),
					Name:        opt.Name,
					IsAvailable: opt.IsAvailable,
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
				ProductId:   int(existing.ID),
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
