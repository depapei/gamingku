package AdminProductService

import (
	DataAccess "backend/db"
	"backend/model"
	"errors"
	"strings"

	"gorm.io/gorm"
)

// DeleteProduct soft-deletes a product and its children (variants, options,
// specifications) in a single transaction. It returns ErrProductNotFound when
// no row matches the slug.
func DeleteProduct(slug string) error {
	slug = strings.TrimSpace(slug)
	if slug == "" {
		return errors.New("product slug is required")
	}

	db := DataAccess.DB

	var existing model.Product
	if err := db.Select("id").First(&existing, "slug = ?", slug).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrProductNotFound
		}
		return err
	}

	tx := db.Begin()
	if tx.Error != nil {
		return tx.Error
	}

	var variants []model.ProductVariants
	if err := tx.Select("id").Where("product_id = ?", int(existing.ID)).Find(&variants).Error; err != nil {
		tx.Rollback()
		return err
	}
	if len(variants) > 0 {
		variantIDs := make([]uint, 0, len(variants))
		for _, v := range variants {
			variantIDs = append(variantIDs, v.ID)
		}
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

	result := tx.Where("id = ?", existing.ID).Delete(&model.Product{})
	if result.Error != nil {
		tx.Rollback()
		return result.Error
	}
	if result.RowsAffected == 0 {
		tx.Rollback()
		return ErrProductNotFound
	}

	if err := tx.Commit().Error; err != nil {
		return err
	}

	return nil
}
