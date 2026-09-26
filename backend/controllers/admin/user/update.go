package AdminUserController

import (
	"backend/helper"
	UserType "backend/helper/type/user"
	AdminUserService "backend/services/admin/user"
	"net/http"

	"github.com/gin-gonic/gin"
)

// UpdateUser handles PUT /admin/user/:id.
func UpdateUser(c *gin.Context) {
	id, ok := parseUserID(c)
	if !ok {
		return
	}

	var input UserType.UpdateUserInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": helper.Validate(err),
		})
		return
	}

	if err := AdminUserService.UpdateUser(id, input, actorEmail(c)); err != nil {
		writeUserError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "User has been updated!",
	})
}
