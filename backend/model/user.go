package model

type User struct {
	ID       uint `gorm:"primaryKey"`
	Name     string
	Password string
	Email    string
	Role     string `gorm:"type:varchar(8);check:role IN ('admin','customer')"`
	Avatar   string

	// Categories            []Category
	// Products              []Product
	// ProductVariants       []ProductVariants
	// VariantOptions        []VariantOptions
	// ProductSpecifications []ProductSpecifications
	// SpecificationKeys     []SpecificationKeys
}
