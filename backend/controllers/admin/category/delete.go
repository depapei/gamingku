package AdminCategoryController

import (
	"backend/helper"
	AdminCategoryService "backend/services/admin/category"
	"net/http"

	"github.com/gin-gonic/gin"
)

func DeleteCategory(c *gin.Context) {
	id := c.Param("id")

	if err := AdminCategoryService.DeleteCategory(id); err != nil {
		message := helper.ParseError(err)
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": message,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Category successfully deleted",
	})
}
