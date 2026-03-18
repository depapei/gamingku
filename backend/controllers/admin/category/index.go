package AdminCategoryController

import (
	"backend/helper"
	AdminCategoryService "backend/services/admin/category"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetCategories(c *gin.Context){
	search := c.DefaultQuery("search", "")
	sortBy := c.DefaultQuery("sortBy", "")
	sortType := c.DefaultQuery("sortType", "")

	response, err := AdminCategoryService.GetCategories(search, sortBy, sortType)

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
		"data": response,
	})
}