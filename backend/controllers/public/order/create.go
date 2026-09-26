package PubOrderController

import (
	"backend/helper"
	OrderDTO "backend/helper/type/order"
	PubOrderService "backend/services/public/order"
	"net/http"

	"github.com/gin-gonic/gin"
)

// StoreOrder handles POST /order/, creating an order with items atomically.
func StoreOrder(c *gin.Context) {
	var input OrderDTO.CreateOrderInput

	if err := c.ShouldBindJSON(&input); err != nil {
		message := helper.Validate(err)
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": message,
		})
		return
	}

	result, err := PubOrderService.Create(input)
	if err != nil {
		status := helper.StatusForOrderError(err)
		switch status {
		case 404:
			c.JSON(http.StatusNotFound, gin.H{
				"success": false,
				"message": err.Error(),
			})
		case 400:
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": err.Error(),
			})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": helper.ParseError(err),
			})
		}
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Order created successfully",
		"data":    result,
	})
}
