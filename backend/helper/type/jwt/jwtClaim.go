package jwtType

import "github.com/golang-jwt/jwt/v5"

// JwtClaim carries the authenticated user identity inside access tokens.
type JwtClaim struct {
	UserID    uint   `json:"user_id"`
	UserRole  string `json:"user_role"`
	UserEmail string `json:"user_email"`
	jwt.RegisteredClaims
}
