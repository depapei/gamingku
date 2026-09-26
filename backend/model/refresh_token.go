package model

import "time"

// RefreshToken persists one opaque refresh-token session.
//
// Only the SHA-256 hex hash of the opaque token is stored (never the
// plaintext). Each use rotates the token: the old row is marked revoked with
// ReplacedByHash pointing at its successor. Presenting an already-rotated
// token is treated as suspected theft and revokes the whole family.
type RefreshToken struct {
	ID             uint       `gorm:"primaryKey"`
	UserID         uint       `gorm:"not null;index;constraint:OnDelete:CASCADE" json:"user_id"`
	User           User       `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE"`
	TokenHash      string     `gorm:"size:64;uniqueIndex;not null" json:"-"`
	ExpiresAt      time.Time  `gorm:"not null;index" json:"expires_at"`
	RevokedAt      *time.Time `json:"revoked_at,omitempty"`
	ReplacedByHash *string    `gorm:"size:64" json:"-"`
	CreatedAt      time.Time  `json:"created_at"`
}
