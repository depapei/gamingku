package PubCategoryController

import (
	PubCategoryService "backend/services/public/category"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetCategories(c *gin.Context) {
	
	result, err := PubCategoryService.GetCategories()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
		})
		return
	}
	
	c.JSON(http.StatusOK,gin.H{
		"success": true,
		"data": result,
	})
}