package main

import (
	DataAccess "backend/db"
	Migration "backend/migration"
	"log"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {

	err := godotenv.Load(); if err != nil {
		log.Fatal("failed to load .env files")
	}

	DataAccess.Connect()
	Migration.Migrate(DataAccess.DB)
	r := gin.Default()

	r.Run();
}