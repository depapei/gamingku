import type { ReactNode } from "react";

/** Props for the generic wizard form shell. */
export interface WizardFormLayoutProps {
  /** Rail content, typically a stepper plus a live summary. */
  sidebar: ReactNode;
  /** Active step body. */
  children: ReactNode;
  /** Pinned action row rendered under the body. */
  footer: ReactNode;
}

/**
 * Two-pane shell for modal wizards. Left rail carries orientation,
 * right pane carries the form body and a pinned footer.
 * Stacks vertically below the md breakpoint.
 * @param props layout props
 * @returns wizard shell element
 */
export const WizardFormLayout = ({ sidebar, children, footer }: WizardFormLayoutProps) => {
  return (
    <div className="flex flex-col overflow-hidden md:flex-row">
      <aside className="h-fit bg-[#14181d] px-5 py-6 text-[#e8ece9] shadow-lg md:w-60">
        {sidebar}
      </aside>
      <div className="flex min-w-0 flex-1 flex-col bg-[#ffffff]">
        <div className="min-h-105 px-6 py-6">{children}</div>
        <div className="border-t border-[#d5dbd6] bg-[#ffffff] px-6 py-4">{footer}</div>
      </div>
    </div>
  );
};
