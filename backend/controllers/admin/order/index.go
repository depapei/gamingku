package AdminOrderController

import (
	"backend/helper"
	AdminOrderService "backend/services/admin/order"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetOrders(c *gin.Context) {
	search := c.DefaultQuery("search", "")
	sortBy := c.DefaultQuery("sortBy", "")
	sort := c.DefaultQuery("sort", "")
	limit := c.DefaultQuery("limit", "")

	data, err := AdminOrderService.GetOrders(search, sortBy, sort, limit)
	if err != nil {
		message := helper.ParseError(err)
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": message,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success:": true,
		"data":     data,
	})
}
