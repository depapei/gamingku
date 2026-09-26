package AdminUserService

import (
	DataAccess "backend/db"
	UserType "backend/helper/type/user"
)

// GetUserByID returns a single user response for an admin detail view.
func GetUserByID(id uint) (UserType.UserResponse, error) {
	target, err := loadTarget(DataAccess.DB, id)
	if err != nil {
		return UserType.UserResponse{}, err
	}
	return MapUserToResponse(target), nil
}
