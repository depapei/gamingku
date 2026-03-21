package Middleware

import (
	"backend/helper/jwt"
	"log"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		if c.Request.Method == http.MethodOptions {
			c.Next()
			return
		}

		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Please login first!"})
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Wrong token format!"})
			return
		}

		claims, err := jwt.ParseJWT(parts[1])
		if err != nil {
			log.Println(jwt.ParseJWT(parts[1]))
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token!"})
			return
		}

		if claims.UserRole != "admin" {
			log.Println(claims.UserRole)
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "Access denied",
			})
			return
		}

		c.Set("UserEmail", claims.UserEmail)
		c.Set("UserRole", claims.UserRole)

		c.Next()
	}
}
