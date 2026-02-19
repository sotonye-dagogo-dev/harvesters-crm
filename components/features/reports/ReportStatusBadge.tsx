"use client";

import { Tag } from "antd";
import { REPORT_STATUS_COLORS, REPORT_STATUS_LABELS } from "@/lib/constants";
import { ReportStatus } from "@/lib/types";

interface ReportStatusBadgeProps {
  status: ReportStatus;
  size?: "small" | "default";
}

export default function ReportStatusBadge({
  status,
  size = "default",
}: ReportStatusBadgeProps) {
  const color = REPORT_STATUS_COLORS[status] ?? "default";
  const label = REPORT_STATUS_LABELS[status] ?? status;

  return (
    <Tag
      color={color}
      className={size === "small" ? "!text-xs !py-0 !px-1" : ""}
    >
      {label}
    </Tag>
  );
}
