package AdminCategoryController

import (
	"backend/helper"
	Category "backend/helper/type/category"
	AdminCategoryService "backend/services/admin/category"
	"errors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// writeCategoryError writes a failure envelope with a 404/409/400/500 split.
func writeCategoryError(c *gin.Context, err error) {
	if errors.Is(err, AdminCategoryService.ErrCategoryNotFound) || errors.Is(err, gorm.ErrRecordNotFound) {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "Category not found"})
		return
	}
	if errors.Is(err, AdminCategoryService.ErrSlugConflict) ||
		errors.Is(err, AdminCategoryService.ErrCategoryHasChildren) ||
		errors.Is(err, AdminCategoryService.ErrCategoryHasProducts) {
		c.JSON(http.StatusConflict, gin.H{"success": false, "message": helper.ParseError(err)})
		return
	}
	if errors.Is(err, AdminCategoryService.ErrParentNotFound) ||
		errors.Is(err, AdminCategoryService.ErrInvalidParent) ||
		errors.Is(err, AdminCategoryService.ErrCreatorNotFound) ||
		errors.Is(err, AdminCategoryService.ErrIDMismatch) {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}
	c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": helper.ParseError(err)})
}

// parseCategoryID validates a numeric route id.
func parseCategoryID(c *gin.Context) (uint, bool) {
	raw := c.Param("id")
	id, err := strconv.ParseUint(raw, 10, 32)
	if err != nil || id == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid category id"})
		return 0, false
	}
	return uint(id), true
}

// GetCategories handles GET /admin/category/ with search, allowlisted sort and pagination.
func GetCategories(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	params := Category.CategoryListParams{
		Search: c.DefaultQuery("search", ""),
		SortBy: c.DefaultQuery("sortBy", ""),
		Sort:   c.DefaultQuery("sort", ""),
		Page:   page,
		Limit:  limit,
	}

	result, err := AdminCategoryService.GetCategories(params)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": helper.ParseError(err),
		})
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
