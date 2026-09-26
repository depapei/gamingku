package main

import (
	AdminCategoryController "backend/controllers/admin/category"
	AdminDashboardController "backend/controllers/admin/dashboard"
	AdminOrderController "backend/controllers/admin/order"
	AdminProductController "backend/controllers/admin/product"
	AdminUserController "backend/controllers/admin/user"
	PubAuthController "backend/controllers/public/auth"
	PubCategoryController "backend/controllers/public/category"
	PubOrderController "backend/controllers/public/order"
	PubProductController "backend/controllers/public/product"
	DataAccess "backend/db"
	"backend/helper"
	Middleware "backend/middleware"
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
		auth := public.Group("/auth")
		{
			auth.POST("/login", PubAuthController.Login)
			auth.POST("/register", PubAuthController.Register)
			auth.POST("/refresh", PubAuthController.Refresh)
			auth.POST("/logout", PubAuthController.Logout)
		}
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
	admin.Use(Middleware.AuthMiddleware())
	{
		product := admin.Group("/product")
		{
			product.GET("/", AdminProductController.GetProducts)
			product.POST("/", AdminProductController.CreateProduct)
			product.GET("/:slug", AdminProductController.GetDetail)
			product.PUT("/:slug", AdminProductController.UpdateProduct)
			product.DELETE("/:slug", AdminProductController.DeleteProduct)
		}
		category := admin.Group("/category")
		{
			category.GET("/", AdminCategoryController.GetCategories)
			category.POST("/", AdminCategoryController.CreateCategory)
			category.PUT("/:id", AdminCategoryController.UpdateCategory)
			category.DELETE("/:id", AdminCategoryController.DeleteCategory)
			category.GET("/:id", AdminCategoryController.GetDetail)
		}
		order := admin.Group("/order")
		{
			order.GET("/", AdminOrderController.GetOrders)
			order.GET("/:id", AdminOrderController.GetDetail)
			order.PATCH("/:id/status", AdminOrderController.UpdateStatus)
			order.DELETE("/:id", AdminOrderController.DeleteOrder)
		}
		user := admin.Group("/user")
		{
			user.GET("/", AdminUserController.GetUsers)
			user.GET("/:id", AdminUserController.GetUserByID)
			user.POST("/", AdminUserController.CreateUser)
			user.PUT("/:id", AdminUserController.UpdateUser)
			user.PUT("/:id/status", AdminUserController.UpdateUserStatus)
			user.PUT("/:id/password", AdminUserController.ResetUserPassword)
			user.DELETE("/:id", AdminUserController.DeleteUser)
		}
		dashboard := admin.Group("/dashboard")
		{
			dashboard.GET("/summary", AdminDashboardController.GetSummary)
		}
	}

	r.Run()
}
