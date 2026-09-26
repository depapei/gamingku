package AdminUserService

import "errors"

// Sentinel errors for admin user operations. Controllers map these to
// 404 (not found), 409 (conflict), 403 (privilege) or 400 (validation).
var (
	// ErrUserNotFound is returned when a user id does not exist or is soft-deleted.
	ErrUserNotFound = errors.New("user not found")
	// ErrEmailConflict is returned when an email is already taken.
	ErrEmailConflict = errors.New("email already exists")
	// ErrForbidden is returned when the actor lacks privilege for the target.
	ErrForbidden = errors.New("access denied: insufficient privilege")
	// ErrLastSuperAdmin is returned when an operation would remove the last active superadmin.
	ErrLastSuperAdmin = errors.New("cannot modify the last active superadmin")
	// ErrSelfModification is returned when an actor targets itself for a destructive change.
	ErrSelfModification = errors.New("cannot modify your own account this way")
	// ErrIDMismatch is returned when the route id and body id disagree.
	ErrIDMismatch = errors.New("path id does not match body id")
)
