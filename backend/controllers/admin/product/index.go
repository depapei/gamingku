package AdminProduct

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func getAllProduct(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    "welcome to product index",
	})
}
