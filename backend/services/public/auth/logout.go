package PubAuthService

import (
	DataAccess "backend/db"
	"backend/helper/jwt"
	"backend/model"
	"time"
)

// Logout revokes the presented refresh token if any. Empty input and unknown
// tokens are no-ops so logout stays idempotent.
func Logout(opaque string) error {
	if opaque == "" {
		return nil
	}
	hash := jwt.HashRefreshToken(opaque)
	now := time.Now()
	return DataAccess.DB.Model(&model.RefreshToken{}).
		Where("token_hash = ? AND revoked_at IS NULL", hash).
		Update("revoked_at", now).Error
}
