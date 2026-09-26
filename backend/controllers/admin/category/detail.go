package AdminCategoryController

import (
	"net/http"

	AdminCategoryService "backend/services/admin/category"

	"github.com/gin-gonic/gin"
)

// GetDetail handles GET /admin/category/:id including direct children.
func GetDetail(c *gin.Context) {
	id, ok := parseCategoryID(c)
	if !ok {
		return
	}

	data, err := AdminCategoryService.GetDetail(id)
	if err != nil {
		writeCategoryError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    data,
	})
}
