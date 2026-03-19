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

func Register(c *gin.Context) {
	var input auth.RegisterInput

	if err := c.ShouldBindJSON(&input); err != nil {
		message := helper.Validate(err)
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  false,
			"message": message,
		})
		return
	}

	isCreated, err := PubAuthService.Register(input)
	if err != nil {
		var message string
		if errors.Is(err, gorm.ErrDuplicatedKey) {
			message = "Email " + input.Email + " is already exist!"
		} else if errors.Is(err, bcrypt.ErrHashTooShort) {
			message = "Password too short!"
		}
		c.JSON(http.StatusUnauthorized, gin.H{
			"status":  false,
			"message": message,
		})
		return
	}

	var message string
	switch isCreated {
	case true:
		message = "Successfully register!"
	default:
		message = "Register failed!"
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": message,
	})
}
