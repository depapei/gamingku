package AdminUserService

import (
	DataAccess "backend/db"
	"backend/model"
	"strings"
)

// UpdateUserStatus activates or deactivates exactly one user. Callers cannot
// change their own status, admin callers may only target customers, and the
// last active superadmin cannot be deactivated.
func UpdateUserStatus(id uint, isActive bool, actorEmail string) error {
	db := DataAccess.DB

	target, err := loadTarget(db, id)
	if err != nil {
		return err
	}

	actor, err := resolveActor(db, actorEmail)
	if err != nil {
		return err
	}

	if strings.EqualFold(strings.TrimSpace(actor.Email), strings.TrimSpace(target.Email)) {
		return ErrSelfModification
	}

	if err := requireCustomerTarget(actor, target); err != nil {
		return err
	}

	if !isActive && target.Role == "superadmin" && target.IsActive {
		remaining, err := countOtherActiveSuperAdmins(db, target.ID)
		if err != nil {
			return err
		}
		if remaining == 0 {
			return ErrLastSuperAdmin
		}
	}

	result := db.Model(&model.User{}).Where("id = ?", id).Update("is_active", isActive)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return ErrUserNotFound
	}

	return nil
}
