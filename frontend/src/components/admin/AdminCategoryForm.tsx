import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect } from "react";
import * as yup from "yup";
import { Button, Form, Input, Select } from "antd";
import { Category } from "../../types/category";
import { slugify } from "../../utils/slug";

/** Validation schema for the category form. Creator is server-derived. */
const schema = yup
  .object({
    id: yup.number().optional(),
    name: yup.string().trim().min(2).required("Category name is required"),
    slug: yup.string().trim().min(2).required("Slug is required"),
    parentId: yup.number().nullable().optional().default(null),
    image: yup.string().trim().url("Image must be a valid URL").required("Image URL is required"),
  })
  .required();

/** Form values submitted by the admin category form. */
export type CategoryFormValues = yup.InferType<typeof schema>;

/** Props for the admin category form. */
export interface AdminCategoryFormProps {
  /** Submit handler receiving validated values. */
  onSubmit: (data: CategoryFormValues) => void;
  /** Existing values when editing. */
  initialData?: Partial<Category> | null;
  /** Category options for the parent selector (provided by the caller). */
  categories?: Category[];
  /** Id excluded from parent options to prevent self-parenting. */
  excludeId?: number;
  /** Disables the submit button while a mutation is pending. */
  submitting?: boolean;
}

/**
 * Category create/edit form with auto-slug, validation and parent selection.
 * @param props form props
 * @returns category form element
 */
export const AdminCategoryForm = ({
  onSubmit,
  initialData,
  categories = [],
  excludeId,
  submitting = false,
}: AdminCategoryFormProps) => {
  const {
    watch,
    setValue,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: yupResolver(schema) as any,
    defaultValues: {
      id: initialData?.id,
      name: initialData?.name ?? "",
      slug: initialData?.slug ?? "",
      parentId: initialData?.parentId ?? null,
      image: initialData?.image ?? "",
    },
  });

  const watchedName = watch("name");

  useEffect(() => {
    const subscription = watch((values, { name }) => {
      if (name === "name") {
        setValue("slug", slugify(String(values.name ?? "")), {
          shouldValidate: true,
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, setValue]);

  useEffect(() => {
    if (!initialData?.slug) {
      setValue("slug", slugify(String(watchedName ?? "")), {
        shouldValidate: false,
      });
    }
  }, [watchedName, initialData?.slug, setValue]);

  const selfId = excludeId ?? initialData?.id;
  const parentOptions = categories
    .filter((cat) => !cat.parentId && cat.id !== selfId)
    .map((parent) => ({
      label: parent.name,
      value: parent.id,
    }));

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
            <Input {...field} placeholder="Keyboards" />
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
            <Input {...field} placeholder="keyboards" disabled={submitting} />
          </Form.Item>
        )}
      />

      <Controller
        name="image"
        control={control}
        render={({ field }) => (
          <Form.Item
            label="Image URL"
            validateStatus={errors.image ? "error" : ""}
            help={errors.image?.message}
          >
            <Input {...field} placeholder="https://..." disabled={submitting} />
          </Form.Item>
        )}
      />

      <Controller
        name="parentId"
        control={control}
        render={({ field }) => (
          <Form.Item
            label="Parent category"
            validateStatus={errors.parentId ? "error" : ""}
            help={errors.parentId?.message}
            extra="Leave empty for a top-level category."
          >
            <Select
              value={field.value ?? null}
              onChange={(value) => field.onChange(value ?? null)}
              onBlur={field.onBlur}
              showSearch={{ optionFilterProp: "label" }}
              allowClear
              placeholder="No parent (top-level)"
              className="w-full"
              options={parentOptions}
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
          Save Category
        </Button>
      </Form.Item>
    </Form>
  );
};
