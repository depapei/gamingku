package PubAuthService

import (
	DataAccess "backend/db"
	"backend/helper/jwt"
	"backend/helper/type/auth"
	"backend/model"

	"golang.org/x/crypto/bcrypt"
)

func Login(input auth.LoginInput) (bool, string, error) {
	var user model.User

	raw := DataAccess.DB

	err := raw.First(&user, "email = ?", input.Email).Error
	if err != nil {
		return false, "error", err
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password))
	if err != nil {
		return false, "error", err
	}

	signed, token, err := jwt.Claim(input)

	return signed, token, err
}
