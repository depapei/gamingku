package jwt

import (
	jwtType "backend/helper/type/jwt"
	"os"

	"github.com/golang-jwt/jwt/v5"
)

var jwtKey = []byte(os.Getenv("SECRET_KEY"))

func ParseJWT(tokenStr string) (*jwtType.JwtClaim, error) {
	claims := &jwtType.JwtClaim{}
	token, err := jwt.ParseWithClaims(tokenStr, claims, func(token *jwt.Token) (interface{}, error) {
		return jwtKey, nil
	})
	if err != nil || !token.Valid {
		return nil, err
	}
	return claims, nil
}
