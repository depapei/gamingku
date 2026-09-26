package helper

import (
	"errors"
	"log"
	"strings"

	"gorm.io/gorm"
)

// ParseError maps a persistence error to a human-readable message.
func ParseError(err error) string {
	if err == nil {
		return ""
	}
	log.Println(err.Error())

	if errors.Is(err, gorm.ErrRecordNotFound) {
		return "Data not found"
	}

	lowered := strings.ToLower(err.Error())
	switch {
	case strings.Contains(lowered, "category not found"),
		strings.Contains(lowered, "product not found"):
		return "Data not found"
	case strings.Contains(lowered, "already exists"),
		strings.Contains(lowered, "duplicate key"),
		strings.Contains(lowered, "duplicate entry"):
		return "Data already exists"
	case strings.Contains(lowered, "has child"),
		strings.Contains(lowered, "has associated products"):
		return err.Error()
	case strings.Contains(lowered, "invalid input syntax"),
		strings.Contains(lowered, "invalid input format"),
		strings.Contains(lowered, "invalid parent"),
		strings.Contains(lowered, "parent category not found"),
		strings.Contains(lowered, "does not match"),
		strings.Contains(lowered, "are required"):
		return err.Error()
	default:
		return "Internal server error"
	}
}

// StatusForCategoryError maps known category sentinel errors to HTTP codes.
func StatusForCategoryError(err error) int {
	if err == nil {
		return 200
	}
	lowered := strings.ToLower(err.Error())
	switch {
	case strings.Contains(lowered, "category not found"),
		strings.Contains(lowered, "product not found"):
		return 404
	case strings.Contains(lowered, "already exists"),
		strings.Contains(lowered, "has child"),
		strings.Contains(lowered, "has associated products"):
		return 409
	case strings.Contains(lowered, "invalid"),
		strings.Contains(lowered, "not found"),
		strings.Contains(lowered, "does not match"),
		strings.Contains(lowered, "are required"):
		return 400
	default:
		return 500
	}
}

// StatusForProductError maps known product sentinel errors to HTTP codes.
func StatusForProductError(err error) int {
	if err == nil {
		return 200
	}
	lowered := strings.ToLower(err.Error())
	switch {
	case strings.Contains(lowered, "product not found"):
		return 404
	case strings.Contains(lowered, "already exists"):
		return 409
	case strings.Contains(lowered, "invalid"),
		strings.Contains(lowered, "not found"),
		strings.Contains(lowered, "does not match"),
		strings.Contains(lowered, "are required"):
		return 400
	default:
		return 500
	}
}
