"use client";

import { type InputHTMLAttributes } from "react";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: React.ReactNode;
}

export function Checkbox({ label, className = "", ...props }: CheckboxProps) {
  const checked = props.checked ?? false;

  return (
    <label className="flex items-start gap-3 cursor-pointer select-none group">
      <span className={`mt-0.5 flex-shrink-0 h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all duration-150 ${
        checked
          ? "border-[var(--color-primary)] bg-[var(--color-primary)]"
          : "border-[var(--color-border-strong)] bg-transparent group-hover:border-[var(--color-primary)]/60"
      }`}>
        {checked && (
          <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
        <input type="checkbox" className="sr-only" {...props} />
      </span>
      {label && <span className="text-sm leading-snug" style={{ color: "rgba(255,255,255,0.8)" }}>{label}</span>}
    </label>
  );
}

// Versione uncontrolled (per form HTML nativi con name/value)
interface NativeCheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: React.ReactNode;
  isChecked?: boolean;
}

export function NativeCheckbox({ label, isChecked, className = "", ...props }: NativeCheckboxProps) {
  return (
    <label className="flex items-start gap-3 cursor-pointer select-none group">
      <span className={`mt-0.5 flex-shrink-0 h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all duration-150 ${
        isChecked
          ? "border-[var(--color-primary)] bg-[var(--color-primary)]"
          : "border-[var(--color-border-strong)] bg-transparent group-hover:border-[var(--color-primary)]/60"
      }`}>
        {isChecked && (
          <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
        <input type="checkbox" className="sr-only" {...props} />
      </span>
      {label && <span className="text-sm leading-snug" style={{ color: "rgba(255,255,255,0.8)" }}>{label}</span>}
    </label>
  );
}
