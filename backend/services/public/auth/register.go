package PubAuthService

import (
	DataAccess "backend/db"
	"backend/helper/type/auth"
	"backend/model"

	"golang.org/x/crypto/bcrypt"
)

func Register(input auth.RegisterInput) (bool, error) {

	hashed, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		return false, err
	}

	newUser := model.User{
		Name:     input.Name,
		Password: string(hashed),
		Email:    input.Email,
		Role:     "customer",
	}

	raw := DataAccess.DB

	err = raw.Create(&newUser).Error
	if err != nil {
		return false, err
	}

	return true, err
}
