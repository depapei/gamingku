package jwtType

import "github.com/golang-jwt/jwt/v5"

type JwtClaim struct {
	UserRole  string `json:"user_role"`
	UserEmail string `json:"user_email"`
	jwt.RegisteredClaims
}
