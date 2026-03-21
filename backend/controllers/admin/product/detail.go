package AdminProductController

import (
	"backend/helper"
	AdminProductService "backend/services/admin/product"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetDetail(c *gin.Context) {
	slug := c.Param("slug")

	response, err := AdminProductService.GetDetail(slug)
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
