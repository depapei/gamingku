import { authLogin } from "@/src/hooks/useAuth";
import { ErrorResponse, SuccessResponse } from "@/src/types/auth";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button, Form, Input, message } from "antd";
import { AxiosError } from "axios";
import { Controller, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import * as yup from "yup";

const schema = yup.object({
  email: yup.string().required().email(),
  password: yup.string().required(),
});

type FormData = yup.InferType<typeof schema>;

export const LoginForm = () => {
  const navigate = useNavigate();

  const { mutate: login, isPending: loginLoading } = authLogin();

  const onSubmit = (data: any) => {
    login(data, {
      onSuccess: (res: any) => {
        const response: SuccessResponse = res;
        localStorage.setItem("user", JSON.stringify(response.token));
        message.success(response.message);
        navigate("/");
      },
      onError: (err: AxiosError) => {
        const response: ErrorResponse = err.response.data;
        message.error(response.message);
      },
    });
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      email: "",
      password: "",
    },
  });

  return (
    <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
      <Controller
        name="email"
        control={control}
        render={({ field }) => (
          <Form.Item
            label={<span className="text-zinc-700">Email</span>}
            validateStatus={errors.email ? "error" : ""}
            help={errors.email?.message}
          >
            <Input {...field} placeholder="john@example.com" size="large" />
          </Form.Item>
        )}
      />

      <Controller
        name="password"
        control={control}
        render={({ field }) => (
          <Form.Item
            label={<span className="text-zinc-700">Password</span>}
            validateStatus={errors.password ? "error" : ""}
            help={errors.password?.message}
          >
            <Input.Password
              {...field}
              placeholder="********"
              size="large"
              className="rounded-lg placeholder:text-sm"
            />
          </Form.Item>
        )}
      />

      <Form.Item>
        <Link to={"/auth/register"} className="text-zinc-600!">
          New here?{" "}
          <span className="text-blue-600 hover:underline">register</span>
        </Link>
      </Form.Item>

      <Form.Item>
        <Button
          htmlType="submit"
          size="large"
          block
          disabled={loginLoading}
          className={`bg-zinc-900! border-zinc-900! hover:bg-zinc-800! text-zinc-50! rounded-lg ${loginLoading && "animate-pulse"}`}
        >
          {loginLoading ? "Loading..." : "Login"}
        </Button>
      </Form.Item>
    </Form>
  );
};
