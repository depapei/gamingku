package user

type UserInfo struct {
	Name     string `json:"name" binding:"required"`
	Email    string `json:"email" binding:"required"`
	Role     string `json:"role" binding:"required"`
	IsActive bool   `json:"isActive" binding:"required"`
	Avatar   string `json:"avatar,omitempty"`
}
