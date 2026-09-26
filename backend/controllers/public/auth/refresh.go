package PubAuthController

import (
	"backend/helper"
	PubAuthService "backend/services/public/auth"
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
)

// refreshBody is the non-cookie fallback for clients that cannot send
// httpOnly cookies (e.g. native apps). Cookie remains the preferred source.
type refreshBody struct {
	RefreshToken string `json:"refreshToken"`
}

// Refresh rotates the presented refresh token and returns a new access
// token pair. Cookie preferred, JSON body fallback.
func Refresh(c *gin.Context) {
	opaque, err := c.Cookie(helper.RefreshCookieName)
	if err != nil || opaque == "" {
		var body refreshBody
		if bErr := c.ShouldBindJSON(&body); bErr == nil {
			opaque = body.RefreshToken
		}
	}
	if opaque == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"code":    "INVALID_REFRESH",
			"message": "Missing refresh token",
		})
		return
	}

	result, err := PubAuthService.Refresh(opaque)
	if err != nil {
		if errors.Is(err, PubAuthService.ErrReuseDetected) {
			helper.ClearRefreshCookie(c)
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"code":    "INVALID_REFRESH",
				"message": "Refresh token reuse detected",
			})
			return
		}
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"code":    "INVALID_REFRESH",
			"message": "Invalid refresh token",
		})
		return
	}

	helper.SetRefreshCookie(c, result.RefreshToken, helper.RefreshCookieMaxAge)
	c.JSON(http.StatusOK, gin.H{
		"success":     true,
		"accessToken": result.AccessToken,
	})
}
