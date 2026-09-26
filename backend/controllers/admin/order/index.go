package AdminOrderController

import (
	"backend/helper"
	OrderDTO "backend/helper/type/order"
	AdminOrderService "backend/services/admin/order"
	"errors"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// writeOrderError writes a failure envelope with a 404/409/400/500 split.
func writeOrderError(c *gin.Context, err error) {
	if errors.Is(err, AdminOrderService.ErrOrderNotFound) || errors.Is(err, gorm.ErrRecordNotFound) {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "Order not found"})
		return
	}
	if errors.Is(err, AdminOrderService.ErrOrderStatusConflict) {
		c.JSON(http.StatusConflict, gin.H{"success": false, "message": err.Error()})
		return
	}
	if errors.Is(err, AdminOrderService.ErrOrderIllegalTransition) ||
		errors.Is(err, AdminOrderService.ErrOrderInvalidInput) ||
		errors.Is(err, AdminOrderService.ErrOrderProductNotFound) {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}
	status := helper.StatusForOrderError(err)
	if status == 404 {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": helper.ParseError(err)})
		return
	}
	if status == 409 {
		c.JSON(http.StatusConflict, gin.H{"success": false, "message": helper.ParseError(err)})
		return
	}
	if status == 400 {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": helper.ParseError(err)})
		return
	}
	c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": helper.ParseError(err)})
}

// parseOrderID validates a positive numeric route id.
func parseOrderID(c *gin.Context) (uint, bool) {
	raw := strings.TrimSpace(c.Param("id"))
	id, err := strconv.ParseUint(raw, 10, 64)
	if err != nil || id == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid order id"})
		return 0, false
	}
	return uint(id), true
}

// parseOrderDate parses an optional YYYY-MM-DD query value.
func parseOrderDate(c *gin.Context, key string) (*time.Time, bool) {
	raw := strings.TrimSpace(c.DefaultQuery(key, ""))
	if raw == "" {
		return nil, true
	}
	parsed, err := time.Parse("2006-01-02", raw)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid " + key + ", expected YYYY-MM-DD"})
		return nil, false
	}
	return &parsed, true
}

// GetOrders handles GET /admin/order/ with search, filters, allowlisted
// sort and pagination.
func GetOrders(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	dateFrom, ok := parseOrderDate(c, "dateFrom")
	if !ok {
		return
	}
	dateTo, ok := parseOrderDate(c, "dateTo")
	if !ok {
		return
	}

	var userID *int
	if raw := strings.TrimSpace(c.DefaultQuery("userId", "")); raw != "" {
		parsed, err := strconv.Atoi(raw)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid userId"})
			return
		}
		userID = &parsed
	}

	params := OrderDTO.OrderListParams{
		Search:   c.DefaultQuery("search", ""),
		Status:   c.DefaultQuery("status", ""),
		UserID:   userID,
		DateFrom: dateFrom,
		DateTo:   dateTo,
		SortBy:   c.DefaultQuery("sortBy", ""),
		Sort:     c.DefaultQuery("sort", ""),
		Page:     page,
		Limit:    limit,
	}

	result, err := AdminOrderService.GetOrders(params)
	if err != nil {
		writeOrderError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    result.Data,
		"total":   result.Total,
		"page":    result.Page,
		"limit":   result.Limit,
	})
}
