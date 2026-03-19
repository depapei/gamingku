package jwt

import (
	"backend/helper/type/auth"
	jwtType "backend/helper/type/jwt"
	"log"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

var jwtSecret = []byte(os.Getenv("SECRET_KEY"))

func Claim(input auth.LoginInput) (bool, string, error) {
	expTime := time.Now().Add(2 * time.Hour)
	claim := jwtType.JwtClaim{
		UserEmail: input.Email,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "gamingku-authentication-system",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claim)
	tokenString, err := token.SignedString(jwtSecret)
	if err != nil {
		log.Println(err.Error())
		return false, "error while generate token", err
	}

	return true, tokenString, err

}
