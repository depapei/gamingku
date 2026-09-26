package jwt

import (
	jwtType "backend/helper/type/jwt"
	"backend/model"
	"log"
	"os"
	"strconv"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// secret returns the HMAC signing key, read at call time so .env values
// loaded in main() via godotenv are visible (package-level init reads run
// before main and would see an empty SECRET_KEY).
func secret() []byte {
	return []byte(os.Getenv("SECRET_KEY"))
}

// accessTTL returns how long access tokens live.
// Assumption: ACCESS_TOKEN_TTL_MINUTES env overrides the 15-minute default.
func accessTTL() time.Duration {
	if v := os.Getenv("ACCESS_TOKEN_TTL_MINUTES"); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n > 0 {
			return time.Duration(n) * time.Minute
		}
	}
	return 15 * time.Minute
}

// ClaimAccess mints a short-lived HS256 access token carrying the user id,
// email and role.
func ClaimAccess(user model.User) (string, error) {
	expTime := time.Now().Add(accessTTL())
	claim := jwtType.JwtClaim{
		UserID:    user.ID,
		UserEmail: user.Email,
		UserRole:  user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "gamingku-authentication-system",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claim)
	tokenString, err := token.SignedString(secret())
	if err != nil {
		log.Println(err.Error())
		return "", err
	}

	return tokenString, nil
}

// Claim is the legacy single-token mint kept for compatibility.
// It delegates to ClaimAccess and preserves the old (bool, string, error)
// signature for any remaining callers.
func Claim(user model.User) (bool, string, error) {
	token, err := ClaimAccess(user)
	if err != nil {
		return false, "error while generate token", err
	}
	return true, token, nil
}
