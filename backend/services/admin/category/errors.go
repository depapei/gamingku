package AdminCategoryService

import "errors"

// Sentinel errors for category operations. Controllers map these to
// 404 (not found), 409 (conflict) or 400 (validation) responses.
var (
	// ErrCategoryNotFound is returned when a category id does not exist.
	ErrCategoryNotFound = errors.New("category not found")
	// ErrSlugConflict is returned when a slug is already taken.
	ErrSlugConflict = errors.New("category slug already exists")
	// ErrParentNotFound is returned when the referenced parent id does not exist.
	ErrParentNotFound = errors.New("parent category not found")
	// ErrInvalidParent is returned when parentId is self-referential or cyclic.
	ErrInvalidParent = errors.New("invalid parent category")
	// ErrCategoryHasChildren is returned when deleting a category with children.
	ErrCategoryHasChildren = errors.New("category has child categories")
	// ErrCategoryHasProducts is returned when deleting a category with products.
	ErrCategoryHasProducts = errors.New("category has associated products")
	// ErrCreatorNotFound is returned when the creator identity cannot be resolved.
	ErrCreatorNotFound = errors.New("category creator not found")
	// ErrIDMismatch is returned when the route id and body id disagree.
	ErrIDMismatch = errors.New("path id does not match body id")
)
