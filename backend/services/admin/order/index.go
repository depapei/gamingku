package AdminOrderService

import (
	DataAccess "backend/db"
	"backend/helper/type/order"
	"backend/model"
	"log"
	"strconv"
)

type Temp struct {
	Order model.Order

	Variants []model.VariantOptions
}

func GetOrders(search string, sortBy string, sort string, limit string) ([]order.RequestOrder, error) {
	var orders []model.Order
	var data []order.RequestOrder

	raw := DataAccess.DB

	raw = raw.
		Preload("Items").
		Preload("Items.Product").
		Preload("Items.Product.Variants").
		Preload("Items.Product.Variants.Options")

	if len(search) > 0 {
		s := "%" + search + "%"
		raw = raw.Where("LOWER(customer) LIKE LOWER(?)", s)
	}

	if len(sortBy) > 0 {
		var f string
		if len(sort) > 0 {
			f = sortBy + " " + sort
			raw = raw.Order(f)
		} else {
			f = sortBy
			raw = raw.Order(f + " asc")
		}
	}

	if len(limit) > 0 {
		intLimit, err := strconv.ParseInt(limit, 0, 64)
		if err != nil {
			return data, err
		}
		raw = raw.Limit(int(intLimit))
	} else {
		raw = raw.Limit(20)
	}

	err := raw.Find(&orders).Error
	if err != nil {
		log.Println(err.Error())
	}

	for _, o := range orders {
		var oItems []order.OrderDetail
		for _, i := range o.Items {
			var choosedVariants []string
			for _, ipv := range i.Product.Variants {
				for _, ipvo := range ipv.Options {
					for _, ivi := range i.VariantId {
						if ivi == int64(ipvo.ID) {
							choosedVariants = append(choosedVariants, ipvo.Name)
						}
					}
				}
			}

			id := int(i.ID)
			oItems = append(oItems, order.OrderDetail{
				ID:          &id,
				Quantity:    i.Quantity,
				Price:       i.Price,
				ProductName: i.Product.Name,
				Variant:     choosedVariants,
			})
		}

		id := int(o.ID)
		data = append(data, order.RequestOrder{
			ID:       &id,
			Customer: o.Customer,
			Address:  o.Address,
			Email:    o.Email,
			Items:    oItems,
		})
	}

	return data, err
}
