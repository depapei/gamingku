package PubProductController

import (
	"backend/helper"
	PubProductService "backend/services/public/product"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetProducts(c *gin.Context) {
	category := c.DefaultQuery("category", "")
	search := c.DefaultQuery("search", "")
	sortBy := c.DefaultQuery("sortBy", "")
	sort := c.DefaultQuery("sort", "")

	response, err := PubProductService.GetProducts(category, search, sortBy, sort)

	if err != nil {
		message := helper.ParseError(err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": message,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": response,
	})
}
