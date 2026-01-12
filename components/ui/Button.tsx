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

  return (
    <AntButton type={getButtonType()} className={`${className}`} {...props}>
      {children}
    </AntButton>
  );
}
