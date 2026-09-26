package AdminCategoryController

import (
	"backend/helper"
	Category "backend/helper/type/category"
	AdminCategoryService "backend/services/admin/category"
	"net/http"

	"github.com/gin-gonic/gin"
)

// CreateCategory handles POST /admin/category/.
// The creator is derived from the JWT identity; a client-sent createdBy is optional legacy input.
func CreateCategory(c *gin.Context) {
	var input Category.CreateCategoryInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": helper.Validate(err),
		})
		return
	}

	creatorEmail, _ := c.Get("UserEmail")
	email, _ := creatorEmail.(string)

	if err := AdminCategoryService.CreateCategory(input, email); err != nil {
		writeCategoryError(c, err)
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": input.Name + "'s Category has been created!",
	})
}
