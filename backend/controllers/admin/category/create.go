package AdminCategoryController

import (
	"backend/helper"
	Category "backend/helper/type/category"
	AdminCategoryService "backend/services/admin/category"
	"net/http"

	"github.com/gin-gonic/gin"
)

func CreateCategory(c *gin.Context) {
	var input Category.ResCategory

	if err := c.ShouldBindJSON(&input); err != nil {
		message := helper.Validate(err)
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": message,
		})
		return
	}

	if  err := AdminCategoryService.CreateCategory(input); err != nil {
		message := helper.ParseError(err)
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": message,
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": input.Name + "'s Category has been created!",
	})
}
