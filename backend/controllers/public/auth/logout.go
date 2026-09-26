package PubAuthController

import (
	"backend/helper"
	PubAuthService "backend/services/public/auth"
	"net/http"

	"github.com/gin-gonic/gin"
)

// logoutBody mirrors the refresh fallback for non-cookie clients.
type logoutBody struct {
	RefreshToken string `json:"refreshToken"`
}

// Logout revokes the presented refresh token and clears the cookie.
// Always 200 (idempotent), even when no token was sent.
func Logout(c *gin.Context) {
	opaque, err := c.Cookie(helper.RefreshCookieName)
	if err != nil || opaque == "" {
		var body logoutBody
		if bErr := c.ShouldBindJSON(&body); bErr == nil {
			opaque = body.RefreshToken
		}
	}

	_ = PubAuthService.Logout(opaque)
	helper.ClearRefreshCookie(c)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Successfully logout",
	})
}
