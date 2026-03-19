package PubOrderService

import (
	DataAccess "backend/db"
	"backend/helper"
	"backend/helper/type/order"
	"backend/model"
	"log"

	"github.com/lib/pq"
)

func Create(input order.RequestOrder) (string, error) {
	raw := DataAccess.DB

	var response string
	var order model.Order
	var items []model.OrderItem
	var totalPrice float64

	trx := raw.Begin()

	for _, item := range input.Items {
		totalPrice += item.Price * item.Quantity
	}

	order = model.Order{
		Status:     "pending",
		Customer:   input.Customer,
		Address:    input.Address,
		Email:      input.Email,
		TotalPrice: totalPrice,
	}

	err := raw.Create(&order).Error
	if err != nil {
		trx.Rollback()
		message := helper.ParseError(err)
		response = message
		log.Println(err.Error())
	}

	for _, item := range input.Items {
		var variants pq.Int64Array
		for _, variant := range item.Variants {
			variants = append(variants, int64(variant.ID))
		}

		items = append(items, model.OrderItem{
			Quantity:  item.Quantity,
			VariantId: variants,
			ProductId: item.ProductId,
			Price:     item.Price,
			OrderId:   int(order.ID),
		})
	}

	err = raw.Create(&items).Error
	if err != nil {
		trx.Rollback()
		message := helper.ParseError(err)
		response = message
		log.Println(err.Error())
	}

	trx.Commit()
	response = "Created data successfully"

	return response, err
}
