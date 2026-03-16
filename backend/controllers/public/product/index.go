package PubProductController

import (
	PubProductService "backend/services/public/product"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetProducts(c *gin.Context) {

	response, err := PubProductService.GetProducts()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Internal server error",
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": response,
	})
}
