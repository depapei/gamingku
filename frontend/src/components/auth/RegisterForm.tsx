import { authLogin, authRegister } from "@/src/hooks/useAuth";
import { ErrorResponse, SuccessResponse } from "@/src/types/auth";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button, Form, Input, message } from "antd";
import { AxiosError } from "axios";
import { Controller, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import * as yup from "yup";

const schema = yup.object({
  name: yup.string().required().min(3),
  email: yup.string().required().email(),
  avatar: yup.string().notRequired().nullable(),
  password: yup.string().required().min(8),
});

type FormData = yup.InferType<typeof schema>;

export const RegisterForm = () => {
  const navigate = useNavigate();

  const { mutate: register, isPending: registerLoading } = authRegister();

  const onSubmit = (data: any) => {
    register(data, {
      onSuccess: (res: any) => {
        const response: SuccessResponse = res;
        localStorage.setItem("user", JSON.stringify(response.token));
        message.success(response.message);
        // navigate("/");
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
        name="name"
        control={control}
        render={({ field }) => (
          <Form.Item
            label={<span className="text-zinc-700">Name</span>}
            validateStatus={errors.name ? "error" : ""}
            help={errors.name?.message}
          >
            <Input
              {...field}
              placeholder="John Doe"
              size="large"
              className="rounded-lg placeholder:text-sm"
            />
          </Form.Item>
        )}
      />

      <Controller
        name="email"
        control={control}
        render={({ field }) => (
          <Form.Item
            label={<span className="text-zinc-700">Email</span>}
            validateStatus={errors.email ? "error" : ""}
            help={errors.email?.message}
          >
            <Input
              {...field}
              placeholder="john@example.com"
              size="large"
              className="rounded-lg placeholder:text-sm"
            />
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
        <Link to={"/auth"} className="text-zinc-600!">
          Already have account?{" "}
          <span className="text-blue-600 hover:underline">register</span>
        </Link>
      </Form.Item>

      <Form.Item>
        <Button
          htmlType="submit"
          size="large"
          block
          disabled={registerLoading}
          className={`bg-zinc-900! border-zinc-900! hover:bg-zinc-800! text-zinc-50! rounded-lg ${registerLoading && "animate-pulse"}`}
        >
          {registerLoading ? "Loading..." : "Sign Up"}
        </Button>
      </Form.Item>
    </Form>
  );
};
