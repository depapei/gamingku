package PubProductController

import (
	"backend/helper"
	PubProductService "backend/services/public/product"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetDetail(c *gin.Context) {
	slug := c.Param("slug")

	response, err := PubProductService.GetDetail(slug); if err != nil {
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