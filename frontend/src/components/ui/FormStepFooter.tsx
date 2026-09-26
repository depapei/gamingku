import { Button } from "antd";

/** Props for the wizard footer action row. */
export interface FormStepFooterProps {
  /** Zero-based active step. */
  current: number;
  /** Total number of steps. */
  total: number;
  /** Moves one step back. */
  onBack: () => void;
  /** Validates the current step and moves forward. */
  onNext: () => void;
  /** Submits the whole form from the final step. */
  onSubmit: () => void;
  /** True while the create/update mutation is pending. */
  submitting?: boolean;
  /** Blocks forward navigation, used while async validation runs. */
  navigating?: boolean;
  /** Label for the final submit button. */
  submitLabel?: string;
}

/**
 * Back, continue and save row shared by all wizards.
 * Copy uses plain verbs in sentence case with no trailing arrows.
 * @param props footer props
 * @returns footer element
 */
export const FormStepFooter = ({
  current,
  total,
  onBack,
  onNext,
  onSubmit,
  submitting = false,
  navigating = false,
  submitLabel = "Save product",
}: FormStepFooterProps) => {
  const isFirst = current === 0;
  const isLast = current === total - 1;
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs tabular-nums opacity-70">
        Step {current + 1} of {total}
      </span>
      <div className="flex items-center gap-2">
        <Button onClick={onBack} disabled={isFirst || submitting}>
          Back
        </Button>
        {isLast ? (
          <Button
            type="primary"
            onClick={onSubmit}
            loading={submitting}
          >
            {submitLabel}
          </Button>
        ) : (
          <Button
            type="primary"
            onClick={onNext}
            loading={navigating}
            disabled={submitting}
          >
            Continue
          </Button>
        )}
      </div>
    </div>
  );
};
