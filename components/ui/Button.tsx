"use client";

import { Button as AntButton, ButtonProps as AntButtonProps } from "antd";
import { ReactNode } from "react";

interface ButtonProps extends Omit<AntButtonProps, "type" | "variant"> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "link" | "text";
  children: ReactNode;
}

export default function Button({
  variant = "primary",
  children,
  className = "",
  ...props
}: ButtonProps) {
  const getButtonType = (): AntButtonProps["type"] => {
    switch (variant) {
      case "primary":
        return "primary";
      case "outline":
        return "default";
      case "ghost":
        return "dashed";
      case "link":
        return "link";
      case "text":
        return "text";
      default:
        return "default";
    }
  };

  const getButtonStyles = () => {
    switch (variant) {
      case "primary":
        return "shadow-md hover:shadow-lg transition-all duration-200 font-semibold";
      case "secondary":
        return "shadow-sm hover:shadow-md transition-all duration-200 font-semibold";
      case "outline":
        return "shadow-sm hover:shadow-md border-2 transition-all duration-200 font-semibold hover:scale-[1.02]";
      default:
        return "transition-all duration-200";
    }
  };

  return (
    <AntButton
      type={getButtonType()}
      className={`${getButtonStyles()} ${className}`}
      {...props}
    >
      {children}
    </AntButton>
  );
}
