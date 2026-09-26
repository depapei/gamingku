package AdminOrderController

import (
	"backend/helper"
	OrderDTO "backend/helper/type/order"
	AdminOrderService "backend/services/admin/order"
	"net/http"

	"github.com/gin-gonic/gin"
)

// UpdateStatus handles PATCH /admin/order/:id/status with a transition guard.
func UpdateStatus(c *gin.Context) {
	id, ok := parseOrderID(c)
	if !ok {
		return
	}

	var input OrderDTO.UpdateStatusInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": helper.Validate(err),
		})
		return
	}

	if err := AdminOrderService.UpdateOrderStatus(id, input.Status); err != nil {
		writeOrderError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Order status updated successfully",
	})
}
