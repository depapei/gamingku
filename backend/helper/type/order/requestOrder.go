package order

type VariantDetail struct {
	ID   int    `json:"id,omitempty" binding:"required"`
	Name string `json:"name"`
}

type OrderDetail struct {
	ID          *int    `json:"id,omitempty"`
	Quantity    float64 `json:"quantity" binding:"required"`
	ProductId   int     `json:"productId,omitempty" binding:"required"`
	ProductName string  `json:"product,omitempty"`
	Price       float64 `json:"price" binding:"required"`

	Variants []VariantDetail `json:"variants,omitempty" binding:"required,min=1"`
	Variant  []string        `json:"choosedVariant"`
}

type RequestOrder struct {
	ID       *int          `json:"id,omitempty"`
	Customer string        `json:"customer" binding:"required,min=3"`
	Address  string        `json:"address" binding:"required"`
	Email    string        `json:"email" binding:"required"`
	Items    []OrderDetail `json:"items,omitempty" binding:"required,dive,required"`
}
