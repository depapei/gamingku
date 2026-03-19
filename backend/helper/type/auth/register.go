package auth

type RegisterInput struct {
	Name     string `json:"name" binding:"required,min=3"`
	Password string `json:"password" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Avatar   string `json:"avatar,omitempty"`
}
