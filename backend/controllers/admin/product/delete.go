package AdminProductController

import (
	"net/http"

	AdminProductService "backend/services/admin/product"

	"github.com/gin-gonic/gin"
)

// DeleteProduct handles DELETE /admin/product/:slug with 404 semantics.
func DeleteProduct(c *gin.Context) {
	slug, ok := parseProductSlug(c)
	if !ok {
		return
	}

	if err := AdminProductService.DeleteProduct(slug); err != nil {
		writeProductError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Product successfully deleted",
	})
}
