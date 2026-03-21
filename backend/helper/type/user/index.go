package user

type UserInfo struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Role     string `json:"role"`
	IsActive bool   `json:"isActive`
	Avatar   string `json:"avatar"`
}
