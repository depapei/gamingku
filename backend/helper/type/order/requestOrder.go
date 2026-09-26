package order

import "time"

// VariantDetail is a variant option reference within an order item.
// Kept for backward compatibility with existing checkout clients.
type VariantDetail struct {
	ID   int    `json:"id,omitempty" binding:"required"`
	Name string `json:"name"`
}

// OrderItemInput is a single validated line in a create-order payload.
// Quantity is the canonical key; Qty is accepted as an alias and both are
// resolved via EffectiveQty. VariantIds is canonical; Variants (legacy
// detail objects) and ChoosedVariant (legacy names) are accepted too.
type OrderItemInput struct {
	ProductID      int             `json:"productId" binding:"required,gt=0"`
	Quantity       float64         `json:"quantity,omitempty" binding:"omitempty,gt=0"`
	Qty            float64         `json:"qty,omitempty" binding:"omitempty,gt=0"`
	Price          float64         `json:"price" binding:"required,gte=0"`
	VariantIDs     []int64         `json:"variantIds,omitempty" binding:"omitempty"`
	Variants       []VariantDetail `json:"variants,omitempty" binding:"omitempty,dive"`
	ChoosedVariant []string        `json:"choosedVariant,omitempty" binding:"omitempty"`
}

// EffectiveQty resolves the line quantity from Quantity (preferred) or Qty.
func (i OrderItemInput) EffectiveQty() float64 {
	if i.Quantity > 0 {
		return i.Quantity
	}
	return i.Qty
}

// EffectiveVariantIDs resolves option IDs from VariantIDs (preferred) or
// legacy Variants detail objects.
func (i OrderItemInput) EffectiveVariantIDs() []int64 {
	if len(i.VariantIDs) > 0 {
		return i.VariantIDs
	}
	ids := make([]int64, 0, len(i.Variants))
	for _, v := range i.Variants {
		ids = append(ids, int64(v.ID))
	}
	return ids
}

// CreateOrderInput is the validated payload for POST /order/.
// Totals are computed server-side; any client total is ignored.
type CreateOrderInput struct {
	Customer      string           `json:"customer" binding:"required,min=3"`
	Address       string           `json:"address" binding:"required"`
	Email         string           `json:"email" binding:"required,email"`
	Items         []OrderItemInput `json:"items" binding:"required,min=1,dive"`
	PaymentMethod string           `json:"paymentMethod,omitempty" binding:"omitempty,oneof=cod transfer ewallet qris"`
	UserID        *int             `json:"userId,omitempty"`
}

// RequestOrder is a backward-compatible alias of CreateOrderInput.
type RequestOrder = CreateOrderInput

// OrderDetail is a backward-compatible alias of OrderItemInput.
type OrderDetail = OrderItemInput

// UpdateStatusInput is the validated payload for PATCH /admin/order/:id/status.
type UpdateStatusInput struct {
	Status string `json:"status" binding:"required,oneof=pending paid processing completed cancelled refunded"`
}

// OrderListParams carries validated admin list/search/sort/pagination options.
type OrderListParams struct {
	Search   string
	Status   string
	UserID   *int
	DateFrom *time.Time
	DateTo   *time.Time
	SortBy   string
	Sort     string
	Page     int
	Limit    int
}

// OrderItemResponse is the admin read model for one order line.
type OrderItemResponse struct {
	ID           uint     `json:"id"`
	ProductID    int      `json:"productId"`
	ProductName  string   `json:"productName"`
	Qty          float64  `json:"qty"`
	Quantity     float64  `json:"quantity"`
	Price        float64  `json:"price"`
	VariantIDs   []int64  `json:"variantIds,omitempty"`
	VariantNames []string `json:"variantNames,omitempty"`
}

// OrderResponse is the canonical admin read model for an order.
// TotalPrice is the legacy key, TotalAmount the canonical key (same value).
type OrderResponse struct {
	ID            uint                `json:"id"`
	OrderNumber   string              `json:"orderNumber"`
	UserID        *int                `json:"userId,omitempty"`
	Customer      string              `json:"customer"`
	Address       string              `json:"address"`
	Email         string              `json:"email"`
	Status        string              `json:"status"`
	TotalPrice    float64             `json:"totalPrice"`
	TotalAmount   float64             `json:"totalAmount"`
	PaymentMethod string              `json:"paymentMethod"`
	Items         []OrderItemResponse `json:"items"`
	CreatedAt     time.Time           `json:"createdAt"`
	UpdatedAt     time.Time           `json:"updatedAt"`
}

// PaginatedOrderResponse is the envelope for paginated admin list results.
type PaginatedOrderResponse struct {
	Data  []OrderResponse `json:"data"`
	Total int64           `json:"total"`
	Page  int             `json:"page"`
	Limit int            `json:"limit"`
}

// CreateOrderResult is the 201 payload for a newly created order.
type CreateOrderResult struct {
	ID          uint   `json:"id"`
	OrderNumber string `json:"orderNumber"`
}
