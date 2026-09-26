package AdminOrderService

import (
	DataAccess "backend/db"
	OrderDTO "backend/helper/type/order"
	"backend/model"
	"strings"
)

// sortColumnAllowlist maps public sort keys to safe DB columns.
var sortColumnAllowlist = map[string]string{
	"createdAt":  "orders.created_at",
	"created_at": "orders.created_at",
	"totalPrice": "orders.total_price",
	"customer":   "orders.customer",
	"status":     "orders.status",
}

// canonicalStatuses is the lifecycle set accepted by the status filter.
var canonicalStatuses = map[string]bool{
	"pending": true, "paid": true, "processing": true,
	"completed": true, "cancelled": true, "refunded": true,
}

// GetOrders returns a paginated, filtered, safely-sorted admin order list.
func GetOrders(params OrderDTO.OrderListParams) (OrderDTO.PaginatedOrderResponse, error) {
	page := params.Page
	if page <= 0 {
		page = 1
	}
	limit := params.Limit
	if limit <= 0 {
		limit = 20
	}
	if limit > 50 {
		return OrderDTO.PaginatedOrderResponse{}, ErrOrderInvalidInput
	}
	if params.DateFrom != nil && params.DateTo != nil && params.DateFrom.After(*params.DateTo) {
		return OrderDTO.PaginatedOrderResponse{}, ErrOrderInvalidInput
	}
	if trimmed := strings.TrimSpace(params.Status); trimmed != "" {
		if !canonicalStatuses[trimmed] {
			return OrderDTO.PaginatedOrderResponse{}, ErrOrderInvalidInput
		}
	}

	base := DataAccess.DB.Model(&model.Order{})
	if trimmed := strings.TrimSpace(params.Search); trimmed != "" {
		pattern := "%" + trimmed + "%"
		base = base.Where("LOWER(customer) LIKE LOWER(?) OR LOWER(order_number) LIKE LOWER(?) OR LOWER(status) LIKE LOWER(?)", pattern, pattern, pattern)
	}
	if trimmed := strings.TrimSpace(params.Status); trimmed != "" {
		base = base.Where("status = ?", trimmed)
	}
	if params.UserID != nil {
		base = base.Where("user_id = ?", *params.UserID)
	}
	if params.DateFrom != nil {
		base = base.Where("created_at >= ?", *params.DateFrom)
	}
	if params.DateTo != nil {
		base = base.Where("created_at <= ?", *params.DateTo)
	}

	var total int64
	if err := base.Count(&total).Error; err != nil {
		return OrderDTO.PaginatedOrderResponse{}, err
	}

	column, ok := sortColumnAllowlist[params.SortBy]
	if !ok {
		column = "orders.created_at"
	}
	direction := "ASC"
	if strings.EqualFold(params.Sort, "desc") {
		direction = "DESC"
	}

	var orders []model.Order
	err := preloadOrderItems(base).
		Order(column + " " + direction).
		Limit(limit).
		Offset((page - 1) * limit).
		Find(&orders).Error
	if err != nil {
		return OrderDTO.PaginatedOrderResponse{}, err
	}

	data := make([]OrderDTO.OrderResponse, 0, len(orders))
	for _, o := range orders {
		o := o
		data = append(data, toOrderResponse(o))
	}

	return OrderDTO.PaginatedOrderResponse{
		Data:  data,
		Total: total,
		Page:  page,
		Limit: limit,
	}, nil
}
