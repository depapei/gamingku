package AdminProductService

import "errors"

// Sentinel errors for product operations. Controllers map these to
// 404 (not found), 409 (conflict) or 400 (validation) responses.
var (
	// ErrProductNotFound is returned when a product slug does not exist.
	ErrProductNotFound = errors.New("product not found")
	// ErrProductSlugConflict is returned when a slug is already taken.
	ErrProductSlugConflict = errors.New("product slug already exists")
	// ErrProductCategoryNotFound is returned when the referenced category does not exist.
	ErrProductCategoryNotFound = errors.New("product category not found")
	// ErrProductCreatorNotFound is returned when the creator identity cannot be resolved.
	ErrProductCreatorNotFound = errors.New("product creator not found")
	// ErrProductSlugMismatch is returned when the route slug and body slug disagree.
	ErrProductSlugMismatch = errors.New("path slug does not match body slug")
)
