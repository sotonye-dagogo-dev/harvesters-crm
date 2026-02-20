import { forwardRef, type ReactNode } from "react";
import { Input as AntInput, type InputProps, type InputRef } from "antd";
import type { TextAreaProps } from "antd/es/input";

/** Ref type for AntInput.TextArea – derived from the component itself. */
type TextAreaRefType = React.ComponentRef<typeof AntInput.TextArea>;

// ─── Shared DS styling ──────────────────────────────────────────────────────

const DS_INPUT_CLASS =
  "rounded-[var(--ds-radius-lg)] shadow-ds-sm hover:shadow-ds-md transition-all duration-200";

/** Thin label + error shell. Renders nothing extra when both are absent. */
function FieldShell({
  label,
  error,
  children,
}: {
  label?: ReactNode;
  error?: string;
  children: ReactNode;
}) {
  if (!label && !error) return <>{children}</>;
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-ds-text-primary mb-2">
          {label}
        </label>
      )}
      {children}
      {error && (
        <p className="mt-2 text-sm text-ds-status-error flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  );
}

// ─── Input ──────────────────────────────────────────────────────────────────

interface CustomInputProps extends InputProps {
  label?: ReactNode;
  error?: string;
}

const Input = forwardRef<InputRef, CustomInputProps>(
  ({ label, error, className, ...props }, ref) => (
    <FieldShell label={label} error={error}>
      <AntInput
        ref={ref}
        {...props}
        status={error ? "error" : props.status}
        className={`${DS_INPUT_CLASS} ${className || ""}`}
      />
    </FieldShell>
  )
);
Input.displayName = "Input";
export default Input;

// ─── TextArea ───────────────────────────────────────────────────────────────

interface TextAreaCustomProps extends TextAreaProps {
  label?: ReactNode;
  error?: string;
}

export const TextArea = forwardRef<TextAreaRefType, TextAreaCustomProps>(
  ({ label, error, className, ...props }, ref) => (
    <FieldShell label={label} error={error}>
      <AntInput.TextArea
        ref={ref}
        {...props}
        status={error ? "error" : props.status}
        className={`${DS_INPUT_CLASS} ${className || ""}`}
      />
    </FieldShell>
  )
);
TextArea.displayName = "TextArea";

// ─── PasswordInput ──────────────────────────────────────────────────────────

interface PasswordInputProps extends InputProps {
  label?: ReactNode;
  error?: string;
}

export const PasswordInput = forwardRef<InputRef, PasswordInputProps>(
  ({ label, error, className, ...props }, ref) => (
    <FieldShell label={label} error={error}>
      <AntInput.Password
        ref={ref}
        {...props}
        status={error ? "error" : props.status}
        className={`${DS_INPUT_CLASS} ${className || ""}`}
      />
    </FieldShell>
  )
);
PasswordInput.displayName = "PasswordInput";
