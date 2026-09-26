package AdminOrderService

import "errors"

// Sentinel errors for order operations. Controllers map these to
// 404 (not found), 409 (conflict) or 400 (validation) responses.
var (
	// ErrOrderNotFound is returned when an order id does not exist.
	ErrOrderNotFound = errors.New("order not found")
	// ErrOrderStatusConflict is returned when the requested status equals
	// the current status.
	ErrOrderStatusConflict = errors.New("order status conflict")
	// ErrOrderIllegalTransition is returned when a status change violates
	// the order lifecycle transition map.
	ErrOrderIllegalTransition = errors.New("illegal order status transition")
	// ErrOrderProductNotFound is returned when a referenced product does not exist.
	ErrOrderProductNotFound = errors.New("product not found")
	// ErrOrderInvalidInput is returned when a resolved field (e.g. item
	// quantity) fails semantic validation beyond binding tags.
	ErrOrderInvalidInput = errors.New("invalid order input")
)
