package helper

import (
	"errors"
	"strings"

	"gorm.io/gorm"
)

func ParseError(err error) string {
	if err == nil {
		return ""
	}

	if errors.Is(err, gorm.ErrRecordNotFound) {
		return "Data not found"
	}

	if strings.Contains(err.Error(), "invalid input syntax") {
		return "Invalid input format"
	}

	if strings.Contains(err.Error(), "duplicate key") {
		return "Data already exists"
	}

	return "Internal server error"
}