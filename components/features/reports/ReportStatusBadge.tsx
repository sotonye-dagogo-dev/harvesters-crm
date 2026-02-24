"use client";

import { Tag } from "antd";
import { ReportStatus } from "@/lib/types";
import {
  REPORT_STATUS_LABELS,
  REPORT_STATUS_COLORS,
} from "@/lib/constants/reports";

interface ReportStatusBadgeProps {
  status: ReportStatus;
  size?: "small" | "default";
  className?: string;
}

/**
 * Renders a color-coded Ant Design Tag for a report status.
 * Colors and labels are driven by REPORT_STATUS_COLORS / REPORT_STATUS_LABELS.
 */
export default function ReportStatusBadge({
  status,
  size = "default",
  className,
}: ReportStatusBadgeProps) {
  const label = REPORT_STATUS_LABELS[status] ?? status;
  const color = REPORT_STATUS_COLORS[status] ?? "default";

  return (
    <Tag
      color={color}
      className={`${size === "small" ? "text-xs px-1.5 py-0" : ""} ${className ?? ""}`}
    >
      {label}
    </Tag>
  );
}
