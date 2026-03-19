package jwtType

import "github.com/golang-jwt/jwt/v5"

type JwtClaim struct {
	UserEmail string `json:"user_email"`
	jwt.RegisteredClaims
}
