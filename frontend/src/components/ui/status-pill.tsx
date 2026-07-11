import type { ReactNode } from "react";

type StatusPillProps = {
  children: ReactNode;
};

export function StatusPill({ children }: StatusPillProps) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-800">
      <span aria-hidden="true" className="size-1.5 rounded-full bg-teal-600" />
      {children}
    </span>
  );
}
