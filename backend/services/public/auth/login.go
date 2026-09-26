package PubAuthService

import (
	DataAccess "backend/db"
	"backend/helper/jwt"
	"backend/helper/type/auth"
	"backend/model"
	"errors"
	"time"

	"golang.org/x/crypto/bcrypt"
)

// ErrInactive is returned when valid credentials belong to a deactivated user.
var ErrInactive = errors.New("user is inactive")

// LoginResult carries the issued session: short-lived access token,
// opaque refresh token (plaintext, cookie-bound) and the authenticated user.
type LoginResult struct {
	AccessToken  string
	RefreshToken string
	User         model.User
}

// Login verifies credentials, rejects inactive users, mints a short-lived
// access token and persists a hashed opaque refresh session (7d expiry).
// Only the refresh hash is stored; the plaintext is returned once for the
// httpOnly cookie.
func Login(input auth.LoginInput) (LoginResult, error) {
	var user model.User

	raw := DataAccess.DB

	if err := raw.First(&user, "email = ?", input.Email).Error; err != nil {
		return LoginResult{}, err
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
		return LoginResult{}, err
	}

	if !user.IsActive {
		return LoginResult{}, ErrInactive
	}

	access, err := jwt.ClaimAccess(user)
	if err != nil {
		return LoginResult{}, err
	}

	opaque, hash, err := jwt.GenerateRefreshToken()
	if err != nil {
		return LoginResult{}, err
	}

	row := model.RefreshToken{
		UserID:    user.ID,
		TokenHash: hash,
		ExpiresAt: time.Now().Add(jwt.RefreshTTL()),
	}
	if err := raw.Create(&row).Error; err != nil {
		return LoginResult{}, err
	}

	return LoginResult{AccessToken: access, RefreshToken: opaque, User: user}, nil
}
