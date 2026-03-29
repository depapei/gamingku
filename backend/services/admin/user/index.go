package AdminUserService

import (
	DataAccess "backend/db"
	UserType "backend/helper/type/user"
	"backend/model"
	"strconv"
)

func GetUsers(search string, sortBy string, sort string, limit string) ([]UserType.UserInfo, error) {
	var response []UserType.UserInfo
	var users []model.User

	raw := DataAccess.DB

	if len(search) > 0 {
		searchPattern := "%" + search + "%"
		raw = raw.Where("LOWER(name) LIKE LOWER(?)", searchPattern)
	}

	if len(sortBy) > 0 && len(sort) > 0 {
		switch sortBy {
		case "arrival":
			raw = raw.Order("created_at ASC")
		default:
			sortByPattern := sortBy + " " + sort
			raw = raw.Order(sortByPattern)
		}
	} else {
		raw = raw.Order("name ASC")
	}

	if len(limit) > 0 {
		intLimit, err := strconv.ParseInt(limit, 0, 64)
		if err != nil {
			return response, err
		}
		if intLimit >= 50 {
			raw = raw.Limit(50)
		} else {
			raw = raw.Limit(int(intLimit))
		}
	} else {
		raw = raw.Limit(20)
	}

	err := raw.Find(&users).Error

	for _, user := range users {
		response = append(response, UserType.UserInfo{
			Name:     user.Name,
			Email:    user.Email,
			Role:     user.Role,
			IsActive: user.IsActive,
			Avatar:   user.Avatar,
		})
	}

	return response, err
}
