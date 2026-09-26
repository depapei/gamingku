package jwt

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"os"
	"strconv"
	"time"
)

// refreshTTL returns how long refresh-token sessions live.
// Assumption: REFRESH_TOKEN_TTL_DAYS env overrides the 7-day default.
func refreshTTL() time.Duration {
	if v := os.Getenv("REFRESH_TOKEN_TTL_DAYS"); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n > 0 {
			return time.Duration(n) * 24 * time.Hour
		}
	}
	return 7 * 24 * time.Hour
}

// RefreshTTL exposes the refresh-token lifetime for services/controllers
// (expiry timestamps and cookie MaxAge) without duplicating env parsing.
func RefreshTTL() time.Duration {
	return refreshTTL()
}

// HashRefreshToken returns the hex SHA-256 of a presented opaque token.
// Only hashes are stored/looked up in Postgres; the opaque value itself
// never touches the database.
func HashRefreshToken(opaque string) string {
	sum := sha256.Sum256([]byte(opaque))
	return hex.EncodeToString(sum[:])
}

// GenerateRefreshToken creates a 256-bit opaque token and its storage hash.
// The opaque value goes to the httpOnly cookie; the hash goes to Postgres.
func GenerateRefreshToken() (token string, hash string, err error) {
	var buf [32]byte
	if _, err := rand.Read(buf[:]); err != nil {
		return "", "", err
	}
	token = base64.RawURLEncoding.EncodeToString(buf[:])
	return token, HashRefreshToken(token), nil
}
