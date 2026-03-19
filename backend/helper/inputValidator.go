package helper

import (
	"errors"

	"github.com/go-playground/validator/v10"
)

type ErrorMessage struct {
	Field   string      `json:"field,omitempty"`
	Object  string      `json:"fieldObject,omitempty"`
	Message string      `json:"message,omitempty"`
	Tag     string      `json:"tag,omitempty"`
	Value   interface{} `json:"value,omitempty"`
}

func GetErrorMessage(fe validator.FieldError) string {
	switch fe.Tag() {
	case "required":
		return "this field is required"
	default:
		return "Unknown error"
	}
}

func Validate(err error) []ErrorMessage {
	var ve validator.ValidationErrors
	defaultError := make([]ErrorMessage, 1)
	if errors.As(err, &ve) {
		out := make([]ErrorMessage, len(ve))
		for i, fe := range ve {
			out[i] = ErrorMessage{
				Field:  fe.Field(),
				Object: fe.Namespace(),
				Tag:    fe.Tag(),
				Value:  fe.Value(),
			}
		}
		return out
	} else {
		defaultError[0] = ErrorMessage{
			Message: err.Error(),
		}
	}
	return defaultError
}
