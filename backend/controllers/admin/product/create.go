package AdminProductController

import (
	"backend/helper"
	Product "backend/helper/type/product"
	AdminProductService "backend/services/admin/product"
	"net/http"

	"github.com/gin-gonic/gin"
)

func CreateProduct(c *gin.Context) {
	var input Product.ResProduct
	err := c.ShouldBindJSON(&input)
	if err != nil {
		message := helper.Validate(err)
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": message,
		})
		return
	}

	err = AdminProductService.CreateProduct(input)
	if err != nil {
		message := helper.ParseError(err)
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": message,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Product " + input.Name + " Successfully created!",
	})

}
