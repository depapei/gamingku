package PubAuthController

import (
	"backend/helper"
	"backend/helper/type/auth"
	PubAuthService "backend/services/public/auth"
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// Login authenticates a user, returns a short-lived access token in the body
// and sets the opaque refresh token as an httpOnly cookie.
func Login(c *gin.Context) {
	var input auth.LoginInput

	if err := c.ShouldBindJSON(&input); err != nil {
		message := helper.Validate(err)
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  false,
			"message": message,
		})
		return
	}

	result, err := PubAuthService.Login(input)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": "Email not found",
			})
			return
		}
		if errors.Is(err, bcrypt.ErrMismatchedHashAndPassword) {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": "Wrong password!",
			})
			return
		}
		if errors.Is(err, PubAuthService.ErrInactive) {
			c.JSON(http.StatusForbidden, gin.H{
				"success": false,
				"message": "User is inactive",
			})
			return
		}
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Login failed",
		})
		return
	}

	helper.SetRefreshCookie(c, result.RefreshToken, helper.RefreshCookieMaxAge)

	c.JSON(http.StatusOK, gin.H{
		"success":     true,
		"message":     "Successfully login",
		"accessToken": result.AccessToken,
		"user": gin.H{
			"id":    result.User.ID,
			"name":  result.User.Name,
			"email": result.User.Email,
			"role":  result.User.Role,
		},
	})
}
