import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button, Form, Input } from "antd";

/** Validation schema for the password-reset form (min 8 + match). */
const schema = yup.object({
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Confirm your password"),
});

/** Values submitted by the admin password-reset form, inferred from the schema. */
export type ResetPasswordFormValues = yup.InferType<typeof schema>;

/** Props for the admin password-reset form. */
export interface AdminUserResetPasswordFormProps {
  /** Submit handler receiving the validated new password. */
  onSubmit: (password: string) => void;
  /** Disables the submit button while a mutation is pending. */
  submitting?: boolean;
}

/**
 * Admin password-reset form (new password + confirmation).
 * @param props form props
 * @returns reset-password form element
 */
export const AdminUserResetPasswordForm = ({
  onSubmit,
  submitting = false,
}: AdminUserResetPasswordFormProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: yupResolver(schema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  return (
    <Form
      layout="vertical"
      onFinish={handleSubmit((values) => onSubmit(values.password ?? ""))}
    >
      <Controller
        name="password"
        control={control}
        render={({ field }) => (
          <Form.Item
            label="New password"
            validateStatus={errors.password ? "error" : ""}
            help={errors.password?.message}
          >
            <Input.Password
              {...field}
              placeholder="Minimum 8 characters"
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
            label="Confirm new password"
            validateStatus={errors.confirmPassword ? "error" : ""}
            help={errors.confirmPassword?.message}
          >
            <Input.Password
              {...field}
              placeholder="Repeat the new password"
              disabled={submitting}
            />
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
          Reset Password
        </Button>
      </Form.Item>
    </Form>
  );
};
