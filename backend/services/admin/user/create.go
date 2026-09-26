package AdminUserService

import (
	DataAccess "backend/db"
	UserType "backend/helper/type/user"
	"backend/model"
	"errors"
	"strings"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// CreateUser creates a user on behalf of an admin caller. The requested role
// defaults to customer; admin actors may only create customers while only a
// superadmin actor may assign the admin or superadmin role.
func CreateUser(input UserType.CreateUserInput, actorEmail string) error {
	db := DataAccess.DB

	name := strings.TrimSpace(input.Name)
	email := strings.TrimSpace(input.Email)
	if name == "" || email == "" || strings.TrimSpace(input.Password) == "" {
		return errors.New("name, email and password are required")
	}

	actor, err := resolveActor(db, actorEmail)
	if err != nil {
		return err
	}

	role := strings.TrimSpace(input.Role)
	if role == "" {
		role = "customer"
	}
	if !roleAllowlist[role] {
		return errors.New("invalid role: must be one of superadmin, admin, customer")
	}
	if role != "customer" && actor.Role != "superadmin" {
		return ErrForbidden
	}

	var existing model.User
	if err := db.Where("email = ?", email).First(&existing).Error; err == nil {
		return ErrEmailConflict
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		return err
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	isActive := true
	if input.IsActive != nil {
		isActive = *input.IsActive
	}

	newUser := model.User{
		Name:     name,
		Email:    email,
		Password: string(hashed),
		Role:     role,
		IsActive: isActive,
		Avatar:   strings.TrimSpace(input.Avatar),
	}

	if err := db.Create(&newUser).Error; err != nil {
		if isDuplicateKey(err) {
			return ErrEmailConflict
		}
		return err
	}

	return nil
}
