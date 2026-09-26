package AdminOrderService

import (
	DataAccess "backend/db"
	"backend/model"
)

// DeleteOrder soft-deletes an order by id. It returns ErrOrderNotFound when
// no row matches.
func DeleteOrder(id uint) error {
	if id == 0 {
		return ErrOrderNotFound
	}

	result := DataAccess.DB.Where("id = ?", id).Delete(&model.Order{})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return ErrOrderNotFound
	}

	return nil
}
