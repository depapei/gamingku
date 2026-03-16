package main

import (
	PubCategoryController "backend/controllers/public/category"
	PubProductController "backend/controllers/public/product"
	DataAccess "backend/db"

	// Seeder "backend/seeder"
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
	// Migration.Migrate(DataAccess.DB)
	// Seeder.Stack();

	r := gin.Default()

	public := r.Group("/")
	{
		product := public.Group("/product")
		{
			product.GET("/", PubProductController.GetProducts)
		}
		category := public.Group("/category")
		{
			category.GET("/", PubCategoryController.GetCategories)
		}
	}

	r.Run()
}
