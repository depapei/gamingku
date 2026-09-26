package AdminDashboardController

import (
	AdminDashboardService "backend/services/admin/dashboard"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

// GetSummary handles GET /admin/dashboard/summary.
// It returns the aggregated admin overview payload in the standard success envelope.
func GetSummary(c *gin.Context) {
	_, _ = c.Get("UserID")
	_, _ = c.Get("UserRole")

	summary, err := AdminDashboardService.GetSummary(c.Request.Context())
	if err != nil {
		log.Println("dashboard summary error:", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"code":    "DASHBOARD_ERROR",
			"message": "Failed to load dashboard summary",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    summary,
	})
}
