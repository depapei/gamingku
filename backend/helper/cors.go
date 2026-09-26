package helper

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

// Cors builds the gin CORS middleware with explicit origins and credentials
// so the httpOnly refresh cookie flows cross-origin (AllowAllOrigins cannot
// combine with AllowCredentials).
func Cors() gin.HandlerFunc {
	return cors.New(cors.Config{
		AllowOrigins:     FrontendOrigins(),
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Timezone", "User", "X-Telegram-Auth-Date", "X-Telegram-Hash", "X-Telegram-Init-Data", "Service-Token", "Content-Type", "Content-Length", "Accept-Encoding", "X-CSRF-Token", "Authorization", "Accept", "Origin", "Cache-Control", "X-Requested-With"},
		AllowCredentials: true,
		ExposeHeaders:    []string{"Total-records", "Content-disposition"},
	})
}
