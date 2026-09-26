package AdminProductController

import (
	"backend/helper"
	Product "backend/helper/type/product"
	AdminProductService "backend/services/admin/product"
	"net/http"

	"github.com/gin-gonic/gin"
)

// UpdateProduct handles PUT /admin/product/:slug. The route slug is the source
// of truth; a mismatched body slug is rejected.
func UpdateProduct(c *gin.Context) {
	slug, ok := parseProductSlug(c)
	if !ok {
		return
	}

	var input Product.UpdateProductInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": helper.Validate(err),
		})
		return
	}

	creatorEmail, _ := c.Get("UserEmail")
	email, _ := creatorEmail.(string)

	if err := AdminProductService.UpdateProduct(slug, input, email); err != nil {
		writeProductError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Product " + input.Name + " Successfully updated!",
	})
}
