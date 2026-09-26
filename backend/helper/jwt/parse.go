package jwt

import (
	jwtType "backend/helper/type/jwt"

	"github.com/golang-jwt/jwt/v5"
)

// ParseJWT validates an access-token string and returns its claims.
// The signing secret is read at call time (see secret()) so .env-only
// configuration works. Expiry surfaces as jwt.ErrTokenExpired so callers
// can distinguish TOKEN_EXPIRED from TOKEN_INVALID.
func ParseJWT(tokenStr string) (*jwtType.JwtClaim, error) {
	claims := &jwtType.JwtClaim{}
	token, err := jwt.ParseWithClaims(tokenStr, claims, func(token *jwt.Token) (interface{}, error) {
		return secret(), nil
	})
	if err != nil || !token.Valid {
		return nil, err
	}
	return claims, nil
}
