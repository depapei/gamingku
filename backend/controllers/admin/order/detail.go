package AdminOrderController

import (
	AdminOrderService "backend/services/admin/order"
	"net/http"

	"github.com/gin-gonic/gin"
)

// GetDetail handles GET /admin/order/:id.
func GetDetail(c *gin.Context) {
	id, ok := parseOrderID(c)
	if !ok {
		return
	}

	response, err := AdminOrderService.GetOrderByID(id)
	if err != nil {
		writeOrderError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    response,
	})
}
