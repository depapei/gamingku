package PubOrderService

import (
	DataAccess "backend/db"
	OrderDTO "backend/helper/type/order"
	AdminOrderService "backend/services/admin/order"
	"backend/model"
	"errors"

	"github.com/lib/pq"
)

// Create persists an order and its items atomically: the total is computed
// server-side, every product reference is verified, and the order number is
// generated server-side. Nothing is written outside the transaction.
func Create(input OrderDTO.CreateOrderInput) (OrderDTO.CreateOrderResult, error) {
	db := DataAccess.DB

	productIDs := make([]int, 0, len(input.Items))
	for _, item := range input.Items {
		if item.EffectiveQty() <= 0 {
			return OrderDTO.CreateOrderResult{}, AdminOrderService.ErrOrderInvalidInput
		}
		productIDs = append(productIDs, item.ProductID)
	}

	var existing int64
	if err := db.Model(&model.Product{}).Where("id IN ?", productIDs).Count(&existing).Error; err != nil {
		return OrderDTO.CreateOrderResult{}, err
	}
	if int(existing) != len(productIDs) {
		return OrderDTO.CreateOrderResult{}, AdminOrderService.ErrOrderProductNotFound
	}

	if input.UserID != nil {
		var userCount int64
		if err := db.Model(&model.User{}).Where("id = ?", *input.UserID).Count(&userCount).Error; err != nil {
			return OrderDTO.CreateOrderResult{}, err
		}
		if userCount == 0 {
			return OrderDTO.CreateOrderResult{}, errors.New("invalid user id")
		}
	}

	payment := input.PaymentMethod
	if payment == "" {
		payment = "cod"
	}

	var total float64
	for _, item := range input.Items {
		total += item.EffectiveQty() * item.Price
	}

	tx := db.Begin()
	if tx.Error != nil {
		return OrderDTO.CreateOrderResult{}, tx.Error
	}
	committed := false
	defer func() {
		if !committed {
			tx.Rollback()
		}
	}()

	orderNumber, err := AdminOrderService.GenerateOrderNumber(tx)
	if err != nil {
		return OrderDTO.CreateOrderResult{}, err
	}

	order := model.Order{
		OrderNumber:   orderNumber,
		UserId:        input.UserID,
		Status:        "pending",
		Customer:      input.Customer,
		Address:       input.Address,
		Email:         input.Email,
		TotalPrice:    total,
		PaymentMethod: payment,
	}
	if err := tx.Create(&order).Error; err != nil {
		return OrderDTO.CreateOrderResult{}, err
	}

	items := make([]model.OrderItem, 0, len(input.Items))
	for _, item := range input.Items {
		items = append(items, model.OrderItem{
			Quantity:  item.EffectiveQty(),
			VariantId: pq.Int64Array(item.EffectiveVariantIDs()),
			ProductId: item.ProductID,
			Price:     item.Price,
			OrderId:   int(order.ID),
		})
	}
	if err := tx.Create(&items).Error; err != nil {
		return OrderDTO.CreateOrderResult{}, err
	}

	if err := tx.Commit().Error; err != nil {
		return OrderDTO.CreateOrderResult{}, err
	}
	committed = true

	return OrderDTO.CreateOrderResult{ID: order.ID, OrderNumber: orderNumber}, nil
}
