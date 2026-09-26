package AdminOrderService

import (
	DataAccess "backend/db"
	"backend/model"
	"errors"

	"gorm.io/gorm"
)

// allowedTransitions maps each status to its legal successors.
// Terminal states (cancelled, refunded) have no outgoing transitions.
var allowedTransitions = map[string][]string{
	"pending":    {"paid", "cancelled"},
	"paid":       {"processing", "refunded", "cancelled"},
	"processing": {"completed", "cancelled"},
	"completed":  {"refunded"},
	"cancelled":  {},
	"refunded":   {},
}

// UpdateOrderStatus moves an order to a new lifecycle status after
// validating the transition. It returns ErrOrderNotFound when no row
// matches, ErrOrderStatusConflict for a no-op, and
// ErrOrderIllegalTransition for a forbidden jump.
func UpdateOrderStatus(id uint, status string) error {
	if id == 0 {
		return ErrOrderNotFound
	}

	var existing model.Order
	if err := DataAccess.DB.Select("id", "status").First(&existing, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrOrderNotFound
		}
		return err
	}

	current := normalizeStatus(existing.Status)
	if current == status {
		return ErrOrderStatusConflict
	}

	allowed := false
	for _, next := range allowedTransitions[current] {
		if next == status {
			allowed = true
			break
		}
	}
	if !allowed {
		return ErrOrderIllegalTransition
	}

	result := DataAccess.DB.Model(&model.Order{}).Where("id = ?", id).Update("status", status)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return ErrOrderNotFound
	}

	return nil
}
