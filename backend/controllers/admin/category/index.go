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
	sort := c.DefaultQuery("sort", "")

	response, err := AdminCategoryService.GetCategories(search, sortBy, sort)

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