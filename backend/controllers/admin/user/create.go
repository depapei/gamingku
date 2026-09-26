package AdminUserController

import (
	"backend/helper"
	UserType "backend/helper/type/user"
	AdminUserService "backend/services/admin/user"
	"net/http"

	"github.com/gin-gonic/gin"
)

// CreateUser handles POST /admin/user/.
func CreateUser(c *gin.Context) {
	var input UserType.CreateUserInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": helper.Validate(err),
		})
		return
	}

	if err := AdminUserService.CreateUser(input, actorEmail(c)); err != nil {
		writeUserError(c, err)
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "User has been created!",
	})
}
