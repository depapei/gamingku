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

	isLogin, token, err := PubAuthService.Login(input)
	if err != nil {
		var message string
		if errors.Is(err, gorm.ErrRecordNotFound) {
			message = "User not found"
		} else if errors.Is(err, bcrypt.ErrMismatchedHashAndPassword) {
			message = "Wrong password!"
		}
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  false,
			"message": message,
		})
		return
	}

	var message string
	switch isLogin {
	case true:
		message = "Successfully login"
	default:
		message = "unknown error"
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": message,
		"token":   token,
	})
}
