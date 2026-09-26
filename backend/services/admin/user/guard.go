package AdminUserService

import (
	"backend/model"
	"errors"
	"strings"

	"gorm.io/gorm"
)

// resolveActor loads the calling user by JWT email. Unknown or missing
// identities fail closed with ErrForbidden; hierarchy checks stay server-side.
func resolveActor(db *gorm.DB, actorEmail string) (model.User, error) {
	trimmed := strings.TrimSpace(actorEmail)
	if trimmed == "" {
		return model.User{}, ErrForbidden
	}
	var actor model.User
	if err := db.Where("email = ?", trimmed).First(&actor).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.User{}, ErrForbidden
		}
		return model.User{}, err
	}
	return actor, nil
}

// loadTarget loads a user row by id, mapping missing rows to ErrUserNotFound.
func loadTarget(db *gorm.DB, id uint) (model.User, error) {
	var target model.User
	if err := db.First(&target, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.User{}, ErrUserNotFound
		}
		return model.User{}, err
	}
	return target, nil
}

// countOtherActiveSuperAdmins counts active superadmins excluding one id.
func countOtherActiveSuperAdmins(db *gorm.DB, excludeID uint) (int64, error) {
	var count int64
	if err := db.Model(&model.User{}).
		Where("role = ? AND is_active = ? AND id <> ?", "superadmin", true, excludeID).
		Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}

// requireCustomerTarget rejects admin actors touching non-customer rows.
func requireCustomerTarget(actor, target model.User) error {
	if actor.Role == "admin" && target.Role != "customer" {
		return ErrForbidden
	}
	return nil
}

// isDuplicateKey reports Postgres/duplicate-key persistence errors.
func isDuplicateKey(err error) bool {
	if err == nil {
		return false
	}
	return strings.Contains(strings.ToLower(err.Error()), "duplicate")
}
