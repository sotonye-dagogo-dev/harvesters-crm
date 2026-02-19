"use client";

import { Card, Typography, Tooltip } from "antd";
import {
  CalendarOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import ReportStatusBadge from "./ReportStatusBadge";

import { getReportPeriodLabel } from "@/lib/utils/reporting";
import { ReportFrequency } from "@/lib/types";

const { Text, Paragraph } = Typography;

interface ReportCardProps {
  report: ReportSubmission & {
    reportTypeName?: string;
    reportTypeCode?: string;
    submitterName?: string;
  };
  basePath?: string;
  showSubmitter?: boolean;
}

export default function ReportCard({
  report,
  basePath = "/leader/reports",
  showSubmitter = false,
}: ReportCardProps) {
  const periodLabel = getReportPeriodLabel(
    (report as ReportSubmission & { frequency?: ReportFrequency }).frequency ??
      ReportFrequency.WEEKLY,
    report.reportWeek,
    report.reportMonth,
    undefined,
    report.reportYear
  );

  const createdDate = new Date(report.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const lastEdited = report.lastEditedAt
    ? new Date(report.lastEditedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  return (
    <Link href={`${basePath}/${report.id}`}>
      <Card
        hoverable
        className="h-full transition-shadow hover:shadow-md"
        size="small"
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <FileTextOutlined className="text-green-600 text-lg shrink-0" />
            <Text strong className="truncate block">
              {report.reportTypeName ?? "Report"}
            </Text>
          </div>
          <ReportStatusBadge status={report.status} size="small" />
        </div>

        <div className="space-y-1.5 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1.5">
            <CalendarOutlined className="shrink-0" />
            <span>{periodLabel}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <ClockCircleOutlined className="shrink-0" />
            <span>Created {createdDate}</span>
          </div>

          {showSubmitter && report.submitterName && (
            <div className="flex items-center gap-1.5">
              <UserOutlined className="shrink-0" />
              <span>{report.submitterName}</span>
            </div>
          )}

          {lastEdited && (
            <Tooltip title={`Last edited: ${lastEdited}`}>
              <Paragraph type="secondary" className="!mb-0 !text-xs" ellipsis>
                Edited {lastEdited}
              </Paragraph>
            </Tooltip>
          )}
        </div>
      </Card>
    </Link>
  );
}
