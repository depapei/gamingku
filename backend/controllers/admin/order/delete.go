package AdminOrderController

import (
	AdminOrderService "backend/services/admin/order"
	"net/http"

	"github.com/gin-gonic/gin"
)

// DeleteOrder handles DELETE /admin/order/:id with soft-delete semantics.
func DeleteOrder(c *gin.Context) {
	id, ok := parseOrderID(c)
	if !ok {
		return
	}

	if err := AdminOrderService.DeleteOrder(id); err != nil {
		writeOrderError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Order successfully deleted",
	})
}
