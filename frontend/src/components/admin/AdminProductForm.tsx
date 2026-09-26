import { Controller, useFieldArray, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Fragment, useEffect, useMemo, useState } from "react";
import * as yup from "yup";
import {
  Button,
  Checkbox,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
} from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ClipboardCheck, FileText, Package, Tag } from "lucide-react";
import type { Category } from "../../types/category";
import type { AdminProduct } from "../../types/product";
import { slugify } from "../../utils/slug";
import { formatPrice } from "../../utils/formatPrice";
import { WizardStepper } from "../ui/WizardStepper";
import { WizardFormLayout } from "../ui/WizardFormLayout";
import { FormStepFooter } from "../ui/FormStepFooter";

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

/** Create or edit mode for the wizard. Edit locks the slug field. */
export type ProductFormMode = "create" | "edit";

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
  /** Wizard mode. Defaults to edit when initialData has a slug, else create. */
  mode?: ProductFormMode;
}

/** Field names validated before leaving each step. Final step submits the whole schema. */
const STEP_FIELDS = [
  ["name", "slug", "categoryId"],
  ["description", "images", "specifications"],
  ["price", "discountPrice", "stock", "variants"],
  [],
] as const;

/**
 * Zeroes AntD's 24px item margin so the section `space-y-5` rhythm
 * owns vertical spacing instead of stacking with it.
 */
const NO_MB = { marginBottom: 0 } as const;

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
  /** Disables inputs while submitting. */
  disabled?: boolean;
}

/**
 * Variant block with dynamic nested options.
 * @param props variant item props
 * @returns variant fieldset element
 */
const VariantItem = ({ nestIndex, control, errors, onRemove, disabled }: VariantItemProps) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `variants.${nestIndex}.options` as const,
  });
  const variantError = errors?.variants?.[nestIndex];

  return (
    <div className="rounded-lg border border-[#d5dbd6] bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-[#1a2128]">Variant {nestIndex + 1}</span>
        <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={onRemove} aria-label={`Remove variant ${nestIndex + 1}`} />
      </div>
      <Controller
        name={`variants.${nestIndex}.name` as const}
        control={control}
        render={({ field }) => (
          <Form.Item
            label="Variant name"
            validateStatus={variantError?.name ? "error" : ""}
            help={variantError?.name?.message}
            style={NO_MB}
          >
            <Input {...field} placeholder="Color" disabled={disabled} />
          </Form.Item>
        )}
      />
      <div className="space-y-2">
        {fields.map((opt, optIdx) => {
          const optError = variantError?.options?.[optIdx];
          return (
            <Space key={opt.id} align="baseline" className="flex w-full">
              <Controller
                name={`variants.${nestIndex}.options.${optIdx}.name` as const}
                control={control}
                render={({ field }) => (
                  <Form.Item
                    className="mb-0 flex-1"
                    validateStatus={optError?.name ? "error" : ""}
                    help={optError?.name?.message}
                  >
                    <Input {...field} placeholder="Black" disabled={disabled} />
                  </Form.Item>
                )}
              />
              <Controller
                name={`variants.${nestIndex}.options.${optIdx}.isAvailable` as const}
                control={control}
                render={({ field }) => (
                  <Checkbox
                    checked={!!field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    disabled={disabled}
                  >
                    Available
                  </Checkbox>
                )}
              />
              <Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(optIdx)} aria-label="Remove option" />
            </Space>
          );
        })}
      </div>
      <Button
        type="dashed"
        size="small"
        icon={<PlusOutlined />}
        onClick={() => append({ name: "", isAvailable: true })}
        className="mt-3"
      >
        Add option
      </Button>
    </div>
  );
};

/**
 * Product create/edit form as a four-step wizard with per-step validation.
 * @param props form props
 * @returns wizard form element
 */
export const AdminProductForm = ({
  onSubmit,
  initialData,
  categories = [],
  submitting = false,
  mode,
}: AdminProductFormProps) => {
  const resolvedMode: ProductFormMode = mode ?? (initialData?.slug ? "edit" : "create");
  const isEdit = resolvedMode === "edit";
  const reduceMotion = useReducedMotion();
  const [step, setStep] = useState(0);
  const [navigating, setNavigating] = useState(false);

  const defaults = useMemo(() => toDefaults(initialData), [initialData]);
  const {
    watch,
    setValue,
    reset,
    control,
    trigger,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ProductFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: yupResolver(schema) as any,
    defaultValues: defaults,
  });

  useEffect(() => {
    reset(toDefaults(initialData));
    setStep(0);
  }, [initialData, reset]);

  const watchedName = watch("name");

  useEffect(() => {
    const subscription = watch((values, { name }) => {
      if (name === "name" && !initialData?.slug) {
        setValue("slug", slugify(String(values.name ?? "")), { shouldValidate: true });
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, setValue, initialData?.slug]);

  useEffect(() => {
    if (!initialData?.slug && watchedName) {
      setValue("slug", slugify(String(watchedName ?? "")), { shouldValidate: false });
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

  const live = watch();
  const categoryName =
    categories.find((c) => c.id === Number(live.categoryId))?.name ?? "Not set";
  const imageCount = (live.images ?? []).filter(Boolean).length;
  const variantCount = (live.variants ?? []).length;
  const specCount = (live.specifications ?? []).length;

  /** Validates the active step before advancing. */
  const handleNext = async () => {
    setNavigating(true);
    try {
      const fields = STEP_FIELDS[step] as unknown as Parameters<typeof trigger>[0];
      const ok = fields.length === 0 ? true : await trigger(fields);
      if (ok) setStep((s) => Math.min(s + 1, STEP_FIELDS.length - 1));
    } finally {
      setNavigating(false);
    }
  };

  const handleBack = () => setStep((s) => Math.max(s - 1, 0));

  /**
   * Jumps to a step marker. Backward jumps keep entered data;
   * forward jumps validate each skipped step and stop on the first failure.
   */
  const handleGoto = async (idx: number) => {
    if (idx === step || navigating || submitting) return;
    if (idx < step) {
      setStep(idx);
      return;
    }
    setNavigating(true);
    try {
      for (let s = step; s < idx; s += 1) {
        const fields = STEP_FIELDS[s] as unknown as Parameters<typeof trigger>[0];
        if (fields.length > 0 && !(await trigger(fields))) return;
      }
      setStep(idx);
    } finally {
      setNavigating(false);
    }
  };

  const review = getValues();

  return (
    <Form layout="vertical">
      <WizardFormLayout
        sidebar={
          <div className="space-y-6">
            <div>
              <p className="text-sm font-semibold">{isEdit ? "Edit product" : "New product"}</p>
              <p className="mt-1 text-xs leading-relaxed opacity-70">
                {isEdit
                  ? "Changes replace variants and specs in one save."
                  : "Four short passes. Nothing saves until the last one."}
              </p>
            </div>
            <WizardStepper
              current={step}
              onChange={handleGoto}
              steps={[
                { title: "Basics", description: "Name and shelf", icon: <Package size={14} /> },
                { title: "Details", description: "Images and specs", icon: <FileText size={14} /> },
                { title: "Price and stock", description: "Money and variants", icon: <Tag size={14} /> },
                { title: "Review", description: "Check and save", icon: <ClipboardCheck size={14} /> },
              ]}
            />
            <dl className="space-y-2 border-t border-white/15 pt-4 text-xs">
              <div className="flex items-baseline justify-between gap-2">
                <dt className="opacity-60">Price</dt>
                <dd className="font-medium tabular-nums">{formatPrice(Number(live.price) || 0)}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-2">
                <dt className="opacity-60">Stock</dt>
                <dd className="font-medium tabular-nums">{Number(live.stock) || 0}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-2">
                <dt className="opacity-60">Media</dt>
                <dd className="font-medium tabular-nums">{imageCount} image{imageCount === 1 ? "" : "s"}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-2">
                <dt className="opacity-60">Options</dt>
                <dd className="font-medium tabular-nums">{variantCount} variants, {specCount} specs</dd>
              </div>
            </dl>
          </div>
        }
        footer={
          <FormStepFooter
            current={step}
            total={STEP_FIELDS.length}
            onBack={handleBack}
            onNext={handleNext}
            onSubmit={handleSubmit(onSubmit)}
            submitting={submitting}
            navigating={navigating}
            submitLabel={isEdit ? "Save changes" : "Create product"}
          />
        }
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={reduceMotion ? false : { opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, x: -12 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="space-y-6"
          >
            {step === 0 && (
              <section className="space-y-5">
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <Form.Item label="Product name" validateStatus={errors.name ? "error" : ""} help={errors.name?.message} style={NO_MB}>
                      <Input {...field} placeholder="Pro mechanical keyboard X1" disabled={submitting} />
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
                      help={
                        errors.slug?.message ??
                        (isEdit
                          ? "Slug stays fixed so saved links keep working."
                          : "Auto-generated from the name.")
                      }
                      style={NO_MB}
                    >
                      <Input {...field} placeholder="pro-mechanical-keyboard-x1" readOnly />
                    </Form.Item>
                  )}
                />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Controller
                    name="categoryId"
                    control={control}
                    render={({ field }) => (
                      <Form.Item label="Category" validateStatus={errors.categoryId ? "error" : ""} help={errors.categoryId?.message} style={NO_MB}>
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
                  <Controller
                    name="featured"
                    control={control}
                    render={({ field }) => (
                      <Form.Item label="Placement" style={NO_MB}>
                        <div className="flex h-8 items-center gap-2">
                          <Checkbox
                            checked={!!field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                            disabled={submitting}
                          >
                            Show on homepage
                          </Checkbox>
                        </div>
                      </Form.Item>
                    )}
                  />
                </div>
              </section>
            )}

            {step === 1 && (
              <section className="space-y-5">
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <Form.Item label="Description" validateStatus={errors.description ? "error" : ""} help={errors.description?.message} style={NO_MB}>
                      <Input.TextArea {...field} rows={4} placeholder="Switch type, layout, what is in the box" disabled={submitting} />
                    </Form.Item>
                  )}
                />
                <div>
                  <p className="mb-2 text-sm font-medium text-[#1a2128]">Images</p>
                  <div className="space-y-2">
                    {imageFields.map((img, idx) => (
                      <Space key={img.id} align="baseline" className="flex w-full">
                        <Controller
                          name={`images.${idx}` as const}
                          control={control}
                          render={({ field }) => (
                            <Form.Item
                              className="mb-0 flex-1"
                              validateStatus={errors.images?.[idx] ? "error" : ""}
                              help={(errors.images?.[idx] as { message?: string } | undefined)?.message}
                            >
                              <Input {...field} placeholder="https://…" disabled={submitting} />
                            </Form.Item>
                          )}
                        />
                        <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeImage(idx)} disabled={imageFields.length <= 1} aria-label={`Remove image ${idx + 1}`} />
                      </Space>
                    ))}
                  </div>
                  <Button type="dashed" size="small" icon={<PlusOutlined />} onClick={() => appendImage("")} className="mt-3">
                    Add image
                  </Button>
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium text-[#1a2128]">Specifications</p>
                  {specFields.length === 0 && (
                    <p className="mb-3 text-xs leading-relaxed text-[#5b6660]">
                      No specs yet. Add rows like switch, connection, weight.
                    </p>
                  )}
                  <div className="space-y-2">
                    {specFields.map((spec, idx) => (
                      <Space key={spec.id} align="baseline" className="flex w-full">
                        <Controller
                          name={`specifications.${idx}.key` as const}
                          control={control}
                          render={({ field }) => (
                            <Form.Item
                              className="mb-0 flex-1"
                              validateStatus={errors.specifications?.[idx]?.key ? "error" : ""}
                              help={errors.specifications?.[idx]?.key?.message}
                            >
                              <Input {...field} placeholder="switch" disabled={submitting} />
                            </Form.Item>
                          )}
                        />
                        <Controller
                          name={`specifications.${idx}.name` as const}
                          control={control}
                          render={({ field }) => (
                            <Form.Item
                              className="mb-0 flex-1"
                              validateStatus={errors.specifications?.[idx]?.name ? "error" : ""}
                              help={errors.specifications?.[idx]?.name?.message}
                            >
                              <Input {...field} placeholder="Linear red" disabled={submitting} />
                            </Form.Item>
                          )}
                        />
                        <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeSpec(idx)} aria-label={`Remove spec ${idx + 1}`} />
                      </Space>
                    ))}
                  </div>
                  <Button type="dashed" size="small" icon={<PlusOutlined />} onClick={() => appendSpec({ key: "", name: "" })} className="mt-3">
                    Add specification
                  </Button>
                </div>
              </section>
            )}

            {step === 2 && (
              <section className="space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <Controller
                    name="price"
                    control={control}
                    render={({ field }) => (
                      <Form.Item label="Price" validateStatus={errors.price ? "error" : ""} help={errors.price?.message} style={NO_MB}>
                        <InputNumber value={field.value} onChange={field.onChange} onBlur={field.onBlur} prefix="Rp" style={{ width: "100%" }} min={0} disabled={submitting} />
                      </Form.Item>
                    )}
                  />
                  <Controller
                    name="discountPrice"
                    control={control}
                    render={({ field }) => (
                      <Form.Item label="Discount price" validateStatus={errors.discountPrice ? "error" : ""} help={errors.discountPrice?.message} style={NO_MB}>
                        <InputNumber value={field.value ?? undefined} onChange={field.onChange} onBlur={field.onBlur} prefix="Rp" style={{ width: "100%" }} min={0} disabled={submitting} />
                      </Form.Item>
                    )}
                  />
                  <Controller
                    name="stock"
                    control={control}
                    render={({ field }) => (
                      <Form.Item label="Stock" validateStatus={errors.stock ? "error" : ""} help={errors.stock?.message} style={NO_MB}>
                        <InputNumber value={field.value} onChange={field.onChange} onBlur={field.onBlur} style={{ width: "100%" }} min={0} precision={0} disabled={submitting} />
                      </Form.Item>
                    )}
                  />
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium text-[#1a2128]">Variants</p>
                  {variantFields.length === 0 && (
                    <p className="mb-3 text-xs leading-relaxed text-[#5b6660]">
                      No variants yet. Most products ship without them.
                    </p>
                  )}
                  <div className="space-y-3">
                    {variantFields.map((variant, idx) => (
                      <Fragment key={variant.id}>
                        <VariantItem nestIndex={idx} control={control} errors={errors} onRemove={() => removeVariant(idx)} disabled={submitting} />
                      </Fragment>
                    ))}
                  </div>
                  <Button type="dashed" size="small" icon={<PlusOutlined />} onClick={() => appendVariant({ name: "", options: [{ name: "", isAvailable: true }] })} className="mt-3">
                    Add variant
                  </Button>
                </div>
              </section>
            )}

            {step === 3 && (
              <section>
                <p className="text-sm font-medium text-[#1a2128]">{review.name || "Untitled product"}</p>
                <p className="mt-1 text-xs leading-relaxed text-[#5b6660]">
                  Read this like a packing slip. Go back to fix a row, then save.
                </p>
                <dl className="mt-4 divide-y divide-[#d5dbd6] rounded-lg border border-[#d5dbd6] bg-white">
                  {[
                    ["Category", categoryName],
                    ["Slug", review.slug || "—"],
                    ["Price", `${formatPrice(Number(review.price) || 0)}${review.discountPrice ? `, now ${formatPrice(Number(review.discountPrice))}` : ""}`],
                    ["Stock", `${Number(review.stock) || 0} units${review.featured ? ", on homepage" : ""}`],
                    ["Images", `${imageCount} image${imageCount === 1 ? "" : "s"}`],
                    ["Variants", variantCount === 0 ? "None" : (review.variants ?? []).map((v) => `${v.name} (${(v.options ?? []).length})`).join(", ")],
                    ["Specs", specCount === 0 ? "None" : (review.specifications ?? []).map((s) => `${s.key}: ${s.name}`).join(", ")],
                  ].map(([term, value]) => (
                    <div key={term} className="grid grid-cols-3 gap-3 px-4 py-3">
                      <dt className="text-xs text-[#5b6660]">{term}</dt>
                      <dd className="col-span-2 break-words text-xs text-[#1a2128]">{value}</dd>
                    </div>
                  ))}
                  <div className="grid grid-cols-3 gap-3 px-4 py-3">
                    <dt className="text-xs text-[#5b6660]">Description</dt>
                    <dd className="col-span-2 line-clamp-4 break-words text-xs leading-relaxed text-[#1a2128]">{review.description || "—"}</dd>
                  </div>
                </dl>
              </section>
            )}
          </motion.div>
        </AnimatePresence>
      </WizardFormLayout>
    </Form>
  );
};
