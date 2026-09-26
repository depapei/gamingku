package AdminCategoryController

import (
	"net/http"

	AdminCategoryService "backend/services/admin/category"

	"github.com/gin-gonic/gin"
)

// DeleteCategory handles DELETE /admin/category/:id with 404/409 semantics.
func DeleteCategory(c *gin.Context) {
	id, ok := parseCategoryID(c)
	if !ok {
		return
	}

	if err := AdminCategoryService.DeleteCategory(id); err != nil {
		writeCategoryError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Category successfully deleted",
	})
}
