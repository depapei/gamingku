package AdminProductController

import (
	"backend/helper"
	Product "backend/helper/type/product"
	AdminProductService "backend/services/admin/product"
	"errors"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// writeProductError writes a failure envelope with a 404/409/400/500 split.
func writeProductError(c *gin.Context, err error) {
	if errors.Is(err, AdminProductService.ErrProductNotFound) || errors.Is(err, gorm.ErrRecordNotFound) {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "Product not found"})
		return
	}
	if errors.Is(err, AdminProductService.ErrProductSlugConflict) {
		c.JSON(http.StatusConflict, gin.H{"success": false, "message": helper.ParseError(err)})
		return
	}
	if errors.Is(err, AdminProductService.ErrProductCategoryNotFound) ||
		errors.Is(err, AdminProductService.ErrProductCreatorNotFound) ||
		errors.Is(err, AdminProductService.ErrProductSlugMismatch) {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}
	status := helper.StatusForProductError(err)
	if status == 404 {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": helper.ParseError(err)})
		return
	}
	if status == 409 {
		c.JSON(http.StatusConflict, gin.H{"success": false, "message": helper.ParseError(err)})
		return
	}
	if status == 400 {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": helper.ParseError(err)})
		return
	}
	c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": helper.ParseError(err)})
}

// parseProductSlug validates a non-empty route slug.
func parseProductSlug(c *gin.Context) (string, bool) {
	slug := strings.TrimSpace(c.Param("slug"))
	if slug == "" {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid product slug"})
		return "", false
	}
	return slug, true
}

// GetProducts handles GET /admin/product/ with search, allowlisted sort and pagination.
func GetProducts(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	params := Product.ProductListParams{
		Category: c.DefaultQuery("category", ""),
		Search:   c.DefaultQuery("search", ""),
		SortBy:   c.DefaultQuery("sortBy", ""),
		Sort:     c.DefaultQuery("sort", ""),
		Page:     page,
		Limit:    limit,
	}

	result, err := AdminProductService.GetProducts(params)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": helper.ParseError(err),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    result.Data,
		"total":   result.Total,
		"page":    result.Page,
		"limit":   result.Limit,
	})
}
