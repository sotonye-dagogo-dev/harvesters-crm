"use client";

import { useEffect, useState, useMemo } from "react";
import { Tag, Tooltip } from "antd";
import { ClockCircleOutlined, WarningOutlined } from "@ant-design/icons";
import { formatDateTime } from "@/lib/utils/format";

interface ReportDeadlineCountdownProps {
  deadline: string;
  className?: string;
}

/**
 * Shows a countdown timer to the report submission deadline.
 * Turns red when < 6 hours remain, amber when < 24 hours.
 */
export default function ReportDeadlineCountdown({
  deadline,
  className,
}: ReportDeadlineCountdownProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000); // update every minute
    return () => clearInterval(interval);
  }, []);

  const deadlineDate = useMemo(() => new Date(deadline), [deadline]);
  const diffMs = deadlineDate.getTime() - now.getTime();

  if (diffMs <= 0) {
    return (
      <Tag color="error" icon={<WarningOutlined />} className={className}>
        Past deadline
      </Tag>
    );
  }

  const totalMinutes = Math.floor(diffMs / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;

  let label: string;
  if (days > 0) {
    label = `${days}d ${remainingHours}h`;
  } else if (hours > 0) {
    label = `${hours}h ${minutes}m`;
  } else {
    label = `${minutes}m`;
  }

  let color: string;
  if (hours < 6) {
    color = "error";
  } else if (hours < 24) {
    color = "warning";
  } else {
    color = "success";
  }

  return (
    <Tooltip title={`Deadline: ${formatDateTime(deadlineDate)}`}>
      <Tag color={color} icon={<ClockCircleOutlined />} className={className}>
        {label} remaining
      </Tag>
    </Tooltip>
  );
}
