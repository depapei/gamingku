import { Controller, useFieldArray, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Fragment, useEffect, useMemo } from "react";
import * as yup from "yup";
import {
  Button,
  Checkbox,
  Divider,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Switch,
} from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import type { Category } from "../../types/category";
import type { AdminProduct } from "../../types/product";
import { slugify } from "../../utils/slug";

/** Validation schema for the admin product form. */
const schema = yup
  .object({
    name: yup.string().trim().min(3).required("Product name is required"),
    slug: yup
      .string()
      .trim()
      .matches(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers or hyphens")
      .required("Slug is required"),
    price: yup
      .number()
      .typeError("Price is required")
      .positive("Price must be positive")
      .required("Price is required"),
    discountPrice: yup
      .number()
      .typeError("Discount price must be a number")
      .nullable()
      .optional()
      .positive("Discount price must be positive")
      .max(yup.ref("price"), "Discount must be less than or equal to price"),
    stock: yup
      .number()
      .typeError("Stock is required")
      .integer("Stock must be an integer")
      .min(0, "Stock cannot be negative")
      .required("Stock is required"),
    categoryId: yup
      .number()
      .typeError("Category is required")
      .min(1, "Category is required")
      .required("Category is required"),
    description: yup
      .string()
      .trim()
      .min(10, "Description must be at least 10 characters")
      .required("Description is required"),
    featured: yup.boolean().default(false).optional(),
    images: yup
      .array()
      .of(yup.string().trim().url("Image must be a valid URL").required("Image URL is required"))
      .min(1, "At least one image is required")
      .required("At least one image is required"),
    variants: yup
      .array()
      .of(
        yup.object({
          name: yup.string().trim().required("Variant name is required"),
          options: yup
            .array()
            .of(
              yup.object({
                name: yup.string().trim().required("Option name is required"),
                isAvailable: yup.boolean().default(true),
              }),
            )
            .min(1, "At least one option is required")
            .required("Options are required"),
        }),
      )
      .optional()
      .default([]),
    specifications: yup
      .array()
      .of(
        yup.object({
          key: yup.string().trim().required("Spec key is required"),
          name: yup.string().trim().required("Spec value is required"),
        }),
      )
      .optional()
      .default([]),
  })
  .required();

/** Form values submitted by the admin product form. */
export type ProductFormValues = yup.InferType<typeof schema>;

/** Props for the admin product form. */
export interface AdminProductFormProps {
  /** Submit handler receiving validated values. */
  onSubmit: (data: ProductFormValues) => void;
  /** Existing values when editing. */
  initialData?: Partial<AdminProduct> | null;
  /** Category options for the selector (provided by the caller). */
  categories?: Category[];
  /** Disables inputs while a mutation is pending. */
  submitting?: boolean;
}

/** Maps admin product detail to form defaults. */
const toDefaults = (
  initialData?: Partial<AdminProduct> | null,
): ProductFormValues => ({
  name: initialData?.name ?? "",
  slug: initialData?.slug ?? "",
  price: initialData?.price ?? 0,
  discountPrice: initialData?.discountPrice ?? undefined,
  stock: initialData?.stock ?? 0,
  categoryId: initialData?.categoryId ?? 0,
  description: initialData?.description ?? "",
  featured: initialData?.featured ?? false,
  images: initialData?.images?.length ? [...initialData.images] : [""],
  variants:
    initialData?.variants?.map((v) => ({
      name: v.name,
      options: v.options.length
        ? v.options.map((o) => ({ name: o.name, isAvailable: o.isAvailable }))
        : [{ name: "", isAvailable: true }],
    })) ?? [],
  specifications: initialData?.specifications?.length
    ? initialData.specifications.map((s) => ({ key: s.key, name: s.name }))
    : [],
});

/** Props for a single variant block with its nested options. */
interface VariantItemProps {
  /** Index of the variant in the variants array. */
  nestIndex: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors: any;
  /** Removes this variant. */
  onRemove: () => void;
}

/**
 * Variant block with dynamic nested options.
 * @param props variant item props
 * @returns variant fieldset element
 */
const VariantItem = ({ nestIndex, control, errors, onRemove }: VariantItemProps) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `variants.${nestIndex}.options` as const,
  });
  const variantError = errors?.variants?.[nestIndex];

  return (
    <div className="border border-zinc-200 rounded p-3 mb-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">Variant #{nestIndex + 1}</span>
        <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={onRemove} />
      </div>
      <Controller
        name={`variants.${nestIndex}.name` as const}
        control={control}
        render={({ field }) => (
          <Form.Item
            label="Variant name"
            validateStatus={variantError?.name ? "error" : ""}
            help={variantError?.name?.message}
          >
            <Input {...field} placeholder="Color" />
          </Form.Item>
        )}
      />
      {fields.map((opt, optIdx) => {
        const optError = variantError?.options?.[optIdx];
        return (
          <Space key={opt.id} align="baseline" className="w-full">
            <Controller
              name={`variants.${nestIndex}.options.${optIdx}.name` as const}
              control={control}
              render={({ field }) => (
                <Form.Item
                  validateStatus={optError?.name ? "error" : ""}
                  help={optError?.name?.message}
                >
                  <Input {...field} placeholder="Black" />
                </Form.Item>
              )}
            />
            <Controller
              name={`variants.${nestIndex}.options.${optIdx}.isAvailable` as const}
              control={control}
              render={({ field }) => (
                <Form.Item>
                  <Checkbox
                    checked={!!field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                  >
                    Available
                  </Checkbox>
                </Form.Item>
              )}
            />
            <Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(optIdx)} />
          </Space>
        );
      })}
      <Button
        type="dashed"
        size="small"
        icon={<PlusOutlined />}
        onClick={() => append({ name: "", isAvailable: true })}
      >
        Add option
      </Button>
    </div>
  );
};

/**
 * Product create/edit form with auto-slug, validation and dynamic lists.
 * @param props form props
 * @returns product form element
 */
export const AdminProductForm = ({
  onSubmit,
  initialData,
  categories = [],
  submitting = false,
}: AdminProductFormProps) => {
  const {
    watch,
    setValue,
    reset,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: yupResolver(schema) as any,
    defaultValues: useMemo(() => toDefaults(initialData), [initialData]),
  });

  useEffect(() => {
    reset(toDefaults(initialData));
  }, [initialData, reset]);

  const watchedName = watch("name");

  useEffect(() => {
    const subscription = watch((values, { name }) => {
      if (name === "name" && !initialData?.slug) {
        setValue("slug", slugify(String(values.name ?? "")), {
          shouldValidate: true,
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, setValue, initialData?.slug]);

  useEffect(() => {
    if (!initialData?.slug && watchedName) {
      setValue("slug", slugify(String(watchedName ?? "")), {
        shouldValidate: false,
      });
    }
  }, [watchedName, initialData?.slug, setValue]);

  useEffect(() => {
    if (!initialData && (!watch("categoryId") || watch("categoryId") === 0) && categories.length > 0) {
      const first = categories.find((c) => c.id);
      if (first) setValue("categoryId", first.id, { shouldValidate: true });
    }
  }, [categories, initialData, setValue, watch]);

  const {
    fields: imageFields,
    append: appendImage,
    remove: removeImage,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useFieldArray({ control: control as any, name: "images" });
  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useFieldArray({ control: control as any, name: "variants" });
  const {
    fields: specFields,
    append: appendSpec,
    remove: removeSpec,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useFieldArray({ control: control as any, name: "specifications" });

  const groupedOptions = useMemo(
    () =>
      categories
        ?.filter((cat) => !cat.parentId)
        .map((parent) => ({
          label: parent.name,
          options: [
            { label: `${parent.name} (Main)`, value: parent.id },
            ...(categories
              ?.filter((child) => child.parentId === parent.id)
              .map((child) => ({ label: child.name, value: child.id })) || []),
          ],
        })),
    [categories],
  );

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
            <Input {...field} placeholder="Pro Mechanical Keyboard X1" disabled={submitting} />
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
            <Input {...field} placeholder="pro-mechanical-keyboard-x1" disabled />
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
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                prefix="Rp"
                style={{ width: "100%" }}
                min={0}
                disabled={submitting}
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
                value={field.value ?? undefined}
                onChange={field.onChange}
                onBlur={field.onBlur}
                prefix="Rp"
                style={{ width: "100%" }}
                min={0}
                disabled={submitting}
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
              <InputNumber
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                style={{ width: "100%" }}
                min={0}
                precision={0}
                disabled={submitting}
              />
            </Form.Item>
          )}
        />
        <Controller
          name="categoryId"
          control={control}
          render={({ field }) => (
            <Form.Item
              label="Category"
              validateStatus={errors.categoryId ? "error" : ""}
              help={errors.categoryId?.message}
            >
              <Select
                value={field.value || undefined}
                onChange={field.onChange}
                onBlur={field.onBlur}
                showSearch={{ optionFilterProp: "label" }}
                placeholder="Select category"
                className="w-full"
                options={groupedOptions}
                disabled={submitting}
              />
            </Form.Item>
          )}
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
            <Input.TextArea {...field} rows={2} disabled={submitting} />
          </Form.Item>
        )}
      />

      <Controller
        name="featured"
        control={control}
        render={({ field }) => (
          <Form.Item>
            <div className="flex items-center space-x-2">
              <Switch checked={!!field.value} onChange={field.onChange} disabled={submitting} />
              <span>Featured Product</span>
            </div>
          </Form.Item>
        )}
      />

      <Divider orientation="left">Images</Divider>
      {imageFields.map((img, idx) => (
        <Space key={img.id} align="baseline" className="w-full">
          <Controller
            name={`images.${idx}` as const}
            control={control}
            render={({ field }) => (
              <Form.Item
                validateStatus={errors.images?.[idx] ? "error" : ""}
                help={(errors.images?.[idx] as { message?: string } | undefined)?.message}
              >
                <Input {...field} placeholder="https://..." style={{ width: 320 }} disabled={submitting} />
              </Form.Item>
            )}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => removeImage(idx)}
            disabled={imageFields.length <= 1}
          />
        </Space>
      ))}
      <Button type="dashed" size="small" icon={<PlusOutlined />} onClick={() => appendImage("")}>
        Add image
      </Button>

      <Divider orientation="left">Variants (optional)</Divider>
      {variantFields.map((variant, idx) => (
        <Fragment key={variant.id}>
          <VariantItem
            nestIndex={idx}
            control={control}
            errors={errors}
            onRemove={() => removeVariant(idx)}
          />
        </Fragment>
      ))}
      <Button
        type="dashed"
        size="small"
        icon={<PlusOutlined />}
        onClick={() => appendVariant({ name: "", options: [{ name: "", isAvailable: true }] })}
      >
        Add variant
      </Button>

      <Divider orientation="left">Specifications (optional)</Divider>
      {specFields.map((spec, idx) => (
        <Space key={spec.id} align="baseline" className="w-full">
          <Controller
            name={`specifications.${idx}.key` as const}
            control={control}
            render={({ field }) => (
              <Form.Item
                validateStatus={errors.specifications?.[idx]?.key ? "error" : ""}
                help={errors.specifications?.[idx]?.key?.message}
              >
                <Input {...field} placeholder="brand" disabled={submitting} />
              </Form.Item>
            )}
          />
          <Controller
            name={`specifications.${idx}.name` as const}
            control={control}
            render={({ field }) => (
              <Form.Item
                validateStatus={errors.specifications?.[idx]?.name ? "error" : ""}
                help={errors.specifications?.[idx]?.name?.message}
              >
                <Input {...field} placeholder="ProGear" disabled={submitting} />
              </Form.Item>
            )}
          />
          <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeSpec(idx)} />
        </Space>
      ))}
      <div>
        <Button
          type="dashed"
          size="small"
          icon={<PlusOutlined />}
          onClick={() => appendSpec({ key: "", name: "" })}
        >
          Add specification
        </Button>
      </div>

      <Form.Item className="mt-4">
        <Button type="primary" htmlType="submit" loading={submitting} className="bg-zinc-900">
          Save Product
        </Button>
      </Form.Item>
    </Form>
  );
};
