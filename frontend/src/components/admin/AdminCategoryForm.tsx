import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect } from "react";
import * as yup from "yup";
import { Form, Input, InputNumber, Switch, Button, Select } from "antd";
import { useCategories } from "../../hooks/useCategories";

const schema = yup
  .object({
    id: yup.number().optional(),
    name: yup.string().required("Product name is required"),
    slug: yup.string().required("Slug is required"),
    parentId: yup.number().optional(),
    image: yup.string().required("Url Image is required"),
  })
  .required();

type FormData = yup.InferType<typeof schema>;
export const AdminCategoryForm = ({
  onSubmit,
  initialData,
}: {
  onSubmit: (data: FormData) => void;
  initialData?: any;
}) => {
  const { data: categories, isSuccess: categoriesSuccess } = useCategories();

  const {
    getValues,
    setValue,
    watch,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema) as any,
    defaultValues: initialData || {
      name: "",
      slug: "",
      categoryId: 0,
      image: "",
      createdBy: 172,
    },
  });

  useEffect(() => {
    const name: string = getValues("name");
    const newSlug: string = name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
    setValue("slug", newSlug);
  }, [watch("name")]);

  return (
    <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <Form.Item
            label="Category Name"
            validateStatus={errors.name ? "error" : ""}
            help={errors.name?.message}
          >
            <Input
              {...field}
              onChange={(e) => {
                const name = e.target.value.toUpperCase();
                field.onChange(name);
              }}
            />
          </Form.Item>
        )}
      />

      <Controller
        name="slug"
        control={control}
        render={({ field }) => (
          <Form.Item
            label="Slug"
            validateStatus={errors.slug ? "error" : ""}
            help={errors.slug?.message}
          >
            <Input disabled {...field} />
          </Form.Item>
        )}
      />

      <Controller
        name="image"
        control={control}
        render={({ field }) => (
          <Form.Item
            label="Image url"
            validateStatus={errors.slug ? "error" : ""}
            help={errors.slug?.message}
          >
            <Input {...field} />
          </Form.Item>
        )}
      />

      <Controller
        name="parentId"
        control={control}
        render={({ field }) => {
          const defaultValue = 0;
          const groupedOptions = categories
            ?.filter((cat) => !cat.parentId)
            .map((parent) => ({
              label: `${parent.name}`,
              value: parent.id,
            }));

          return (
            <Form.Item
              label="Parent category"
              validateStatus={errors.parentId ? "error" : ""}
              help={errors.parentId?.message}
            >
              <Select
                {...field}
                showSearch={{
                  optionFilterProp: "label",
                  filterSort: (optionA, optionB) =>
                    (optionA?.label ?? "")
                      .toLowerCase()
                      .localeCompare((optionB?.label ?? "").toLowerCase()),
                }}
                allowClear={true}
                className="w-full"
                options={groupedOptions}
              />
            </Form.Item>
          );
        }}
      />

      <Form.Item>
        <Button type="primary" htmlType="submit" className="bg-zinc-900">
          Save Category
        </Button>
      </Form.Item>
    </Form>
  );
};
