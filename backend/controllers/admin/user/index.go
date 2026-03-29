package AdminUserController

import (
	"backend/helper"
	AdminUser "backend/services/admin/user"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetUsers(c *gin.Context) {
	search := c.DefaultQuery("search", "")
	sortBy := c.DefaultQuery("sortBy", "")
	sort := c.DefaultQuery("sort", "")
	limit := c.DefaultQuery("limit", "")

	response, err := AdminUser.GetUsers(search, sortBy, sort, limit)

	if err != nil {
		message := helper.ParseError(err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": message,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    response,
	})
}
