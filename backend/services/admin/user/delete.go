package AdminUserService

import (
	DataAccess "backend/db"
	"backend/model"
	"strings"
)

// DeleteUser soft-deletes a user via the DeletedAt scope. Callers cannot
// delete themselves, admin callers may only delete customers, and the last
// active superadmin cannot be deleted.
func DeleteUser(id uint, actorEmail string) error {
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

	if target.Role == "superadmin" && target.IsActive {
		remaining, err := countOtherActiveSuperAdmins(db, target.ID)
		if err != nil {
			return err
		}
		if remaining == 0 {
			return ErrLastSuperAdmin
		}
	}

	result := db.Where("id = ?", id).Delete(&model.User{})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return ErrUserNotFound
	}

	return nil
}
