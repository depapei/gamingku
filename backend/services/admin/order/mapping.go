package AdminOrderService

import (
	"crypto/rand"
	"fmt"
	"time"

	OrderDTO "backend/helper/type/order"
	"backend/model"

	"gorm.io/gorm"
)

// legacyStatusMap maps retired stored statuses to the canonical lifecycle set.
var legacyStatusMap = map[string]string{
	"shipped":   "processing",
	"delivered": "completed",
}

// normalizeStatus maps a stored status to the canonical set, passing
// canonical values through unchanged.
func normalizeStatus(s string) string {
	if mapped, ok := legacyStatusMap[s]; ok {
		return mapped
	}
	return s
}

// preloadOrderItems preloads items with product, variants and options for
// variant-name resolution.
func preloadOrderItems(db *gorm.DB) *gorm.DB {
	return db.
		Preload("Items").
		Preload("Items.Product").
		Preload("Items.Product.Variants").
		Preload("Items.Product.Variants.Options")
}

// variantNames resolves an item's option IDs to display names.
func variantNames(item model.OrderItem) []string {
	if len(item.VariantId) == 0 {
		return nil
	}
	lookup := make(map[int64]string)
	for _, variant := range item.Product.Variants {
		for _, option := range variant.Options {
			lookup[int64(option.ID)] = option.Name
		}
	}
	names := make([]string, 0, len(item.VariantId))
	for _, id := range item.VariantId {
		if name, ok := lookup[id]; ok {
			names = append(names, name)
		}
	}
	return names
}

// toOrderResponse maps a loaded Order model to the admin read model.
func toOrderResponse(o model.Order) OrderDTO.OrderResponse {
	items := make([]OrderDTO.OrderItemResponse, 0, len(o.Items))
	for _, item := range o.Items {
		qty := item.Quantity
		items = append(items, OrderDTO.OrderItemResponse{
			ID:           item.ID,
			ProductID:    item.ProductId,
			ProductName:  item.Product.Name,
			Qty:          qty,
			Quantity:     qty,
			Price:        item.Price,
			VariantIDs:   []int64(item.VariantId),
			VariantNames: variantNames(item),
		})
	}
	return OrderDTO.OrderResponse{
		ID:            o.ID,
		OrderNumber:   o.OrderNumber,
		UserID:        o.UserId,
		Customer:      o.Customer,
		Address:       o.Address,
		Email:         o.Email,
		Status:        normalizeStatus(o.Status),
		TotalPrice:    o.TotalPrice,
		TotalAmount:   o.TotalPrice,
		PaymentMethod: o.PaymentMethod,
		Items:         items,
		CreatedAt:     o.CreatedAt,
		UpdatedAt:     o.UpdatedAt,
	}
}

const orderNumberCharset = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

// GenerateOrderNumber builds a unique ORD-YYYYMMDD-XXXX identifier,
// retrying on collision. It accepts a transaction so callers can reserve
// the number atomically with the order insert.
func GenerateOrderNumber(db *gorm.DB) (string, error) {
	date := time.Now().Format("20060102")
	for attempt := 0; attempt < 5; attempt++ {
		var suffix [4]byte
		if _, err := rand.Read(suffix[:]); err != nil {
			return "", err
		}
		chars := make([]byte, 4)
		for i, b := range suffix {
			chars[i] = orderNumberCharset[int(b)%len(orderNumberCharset)]
		}
		candidate := fmt.Sprintf("ORD-%s-%s", date, string(chars))
		var count int64
		if err := db.Unscoped().Model(&model.Order{}).Where("order_number = ?", candidate).Count(&count).Error; err != nil {
			return "", err
		}
		if count == 0 {
			return candidate, nil
		}
	}
	return "", fmt.Errorf("failed to generate unique order number")
}
