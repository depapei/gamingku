package AdminOrderService

import (
	DataAccess "backend/db"
	OrderDTO "backend/helper/type/order"
	"backend/model"
	"errors"

	"gorm.io/gorm"
)

// GetOrderByID returns one order with items, product and variant names.
// It returns ErrOrderNotFound for unknown or soft-deleted ids.
func GetOrderByID(id uint) (OrderDTO.OrderResponse, error) {
	if id == 0 {
		return OrderDTO.OrderResponse{}, ErrOrderNotFound
	}

	var o model.Order
	if err := preloadOrderItems(DataAccess.DB).First(&o, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return OrderDTO.OrderResponse{}, ErrOrderNotFound
		}
		return OrderDTO.OrderResponse{}, err
	}

	return toOrderResponse(o), nil
}
