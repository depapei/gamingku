package order

type VariantDetail struct {
	ID int `json:"id,omitempty"`
}

type OrderDetail struct {
	ID        *int    `json:"id,omitempty"`
	Quantity  float64 `json:"quantity" binding:"required"`
	ProductId int     `json:"productId" binding:"required"`
	Price     float64 `json:"price" binding:"required"`

	Variants []VariantDetail `json:"variants" binding:"required,min=1"`
}

type RequestOrder struct {
	ID       *int          `json:"id"`
	Customer string        `json:"customer" binding:"required,min=3"`
	Address  string        `json:"address" binding:"required"`
	Email    string        `json:"email" binding:"required"`
	Items    []OrderDetail `json:"items" binding:"required,dive,required"`
}
