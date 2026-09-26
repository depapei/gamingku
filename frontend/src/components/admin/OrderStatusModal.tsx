import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button, Form, Modal, Select } from "antd";
import { nextStatuses } from "../../hooks/useOrders";
import type { Order, OrderStatus } from "../../types/order";

/** Validation schema for the order status form. */
const schema = yup
  .object({
    status: yup
      .string()
      .oneOf(["pending", "paid", "processing", "completed", "cancelled", "refunded"])
      .required("Status is required"),
  })
  .required();

/** Form values submitted by the order status modal. */
export interface OrderStatusFormValues {
  /** Target status key; validated against the lifecycle set by the schema. */
  status: string;
}

/** Props for the admin order status modal. */
export interface OrderStatusModalProps {
  /** Order being transitioned; options derive from its current status. */
  order: Order | null;
  /** Modal visibility. */
  open: boolean;
  /** Disables submit while the status mutation is pending. */
  confirming: boolean;
  /** Receives the validated target status. */
  onSubmit: (status: OrderStatus) => void;
  /** Cancels without changes. */
  onCancel: () => void;
}

/**
 * Admin order status modal listing only legal next states.
 * @param props modal props
 * @returns status modal element
 */
export const OrderStatusModal = ({
  order,
  open,
  confirming,
  onSubmit,
  onCancel,
}: OrderStatusModalProps) => {
  const options = (order ? (nextStatuses[order.status] ?? []) : []).map(
    (status) => ({ label: status, value: status }),
  );

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<OrderStatusFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: yupResolver(schema) as any,
    mode: "onTouched",
    defaultValues: { status: "" },
  });

  const selectedStatus = watch("status");

  useEffect(() => {
    if (open) {
      reset({ status: "" });
    }
  }, [open, order?.id, reset]);

  return (
    <Modal
      title={`Update status${order ? ` — ${order.orderNumber}` : ""}`}
      open={open}
      onCancel={onCancel}
      footer={null}
      destroyOnClose
    >
      <Form
        layout="vertical"
        onFinish={handleSubmit((values) =>
          onSubmit(values.status as OrderStatus),
        )}
      >
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <Form.Item
              label="New status"
              validateStatus={errors.status ? "error" : ""}
              help={errors.status?.message}
              extra={
                order
                  ? selectedStatus
                    ? `Current: ${order.status} → ${selectedStatus}. Only legal transitions are listed.`
                    : `Current: ${order.status}. Only legal transitions are listed.`
                  : undefined
              }
            >
              <Select
                value={field.value || undefined}
                onChange={field.onChange}
                onBlur={field.onBlur}
                placeholder="Select status"
                className="w-full"
                options={options}
                disabled={options.length === 0}
              />
            </Form.Item>
          )}
        />
        {options.length === 0 && (
          <p className="text-sm text-zinc-500 mb-4">
            This order is in a terminal state and cannot transition further.
          </p>
        )}
        <Form.Item className="mb-0 text-right">
          <Button onClick={onCancel} className="mr-2">
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={confirming}
            disabled={options.length === 0}
            className="bg-zinc-900"
          >
            Update Status
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};
