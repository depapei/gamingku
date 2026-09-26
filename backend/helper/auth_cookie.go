package helper

import (
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
)

// RefreshCookieName is the httpOnly cookie carrying the opaque refresh token.
const RefreshCookieName = "refreshToken"

// RefreshCookieMaxAge is the cookie lifetime in seconds (7 days).
// It mirrors the server-side refresh TTL default; the DB expiry is the
// source of truth, the cookie age is a UX hint.
const RefreshCookieMaxAge = 604800

// IsProd reports whether the app runs in production.
// Assumption: any APP_ENV other than "production" (including unset) is dev,
// so the refresh cookie is Secure only in production for local http testing.
func IsProd() bool {
	return os.Getenv("APP_ENV") == "production"
}

// FrontendOrigins returns explicit CORS origins for credentialed requests.
// Assumption: FRONTEND_URL may hold one origin or a comma-separated list;
// default covers local Vite dev.
func FrontendOrigins() []string {
	raw := strings.TrimSpace(os.Getenv("FRONTEND_URL"))
	if raw == "" {
		return []string{"http://localhost:3000"}
	}
	parts := strings.Split(raw, ",")
	origins := make([]string, 0, len(parts))
	for _, p := range parts {
		if p = strings.TrimSpace(p); p != "" {
			origins = append(origins, p)
		}
	}
	if len(origins) == 0 {
		return []string{"http://localhost:3000"}
	}
	return origins
}

// SetRefreshCookie writes the opaque refresh token as an httpOnly cookie.
func SetRefreshCookie(c *gin.Context, opaque string, maxAge int) {
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie(RefreshCookieName, opaque, maxAge, "/", "", IsProd(), true)
}

// ClearRefreshCookie removes the refresh cookie (logout / reuse detected).
func ClearRefreshCookie(c *gin.Context) {
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie(RefreshCookieName, "", -1, "/", "", IsProd(), true)
}
