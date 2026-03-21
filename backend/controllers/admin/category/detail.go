package AdminCategoryController

import (
	"backend/helper"
	AdminCategoryService "backend/services/admin/category"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetDetail(c *gin.Context){
	id := c.Param("id")

	data, err := AdminCategoryService.GetDetail(id); if err != nil {
		message := helper.ParseError(err)
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": message,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": data,
	})
}