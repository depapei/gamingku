package AdminCategoryController

import (
	"backend/helper"
	Category "backend/helper/type/category"
	AdminCategoryService "backend/services/admin/category"
	"net/http"

	"github.com/gin-gonic/gin"
)

func UpdateCategory(c *gin.Context) {
	var input Category.UpdateCategory

	if err := c.ShouldBindJSON(&input); err != nil {
		message := helper.Validate(err)
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": message,
		})
		return
	}

	if  err := AdminCategoryService.UpdateCategory(input); err != nil {
		message := helper.ParseError(err)
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": message,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": input.Name + "'s Category has been updated!",
	})
}
