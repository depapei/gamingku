package AdminUserController

import (
	AdminUserService "backend/services/admin/user"
	"net/http"

	"github.com/gin-gonic/gin"
)

// DeleteUser handles DELETE /admin/user/:id with soft-delete semantics.
func DeleteUser(c *gin.Context) {
	id, ok := parseUserID(c)
	if !ok {
		return
	}

	if err := AdminUserService.DeleteUser(id, actorEmail(c)); err != nil {
		writeUserError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "User successfully deleted",
	})
}
