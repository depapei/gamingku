import { Controller, useForm } from "react-hook-form";
import type { UseFormReset } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useMemo } from "react";
import * as yup from "yup";
import { Button, Form, Input, Select, Switch } from "antd";
import type { User, UserRole } from "../../types/user";

/** Props for the admin user form. */
export interface AdminUserFormProps {
  /** Submit handler receiving validated values. */
  onSubmit: (data: UserFormValues) => void;
  /** Existing values when editing. */
  initialData?: Partial<User> | null;
  /** "create" shows password fields; "edit" omits them. */
  mode: "create" | "edit";
  /** Role options the caller may assign (Admin sees customer only). */
  allowedRoles: UserRole[];
  /** Disables the submit button while a mutation is pending. */
  submitting?: boolean;
  /** Server-side conflict error (e.g. duplicate email after a 409) mapped to the email field. */
  formError?: { field: "email"; message: string } | null;
}

/**
 * Reports whether a value is an absolute URL.
 * @param value raw input
 * @returns true when empty or a parseable http(s) URL
 */
const isUrlOrEmpty = (value: string | undefined): boolean => {
  if (!value) return true;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

/**
 * Builds the user validation schema: name min 2, email, password min 8
 * (create-only, optional on edit), role one of the caller-allowed roles.
 * Password rules apply in create mode only; the shape is identical in both
 * modes so the inferred values type stays a single object type.
 * @param mode create or edit
 * @param allowedRoles roles the caller may assign
 * @returns yup object schema for the form
 */
const buildValidationSchema = (mode: "create" | "edit", allowedRoles: UserRole[]) =>
  yup.object({
    name: yup
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .required("Name is required"),
    email: yup
      .string()
      .trim()
      .email("Enter a valid email")
      .required("Email is required"),
    password: yup
      .string()
      .test(
        "pw-required",
        "Password is required",
        (value) => mode !== "create" || !!value,
      )
      .test(
        "pw-min",
        "Password must be at least 8 characters",
        (value) => mode !== "create" || !value || value.length >= 8,
      ),
    confirmPassword: yup
      .string()
      .test(
        "cp-required",
        "Confirm your password",
        (value) => mode !== "create" || !!value,
      )
      .test("cp-match", "Passwords must match", (value, context) => {
        if (mode !== "create") return true;
        const parent = context?.parent as { password?: string } | undefined;
        return value === parent?.password;
      }),
    role: yup
      .mixed<UserRole>()
      .oneOf(allowedRoles, "Select a valid role")
      .required("Role is required"),
    isActive: yup.boolean().required(),
    avatar: yup
      .string()
      .trim()
      .optional()
      .test("avatar-url", "Avatar must be a valid URL", isUrlOrEmpty),
  });

/** Values submitted by the admin user form, inferred from the schema. */
export type UserFormValues = yup.InferType<ReturnType<typeof buildValidationSchema>>;

/**
 * User create/edit form with validation mirroring the backend rules.
 * @param props form props
 * @returns user form element
 */
export const AdminUserForm = ({
  onSubmit,
  initialData,
  mode,
  allowedRoles,
  submitting = false,
  formError = null,
}: AdminUserFormProps) => {
  const roles =
    allowedRoles.length > 0 ? allowedRoles : (["customer"] as UserRole[]);

  const schema = useMemo(
    () => buildValidationSchema(mode, roles),
    [mode, roles],
  );

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: yupResolver(schema),
    mode: "onTouched",
    defaultValues: {
      name: initialData?.name ?? "",
      email: initialData?.email ?? "",
      password: "",
      confirmPassword: "",
      role: initialData?.role ?? roles[0],
      isActive: initialData?.isActive ?? true,
      avatar: initialData?.avatar ?? "",
    },
  });

  useEffect(() => {
    if (formError) {
      setError(formError.field, { message: formError.message });
    }
  }, [formError, setError]);

  useUserFormReset(initialData, roles, reset);

  return (
    <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <Form.Item
            label="Name"
            validateStatus={errors.name ? "error" : ""}
            help={errors.name?.message}
          >
            <Input {...field} placeholder="Jane Doe" disabled={submitting} />
          </Form.Item>
        )}
      />

      <Controller
        name="email"
        control={control}
        render={({ field }) => (
          <Form.Item
            label="Email"
            validateStatus={errors.email ? "error" : ""}
            help={errors.email?.message}
            extra={
              mode === "edit"
                ? "Email cannot be changed after creation."
                : undefined
            }
          >
            <Input
              {...field}
              type="email"
              placeholder="jane@example.com"
              disabled={mode === "edit" || submitting}
            />
          </Form.Item>
        )}
      />

      {mode === "create" && (
        <>
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <Form.Item
                label="Password"
                validateStatus={errors.password ? "error" : ""}
                help={errors.password?.message}
              >
                <Input.Password
                  {...field}
                  placeholder="Minimum 8 characters"
                  autoComplete="new-password"
                  disabled={submitting}
                />
              </Form.Item>
            )}
          />

          <Controller
            name="confirmPassword"
            control={control}
            render={({ field }) => (
              <Form.Item
                label="Confirm password"
                validateStatus={errors.confirmPassword ? "error" : ""}
                help={errors.confirmPassword?.message}
              >
                <Input.Password
                  {...field}
                  placeholder="Repeat the password"
                  autoComplete="new-password"
                  disabled={submitting}
                />
              </Form.Item>
            )}
          />
        </>
      )}

      <Controller
        name="role"
        control={control}
        render={({ field }) => (
          <Form.Item
            label="Role"
            validateStatus={errors.role ? "error" : ""}
            help={errors.role?.message}
          >
            <Select
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              disabled={submitting}
              className="w-full"
              options={roles.map((role) => ({ label: role, value: role }))}
            />
          </Form.Item>
        )}
      />

      <Controller
        name="isActive"
        control={control}
        render={({ field }) => (
          <Form.Item label="Active" valuePropName="checked">
            <Switch
              checked={field.value ?? false}
              onChange={field.onChange}
              disabled={submitting}
            />
          </Form.Item>
        )}
      />

      <Controller
        name="avatar"
        control={control}
        render={({ field }) => (
          <Form.Item
            label="Avatar URL"
            validateStatus={errors.avatar ? "error" : ""}
            help={errors.avatar?.message}
          >
            <Input {...field} placeholder="https://..." disabled={submitting} />
          </Form.Item>
        )}
      />

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          loading={submitting}
          className="bg-zinc-900"
        >
          {mode === "create" ? "Create User" : "Save Changes"}
        </Button>
      </Form.Item>
    </Form>
  );
};

/**
 * Resets the form when the edited user changes.
 * @param initialData existing values when editing
 * @param roles assignable roles for the role default
 * @param reset RHF reset function
 */
function useUserFormReset(
  initialData: Partial<User> | null | undefined,
  roles: UserRole[],
  reset: UseFormReset<UserFormValues>,
): void {
  useEffect(() => {
    reset({
      name: initialData?.name ?? "",
      email: initialData?.email ?? "",
      password: "",
      confirmPassword: "",
      role: initialData?.role ?? roles[0],
      isActive: initialData?.isActive ?? true,
      avatar: initialData?.avatar ?? "",
    });
  }, [initialData, reset, roles]);
}
