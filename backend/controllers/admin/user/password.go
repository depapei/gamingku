package AdminUserController

import (
	"backend/helper"
	UserType "backend/helper/type/user"
	AdminUserService "backend/services/admin/user"
	"net/http"

	"github.com/gin-gonic/gin"
)

// ResetUserPassword handles PUT /admin/user/:id/password.
func ResetUserPassword(c *gin.Context) {
	id, ok := parseUserID(c)
	if !ok {
		return
	}

	var input UserType.ResetPasswordInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": helper.Validate(err),
		})
		return
	}

	if err := AdminUserService.ResetUserPassword(id, input, actorEmail(c)); err != nil {
		writeUserError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Password has been reset",
	})
}
