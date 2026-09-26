package AdminDashboardService

import (
	"context"
	"fmt"
	"time"

	DataAccess "backend/db"
	DashboardDTO "backend/helper/type/dashboard"
	"backend/model"
)

// statusRow maps one GROUP BY status bucket.
type statusRow struct {
	Status string
	Count  int64
}

// countRow holds the four entity counts in a single query.
type countRow struct {
	Orders     int64
	Products   int64
	Users      int64
	Categories int64
}

// revenueRow holds total and month-to-date revenue in a single query.
type revenueRow struct {
	Total float64
	Month float64
}

// GetSummary aggregates dashboard overview stats from existing tables.
// It issues 6 or fewer queries, preloads recent order items once (no N+1),
// respects GORM soft-delete scopes, and returns zeroes (never nulls) on empty DB.
func GetSummary(ctx context.Context) (DashboardDTO.DashboardSummary, error) {
	db := DataAccess.DB.WithContext(ctx)
	now := time.Now()
	monthStart := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())

	var counts countRow
	if err := db.Raw(`
		SELECT
			(SELECT COUNT(*) FROM orders WHERE deleted_at IS NULL) AS orders,
			(SELECT COUNT(*) FROM products WHERE deleted_at IS NULL) AS products,
			(SELECT COUNT(*) FROM users WHERE deleted_at IS NULL) AS users,
			(SELECT COUNT(*) FROM categories WHERE deleted_at IS NULL) AS categories
	`).Scan(&counts).Error; err != nil {
		return DashboardDTO.DashboardSummary{}, fmt.Errorf("dashboard counts: %w (%v)", ErrDashboardQuery, err)
	}

	var revenue revenueRow
	if err := db.Raw(`
		SELECT
			COALESCE(SUM(total_price), 0) AS total,
			COALESCE(SUM(CASE WHEN created_at >= ? THEN total_price ELSE 0 END), 0) AS month
		FROM orders WHERE deleted_at IS NULL
	`, monthStart).Scan(&revenue).Error; err != nil {
		return DashboardDTO.DashboardSummary{}, fmt.Errorf("dashboard revenue: %w (%v)", ErrDashboardQuery, err)
	}

	var rows []statusRow
	if err := db.Model(&model.Order{}).
		Select("status, COUNT(*) AS count").
		Group("status").
		Scan(&rows).Error; err != nil {
		return DashboardDTO.DashboardSummary{}, fmt.Errorf("dashboard orders by status: %w (%v)", ErrDashboardQuery, err)
	}
	byStatus := DashboardDTO.OrdersByStatus{}
	for _, r := range rows {
		switch r.Status {
		case "pending":
			byStatus.Pending = r.Count
		case "paid":
			byStatus.Paid = r.Count
		case "processing":
			byStatus.Processing = r.Count
		case "completed":
			byStatus.Completed = r.Count
		case "cancelled":
			byStatus.Cancelled = r.Count
		case "refunded":
			byStatus.Refunded = r.Count
		}
	}

	var orders []model.Order
	if err := db.Model(&model.Order{}).
		Preload("Items").
		Order("created_at DESC").
		Limit(DashboardDTO.RecentOrdersLimit).
		Find(&orders).Error; err != nil {
		return DashboardDTO.DashboardSummary{}, fmt.Errorf("dashboard recent orders: %w (%v)", ErrDashboardQuery, err)
	}
	recent := make([]DashboardDTO.RecentOrderItem, 0, len(orders))
	for _, o := range orders {
		o := o
		recent = append(recent, DashboardDTO.RecentOrderItem{
			ID:          o.ID,
			OrderNumber: o.OrderNumber,
			Customer:    o.Customer,
			Status:      o.Status,
			TotalPrice:  o.TotalPrice,
			CreatedAt:   o.CreatedAt,
		})
	}

	var products []model.Product
	if err := db.Model(&model.Product{}).
		Order("stock ASC").
		Limit(DashboardDTO.LowStockLimit).
		Find(&products).Error; err != nil {
		return DashboardDTO.DashboardSummary{}, fmt.Errorf("dashboard low stock: %w (%v)", ErrDashboardQuery, err)
	}
	low := make([]DashboardDTO.LowStockItem, 0, len(products))
	for _, p := range products {
		p := p
		low = append(low, DashboardDTO.LowStockItem{
			ID:    p.ID,
			Name:  p.Name,
			Slug:  p.Slug,
			Stock: p.Stock,
			Price: p.Price,
		})
	}

	return DashboardDTO.DashboardSummary{
		Revenue: DashboardDTO.RevenueSummary{
			Total:    revenue.Total,
			Month:    revenue.Month,
			Currency: DashboardDTO.CurrencyIDR,
		},
		Counts: DashboardDTO.CountSummary{
			Orders:     counts.Orders,
			Products:   counts.Products,
			Users:      counts.Users,
			Categories: counts.Categories,
		},
		OrdersByStatus: byStatus,
		RecentOrders:   recent,
		LowStock:       low,
	}, nil
}
