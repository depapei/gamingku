package DashboardDTO

import "time"

// CurrencyIDR is the presentation-only currency code for dashboard revenue.
const CurrencyIDR = "IDR"

// RecentOrdersLimit is the maximum number of recent orders in the summary.
const RecentOrdersLimit = 5

// LowStockLimit is the maximum number of low-stock products in the summary.
const LowStockLimit = 5

// RevenueSummary aggregates order revenue totals in IDR.
type RevenueSummary struct {
	// Total is the all-time sum of orders total_price.
	Total float64 `json:"total"`
	// Month is the month-to-date sum of orders total_price.
	Month float64 `json:"month"`
	// Currency is the presentation-only currency code (IDR).
	Currency string `json:"currency"`
}

// CountSummary holds entity counts for the admin overview.
type CountSummary struct {
	// Orders is the total number of non-deleted orders.
	Orders int64 `json:"orders"`
	// Products is the total number of non-deleted products.
	Products int64 `json:"products"`
	// Users is the total number of non-deleted users.
	Users int64 `json:"users"`
	// Categories is the total number of non-deleted categories.
	Categories int64 `json:"categories"`
}

// OrdersByStatus counts orders per canonical lifecycle status.
type OrdersByStatus struct {
	// Pending is the number of pending orders.
	Pending int64 `json:"pending"`
	// Paid is the number of paid orders.
	Paid int64 `json:"paid"`
	// Processing is the number of processing orders.
	Processing int64 `json:"processing"`
	// Completed is the number of completed orders.
	Completed int64 `json:"completed"`
	// Cancelled is the number of cancelled orders.
	Cancelled int64 `json:"cancelled"`
	// Refunded is the number of refunded orders.
	Refunded int64 `json:"refunded"`
}

// RecentOrderItem is a compact read model for the recent-orders list.
type RecentOrderItem struct {
	// ID is the order primary key.
	ID uint `json:"id"`
	// OrderNumber is the server-generated order number.
	OrderNumber string `json:"orderNumber"`
	// Customer is the order customer name.
	Customer string `json:"customer"`
	// Status is the order lifecycle status.
	Status string `json:"status"`
	// TotalPrice is the order total price.
	TotalPrice float64 `json:"totalPrice"`
	// CreatedAt is the order creation timestamp.
	CreatedAt time.Time `json:"createdAt"`
}

// LowStockItem is a compact read model for the low-stock list.
type LowStockItem struct {
	// ID is the product primary key.
	ID uint `json:"id"`
	// Name is the product name.
	Name string `json:"name"`
	// Slug is the product unique slug.
	Slug string `json:"slug"`
	// Stock is the current product stock.
	Stock float64 `json:"stock"`
	// Price is the product price.
	Price float64 `json:"price"`
}

// DashboardSummary is the GET /admin/dashboard/summary response payload.
type DashboardSummary struct {
	// Revenue aggregates total and month-to-date revenue.
	Revenue RevenueSummary `json:"revenue"`
	// Counts holds entity counts.
	Counts CountSummary `json:"counts"`
	// OrdersByStatus counts orders per status.
	OrdersByStatus OrdersByStatus `json:"ordersByStatus"`
	// RecentOrders lists the 5 most recent orders.
	RecentOrders []RecentOrderItem `json:"recentOrders"`
	// LowStock lists the 5 lowest-stock products.
	LowStock []LowStockItem `json:"lowStock"`
}
