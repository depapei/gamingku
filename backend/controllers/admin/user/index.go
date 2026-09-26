package AdminUserController

import (
	"backend/helper"
	UserType "backend/helper/type/user"
	AdminUserService "backend/services/admin/user"
	"errors"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// writeUserError writes a failure envelope with a 404/409/403/400/500 split.
func writeUserError(c *gin.Context, err error) {
	if errors.Is(err, AdminUserService.ErrUserNotFound) || errors.Is(err, gorm.ErrRecordNotFound) {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "User not found"})
		return
	}
	if errors.Is(err, AdminUserService.ErrEmailConflict) {
		c.JSON(http.StatusConflict, gin.H{"success": false, "message": err.Error()})
		return
	}
	if errors.Is(err, AdminUserService.ErrForbidden) ||
		errors.Is(err, AdminUserService.ErrSelfModification) ||
		errors.Is(err, AdminUserService.ErrLastSuperAdmin) {
		c.JSON(http.StatusForbidden, gin.H{"success": false, "message": err.Error()})
		return
	}
	if errors.Is(err, AdminUserService.ErrIDMismatch) {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}
	lowered := strings.ToLower(err.Error())
	if strings.Contains(lowered, "invalid") ||
		strings.Contains(lowered, "required") ||
		strings.Contains(lowered, "does not match") ||
		strings.Contains(lowered, "at least") ||
		strings.Contains(lowered, "no valid fields") {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}
	c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": helper.ParseError(err)})
}

// parseUserID validates a numeric route id.
func parseUserID(c *gin.Context) (uint, bool) {
	raw := c.Param("id")
	id, err := strconv.ParseUint(raw, 10, 32)
	if err != nil || id == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid user id"})
		return 0, false
	}
	return uint(id), true
}

// actorEmail extracts the JWT identity for hierarchy checks.
func actorEmail(c *gin.Context) string {
	email, _ := c.Get("UserEmail")
	value, _ := email.(string)
	return value
}

// GetUsers handles GET /admin/user/ with search, filters, allowlisted sort and pagination.
func GetUsers(c *gin.Context) {
	page, err := strconv.Atoi(c.DefaultQuery("page", "1"))
	if err != nil || page < 1 {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid page"})
		return
	}
	limit, err := strconv.Atoi(c.DefaultQuery("limit", "10"))
	if err != nil || limit < 1 {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid limit"})
		return
	}

	role := c.DefaultQuery("role", "")
	if role != "" && role != "superadmin" && role != "admin" && role != "customer" {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid role"})
		return
	}

	var isActive *bool
	if raw := c.DefaultQuery("isActive", ""); raw != "" {
		parsed, err := strconv.ParseBool(raw)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid isActive"})
			return
		}
		isActive = &parsed
	}

	params := UserType.UserListParams{
		Search:   c.DefaultQuery("search", ""),
		Role:     role,
		IsActive: isActive,
		SortBy:   c.DefaultQuery("sortBy", ""),
		Sort:     c.DefaultQuery("sort", ""),
		Page:     page,
		Limit:    limit,
	}

	result, err := AdminUserService.GetUsers(params)
	if err != nil {
		writeUserError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    result.Data,
		"total":   result.Total,
		"page":    result.Page,
		"limit":   result.Limit,
	})
}

// GetUserByID handles GET /admin/user/:id.
func GetUserByID(c *gin.Context) {
	id, ok := parseUserID(c)
	if !ok {
		return
	}

	data, err := AdminUserService.GetUserByID(id)
	if err != nil {
		writeUserError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    data,
	})
}
