package Category

import "backend/helper/type/user"

type ResCategory struct {
	ID          uint    `json:"id"`
	Image       string  `json:"image" binding:"required"`
	Name        string  `json:"name" binding:"required"`
	ParentId    *int    `json:"parentId,omitempty"`
	Slug        *string `json:"slug,omitempty" binding:"required"`
	CreatedById int     `json:"createdBy" binding:"required"`

	CreatedBy user.UserInfo `json:"createdByUser"`
	Childs    []*CategoryChild `json:"childs,omitempty"`
}

type UpdateCategory struct {
	ID          uint    `json:"id" binding:"required"`
	Image       string  `json:"image" binding:"required"`
	Name        string  `json:"name" binding:"required"`
	ParentId    *int    `json:"parentId,omitempty"`
	Slug        *string `json:"slug,omitempty" binding:"required"`
	CreatedById int     `json:"createdBy" binding:"required"`

	CreatedBy user.UserInfo `json:"createdByUser"`
	Childs    []*CategoryChild `json:"childs,omitempty"`
}

type CategoryChild struct {
	ID    uint   `json:"id" binding:"required"`
	Name  string `json:"name" binding:"required"`
	Image string `json:"image" binding:"required"`
}
