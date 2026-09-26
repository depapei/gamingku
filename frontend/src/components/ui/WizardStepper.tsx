import { Steps } from "antd";
import type { ReactNode } from "react";

/** Single entry rendered by the wizard stepper. */
export interface WizardStepDef {
  /** Step heading shown beside the marker. */
  title: string;
  /** One-line helper shown under the heading. */
  description?: string;
  /** Optional icon rendered inside the step marker. */
  icon?: ReactNode;
}

/** Props for the generic wizard stepper. */
export interface WizardStepperProps {
  /** Ordered step definitions. */
  steps: WizardStepDef[];
  /** Zero-based index of the active step. */
  current: number;
  /** Called when a completed step marker is clicked. */
  onChange?: (index: number) => void;
  /** Layout direction. Vertical is used for the modal rail. */
  direction?: "vertical" | "horizontal";
}

/**
 * Generic step indicator for multi-step flows.
 * Sequence numbering is intentional here because a wizard is a true sequence.
 * @param props stepper props
 * @returns stepper element
 */
export const WizardStepper = ({ steps, current, onChange, direction = "vertical" }: WizardStepperProps) => {
  return (
    <Steps
      current={current}
      direction={direction}
      size="small"
      onChange={(idx) => {
        if (idx < current) onChange?.(idx);
      }}
      className="wizard-stepper"
      items={steps.map((s) => ({
        title: <span className="text-sm font-medium text-inherit text-white">{s.title}</span>,
        description: s.description ? (
          <span className="text-xs font-normal opacity-70 text-white">{s.description}</span>
        ) : undefined,
        icon: s.icon,
      }))}
    />
  );
};
