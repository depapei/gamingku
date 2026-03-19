package main

import (
	AdminCategoryController "backend/controllers/admin/category"
	PubCategoryController "backend/controllers/public/category"
	PubOrderController "backend/controllers/public/order"
	PubProductController "backend/controllers/public/product"
	DataAccess "backend/db"
	"backend/helper"
	Migration "backend/migration"

	Seeder "backend/seeder"
	"log"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {

	err := godotenv.Load()
	if err != nil {
		log.Fatal("failed to load .env files")
	}

	DataAccess.Connect()
	Migration.Migrate(DataAccess.DB)
	Seeder.Stack()

	r := gin.Default()
	r.Use(helper.Cors())

	public := r.Group("/")
	{
		category := public.Group("/category")
		{
			category.GET("/", PubCategoryController.GetCategories)
		}
		product := public.Group("/product")
		{
			product.GET("/", PubProductController.GetProducts)
			product.GET("/:slug", PubProductController.GetDetail)
		}
		order := public.Group("/order")
		{
			order.POST("/", PubOrderController.StoreOrder)
		}
	}

	admin := r.Group("/admin")
	{
		// product := public.Group("/product")
		// {
		// 	product.GET("/", PubProductController.GetProducts)
		// 	product.GET("/:slug", PubProductController.GetDetail)
		// }
		category := admin.Group("/category")
		{
			category.GET("/", AdminCategoryController.GetCategories)
			category.GET("/:id", AdminCategoryController.GetDetail)
		}
	}

	r.Run()
}
