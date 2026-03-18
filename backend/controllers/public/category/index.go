package PubCategoryController

import (
	"backend/helper"
	PubCategoryService "backend/services/public/category"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetCategories(c *gin.Context) {
	
	result, err := PubCategoryService.GetCategories()
	if err != nil {
		message := helper.ParseError(err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": message,
		})
		return
	}
	
	c.JSON(http.StatusOK,gin.H{
		"success": true,
		"data": result,
	})
}