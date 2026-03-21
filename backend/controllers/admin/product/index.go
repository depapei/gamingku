package AdminProductController

import (
	"backend/helper"
	AdminProduct "backend/services/admin/product"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetProducts(c *gin.Context) {
	category := c.DefaultQuery("category", "")
	search := c.DefaultQuery("search", "")
	sortBy := c.DefaultQuery("sortBy", "")
	sort := c.DefaultQuery("sort", "")
	limit := c.DefaultQuery("limit", "")

	response, err := AdminProduct.GetProducts(category, search, sortBy, sort, limit)

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
		"data":    response,
	})
}
