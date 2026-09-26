package AdminUserController

import (
	"backend/helper"
	UserType "backend/helper/type/user"
	AdminUserService "backend/services/admin/user"
	"net/http"

	"github.com/gin-gonic/gin"
)

// UpdateUserStatus handles PUT /admin/user/:id/status.
func UpdateUserStatus(c *gin.Context) {
	id, ok := parseUserID(c)
	if !ok {
		return
	}

	var input UserType.UpdateUserStatusInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": helper.Validate(err),
		})
		return
	}

	if err := AdminUserService.UpdateUserStatus(id, *input.IsActive, actorEmail(c)); err != nil {
		writeUserError(c, err)
		return
	}

	message := "User has been activated"
	if !*input.IsActive {
		message = "User has been deactivated"
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": message,
	})
}
