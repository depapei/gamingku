package AdminUserService

import (
	DataAccess "backend/db"
	UserType "backend/helper/type/user"
	"backend/model"
	"errors"
	"strings"

	"gorm.io/gorm"
)

// UpdateUser updates exactly one user row. The id argument (from the route)
// is the source of truth; a mismatched body id is rejected. Admin callers may
// only edit customer rows and may only assign the customer role; demoting the
// last active superadmin or one's own role is forbidden.
func UpdateUser(id uint, input UserType.UpdateUserInput, actorEmail string) error {
	if input.ID != 0 && input.ID != id {
		return ErrIDMismatch
	}

	db := DataAccess.DB

	target, err := loadTarget(db, id)
	if err != nil {
		return err
	}

	actor, err := resolveActor(db, actorEmail)
	if err != nil {
		return err
	}

	if err := requireCustomerTarget(actor, target); err != nil {
		return err
	}

	role := strings.TrimSpace(input.Role)
	if role != "" {
		if !roleAllowlist[role] {
			return errors.New("invalid role: must be one of superadmin, admin, customer")
		}
		if role != "customer" && actor.Role != "superadmin" {
			return ErrForbidden
		}
		if role != target.Role && strings.EqualFold(actor.Email, target.Email) {
			return ErrSelfModification
		}
		if target.Role == "superadmin" && role != "superadmin" && target.IsActive {
			remaining, err := countOtherActiveSuperAdmins(db, target.ID)
			if err != nil {
				return err
			}
			if remaining == 0 {
				return ErrLastSuperAdmin
			}
		}
	}

	updates := map[string]interface{}{}
	if strings.TrimSpace(input.Name) != "" {
		updates["name"] = strings.TrimSpace(input.Name)
	}
	if strings.TrimSpace(input.Email) != "" {
		email := strings.TrimSpace(input.Email)
		var clash model.User
		if err := db.Where("email = ? AND id <> ?", email, id).First(&clash).Error; err == nil {
			return ErrEmailConflict
		} else if !errors.Is(err, gorm.ErrRecordNotFound) {
			return err
		}
		updates["email"] = email
	}
	if input.Avatar != "" {
		updates["avatar"] = strings.TrimSpace(input.Avatar)
	}
	if role != "" {
		updates["role"] = role
	}
	if len(updates) == 0 {
		return errors.New("no valid fields to update")
	}

	if err := db.Model(&model.User{}).Where("id = ?", id).Updates(updates).Error; err != nil {
		if isDuplicateKey(err) {
			return ErrEmailConflict
		}
		return err
	}

	return nil
}
