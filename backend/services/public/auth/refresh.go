package PubAuthService

import (
	DataAccess "backend/db"
	"backend/helper/jwt"
	"backend/model"
	"errors"
	"time"

	"gorm.io/gorm"
)

// ErrInvalidRefresh is returned for missing, unknown or expired tokens.
var ErrInvalidRefresh = errors.New("invalid refresh token")

// ErrReuseDetected is returned when an already-rotated token is presented;
// the whole token family is revoked as suspected theft.
var ErrReuseDetected = errors.New("refresh token reuse detected")

// RefreshResult carries the rotated session pair.
type RefreshResult struct {
	AccessToken  string
	RefreshToken string
}

// Refresh validates an opaque refresh token, rotates it (revoke old, issue
// successor) and mints a fresh access token. Reuse of a rotated token
// revokes all of the user's active sessions.
func Refresh(opaque string) (RefreshResult, error) {
	if opaque == "" {
		return RefreshResult{}, ErrInvalidRefresh
	}
	hash := jwt.HashRefreshToken(opaque)

	var row model.RefreshToken
	if err := DataAccess.DB.First(&row, "token_hash = ?", hash).Error; err != nil {
		return RefreshResult{}, ErrInvalidRefresh
	}

	if row.RevokedAt != nil {
		now := time.Now()
		_ = DataAccess.DB.Model(&model.RefreshToken{}).
			Where("user_id = ? AND revoked_at IS NULL", row.UserID).
			Update("revoked_at", now).Error
		return RefreshResult{}, ErrReuseDetected
	}

	if time.Now().After(row.ExpiresAt) {
		return RefreshResult{}, ErrInvalidRefresh
	}

	var user model.User
	if err := DataAccess.DB.First(&user, row.UserID).Error; err != nil {
		return RefreshResult{}, ErrInvalidRefresh
	}

	newOpaque, newHash, err := jwt.GenerateRefreshToken()
	if err != nil {
		return RefreshResult{}, err
	}

	access, err := jwt.ClaimAccess(user)
	if err != nil {
		return RefreshResult{}, err
	}

	now := time.Now()
	err = DataAccess.DB.Transaction(func(tx *gorm.DB) error {
		updates := map[string]interface{}{
			"revoked_at":       now,
			"replaced_by_hash": newHash,
		}
		if err := tx.Model(&model.RefreshToken{}).Where("id = ?", row.ID).Updates(updates).Error; err != nil {
			return err
		}
		successor := model.RefreshToken{
			UserID:    row.UserID,
			TokenHash: newHash,
			ExpiresAt: now.Add(jwt.RefreshTTL()),
		}
		if err := tx.Create(&successor).Error; err != nil {
			return err
		}
		// Opportunistic cleanup of the user's expired sessions.
		_ = tx.Where("user_id = ? AND expires_at < ?", row.UserID, now).Delete(&model.RefreshToken{}).Error
		return nil
	})
	if err != nil {
		return RefreshResult{}, err
	}

	return RefreshResult{AccessToken: access, RefreshToken: newOpaque}, nil
}
