package AdminUserService

import (
	DataAccess "backend/db"
	UserType "backend/helper/type/user"
	"backend/model"
	"errors"
	"strings"

	"golang.org/x/crypto/bcrypt"
)

// ResetUserPassword replaces a user's password with a bcrypt hash of the new
// value. Admin callers may only reset customer passwords; superadmins may
// reset any row. The password is never returned in any response.
func ResetUserPassword(id uint, input UserType.ResetPasswordInput, actorEmail string) error {
	if len(strings.TrimSpace(input.Password)) < 8 {
		return errors.New("password must be at least 8 characters")
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

	hashed, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	result := db.Model(&model.User{}).Where("id = ?", id).Update("password", string(hashed))
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return ErrUserNotFound
	}

	return nil
}
