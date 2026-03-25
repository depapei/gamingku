import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect } from "react";
import * as yup from "yup";
import { Form, Input, InputNumber, Switch, Button, Select } from "antd";
import { useCategories } from "../../hooks/useCategories";

const schema = yup
  .object({
    name: yup.string().required("Product name is required"),
    slug: yup.string().required("Slug is required"),
    price: yup
      .number()
      .positive("Price must be positive")
      .required("Price is required"),
    discountPrice: yup
      .number()
      .positive("Discount price must be positive")
      .nullable(),
    stock: yup
      .number()
      .integer("Stock must be an integer")
      .min(0, "Stock cannot be negative")
      .required("Stock is required"),
    categoryId: yup.number().required("Category is required"),
    description: yup.string().required("Description is required"),
    featured: yup.boolean().default(false),
    imageUrls: yup.array(),
  })
  .required();

type FormData = yup.InferType<typeof schema>;
export const AdminProductForm = ({
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
      price: 0,
      stock: 0,
      categoryId: 0,
      description: "",
      featured: false,
      imageUrls: [],
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

  useEffect(() => {
    const category = getValues("categoryId");
    if (category === 0 && categoriesSuccess) {
      const defaultCategory: number = categories.find((_, idx) => idx === 0).id;
      setValue("categoryId", defaultCategory);
    }
  }, [watch("categoryId"), categories]);

  return (
    <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <Form.Item
            label="Product Name"
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
        disabled
        render={({ field }) => (
          <Form.Item
            label="Slug"
            validateStatus={errors.slug ? "error" : ""}
            help={errors.slug?.message}
          >
            <Input {...field} />
          </Form.Item>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <Controller
          name="price"
          control={control}
          render={({ field }) => (
            <Form.Item
              label="Price"
              validateStatus={errors.price ? "error" : ""}
              help={errors.price?.message}
            >
              <InputNumber
                {...field}
                prefix="Rp"
                style={{ width: "100%" }}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                }
                parser={(value) => value!.replace(/\./g, "") as any}
              />
            </Form.Item>
          )}
        />

        <Controller
          name="discountPrice"
          control={control}
          render={({ field }) => (
            <Form.Item
              label="Discount Price"
              validateStatus={errors.discountPrice ? "error" : ""}
              help={errors.discountPrice?.message}
            >
              <InputNumber
                {...field}
                style={{ width: "100%" }}
                prefix="Rp"
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                }
                parser={(value) => value!.replace(/\./g, "") as any}
              />
            </Form.Item>
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Controller
          name="stock"
          control={control}
          render={({ field }) => (
            <Form.Item
              label="Stock"
              validateStatus={errors.stock ? "error" : ""}
              help={errors.stock?.message}
            >
              <InputNumber {...field} style={{ width: "100%" }} />
            </Form.Item>
          )}
        />

        <Controller
          name="categoryId"
          control={control}
          render={({ field }) => {
            const groupedOptions = categories
              ?.filter((cat) => !cat.parentId)
              .map((parent) => ({
                label: parent.name,
                options: [
                  {
                    label: `${parent.name} (Main)`,
                    value: parent.id,
                  },
                  ...(categories
                    ?.filter((child) => child.parentId === parent.id)
                    .map((child) => ({
                      label: child.name,
                      value: child.id,
                    })) || []),
                ],
              }));

            return (
              <Form.Item
                label="Category"
                validateStatus={errors.categoryId ? "error" : ""}
                help={errors.categoryId?.message}
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
                  className="w-full"
                  options={groupedOptions}
                />
              </Form.Item>
            );
          }}
        />
      </div>

      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <Form.Item
            label="Description"
            validateStatus={errors.description ? "error" : ""}
            help={errors.description?.message}
          >
            <Input.TextArea {...field} rows={2} />
          </Form.Item>
        )}
      />

      <Controller
        name="featured"
        control={control}
        render={({ field }) => (
          <Form.Item>
            <div className="flex items-center space-x-2">
              <div>
                <Switch checked={field.value} onChange={field.onChange} />
              </div>
              <p className={`${field.value && "animate-pulse"}`}>
                Featured Product
              </p>
            </div>
          </Form.Item>
        )}
      />

      <Form.Item>
        <Button type="primary" htmlType="submit" className="bg-zinc-900">
          Save Product
        </Button>
      </Form.Item>
    </Form>
  );
};
