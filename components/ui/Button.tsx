"use client";

import { Button as AntButton, ButtonProps as AntButtonProps } from "antd";
import { ReactNode, forwardRef } from "react";

// ─── Button Props ───────────────────────────────────────────────────────────

type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "link"
  | "text"
  | "dashed";

interface ButtonProps extends Omit<AntButtonProps, "type" | "variant"> {
  /** Visual style variant */
  variant?: ButtonVariant;
  children?: ReactNode;
}

// ─── Variant Mapping ────────────────────────────────────────────────────────

const VARIANT_TYPE_MAP: Record<ButtonVariant, AntButtonProps["type"]> = {
  primary: "primary",
  secondary: "default",
  outline: "default",
  ghost: "default",
  link: "link",
  text: "text",
  dashed: "dashed",
};

const VARIANT_STYLE_MAP: Record<ButtonVariant, string> = {
  primary:
    "shadow-ds-sm hover:shadow-ds-md transition-all duration-200 font-semibold rounded-[var(--ds-radius-lg)]",
  secondary:
    "shadow-ds-sm hover:shadow-ds-md transition-all duration-200 font-semibold rounded-[var(--ds-radius-lg)]",
  outline:
    "shadow-ds-sm hover:shadow-ds-md border-2 transition-all duration-200 font-semibold rounded-[var(--ds-radius-lg)]",
  ghost:
    "transition-all duration-200 font-medium rounded-[var(--ds-radius-lg)]",
  link: "transition-colors duration-200 p-0 h-auto",
  text: "transition-colors duration-200",
  dashed:
    "border-dashed transition-all duration-200 rounded-[var(--ds-radius-lg)]",
};

// ─── Button Component ───────────────────────────────────────────────────────

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", children, className = "", ...props }, ref) => {
    const buttonType = VARIANT_TYPE_MAP[variant];
    const variantStyles = VARIANT_STYLE_MAP[variant];
    const isGhost = variant === "ghost";

    return (
      <AntButton
        ref={ref}
        type={buttonType}
        ghost={isGhost}
        className={`${variantStyles} ${className}`}
        {...props}
      >
        {children}
      </AntButton>
    );
  }
);

Button.displayName = "Button";

export default Button;
