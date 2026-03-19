package PubOrderController

import (
	"backend/helper"
	"backend/helper/type/order"
	PubOrderService "backend/services/public/order"
	"net/http"

	"github.com/gin-gonic/gin"
)

func StoreOrder(c *gin.Context) {
	var order order.RequestOrder

	if err := c.ShouldBindJSON(&order); err != nil {
		message := helper.Validate(err)
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": message,
		})
		return
	}

	data, err := PubOrderService.Create(order)
	if err != nil {
		message := helper.ParseError(err)
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": message,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    data,
	})
}
