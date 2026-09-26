package Middleware

import (
	jwtHelper "backend/helper/jwt"
	"errors"
	"log"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	jwt "github.com/golang-jwt/jwt/v5"
)

// AuthMiddleware requires a valid admin access token.
// Expired tokens abort with code TOKEN_EXPIRED so the frontend knows to
// refresh; any other token problem aborts with TOKEN_INVALID.
// All 401 bodies share the {success:false, code, message} envelope.
// On success UserID/UserEmail/UserRole are set on the gin context.
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		if c.Request.Method == http.MethodOptions {
			c.Next()
			return
		}

		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"success": false, "code": "TOKEN_INVALID", "message": "Please login first!"})
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"success": false, "code": "TOKEN_INVALID", "message": "Wrong token format!"})
			return
		}

		claims, err := jwtHelper.ParseJWT(parts[1])
		if err != nil {
			log.Println(err)
			if errors.Is(err, jwt.ErrTokenExpired) {
				c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"success": false, "code": "TOKEN_EXPIRED", "message": "Token expired"})
				return
			}
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"success": false, "code": "TOKEN_INVALID", "message": "Invalid token!"})
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

		c.Set("UserID", claims.UserID)
		c.Set("UserEmail", claims.UserEmail)
		c.Set("UserRole", claims.UserRole)

		c.Next()
	}
}
