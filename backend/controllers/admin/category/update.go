package AdminCategoryController

import (
	"backend/helper"
	Category "backend/helper/type/category"
	AdminCategoryService "backend/services/admin/category"
	"net/http"

	"github.com/gin-gonic/gin"
)

// UpdateCategory handles PUT /admin/category/:id. The route id is the source
// of truth and must match the body id when the body carries one.
func UpdateCategory(c *gin.Context) {
	id, ok := parseCategoryID(c)
	if !ok {
		return
	}

	var input Category.UpdateCategoryInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": helper.Validate(err),
		})
		return
	}

	if err := AdminCategoryService.UpdateCategory(id, input); err != nil {
		writeCategoryError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": input.Name + "'s Category has been updated!",
	})
}
