"use client";

import { useEffect, useState } from "react";
import { Card, Spin, Progress, Empty, Tooltip } from "antd";
import {
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  EditOutlined,
  LockOutlined,
  SendOutlined,
  RightOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { getRoleConfig } from "@/lib/constants/roles";
import { UserRole } from "@/lib/types";

interface ReportOverviewWidgetProps {
  /** Optional campusId to scope dashboard stats */
  campusId?: string;
}

export default function ReportOverviewWidget({
  campusId,
}: ReportOverviewWidgetProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ReportDashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Derive report route based on user role
  const role = (user?.role as UserRole) || UserRole.MEMBER;
  const roleConfig = getRoleConfig(role);
  const reportVisibility = roleConfig.reportVisibilityScope;

  // Determine the reports link based on role
  const reportsPath =
    role === UserRole.SUPERADMIN
      ? "/superadmin/reports"
      : "/leader/reports";

  useEffect(() => {
    if (reportVisibility === "none") {
      setLoading(false);
      return;
    }

    fetchReportStats();
  }, [campusId, reportVisibility]);

  const fetchReportStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (campusId) params.set("campusId", campusId);

      const response = await fetch(
        `/api/analytics/reports${params.toString() ? `?${params.toString()}` : ""}`
      );

      if (response.ok) {
        const result = await response.json();
        setStats(result.data?.dashboard || null);
      } else if (response.status === 403) {
        // User doesn't have analytics API access — show a simplified view
        setStats(null);
      } else {
        setError("Failed to load report data");
      }
    } catch (err) {
      console.error("Failed to fetch report stats:", err);
      setError("Failed to load report data");
    } finally {
      setLoading(false);
    }
  };

  // Don't render for roles with no report visibility
  if (reportVisibility === "none") {
    return null;
  }

  if (loading) {
    return (
      <Card className="shadow-sm">
        <div className="flex items-center justify-center py-8">
          <Spin />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card
        title={
          <div className="flex items-center gap-2">
            <FileTextOutlined className="text-blue-500" />
            <span>Reports Overview</span>
          </div>
        }
        className="shadow-sm"
      >
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={error}
          className="py-4"
        />
      </Card>
    );
  }

  // If stats couldn't be loaded (403, etc.) show a placeholder with link
  if (!stats) {
    return (
      <Card
        title={
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileTextOutlined className="text-blue-500" />
              <span>Reports Overview</span>
            </div>
            <Link
              href={reportsPath}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Go to Reports <RightOutlined />
            </Link>
          </div>
        }
        className="shadow-sm"
      >
        <div className="text-center py-6">
          <FileTextOutlined className="text-4xl text-gray-300 mb-3" />
          <p className="text-gray-500">
            View and manage your reports
          </p>
          <Link
            href={reportsPath}
            className="text-blue-600 hover:text-blue-700 text-sm mt-2 inline-block"
          >
            Open Reports →
          </Link>
        </div>
      </Card>
    );
  }

  // Metric tiles for the overview grid
  const metrics = [
    {
      label: "Total",
      value: stats.totalReports,
      icon: <FileTextOutlined className="text-blue-500" />,
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "Submitted",
      value: stats.submittedReports,
      icon: <SendOutlined className="text-cyan-500" />,
      color: "text-cyan-600 dark:text-cyan-400",
    },
    {
      label: "Approved",
      value: stats.approvedReports,
      icon: <CheckCircleOutlined className="text-green-500" />,
      color: "text-green-600 dark:text-green-400",
    },
    {
      label: "Drafts",
      value: stats.draftReports,
      icon: <EditOutlined className="text-gray-500" />,
      color: "text-gray-600 dark:text-gray-400",
    },
    {
      label: "Needs Edits",
      value: stats.requiresEditsReports,
      icon: <WarningOutlined className="text-orange-500" />,
      color: "text-orange-600 dark:text-orange-400",
    },
    {
      label: "Overdue",
      value: stats.overdueReports,
      icon: <ClockCircleOutlined className="text-red-500" />,
      color: "text-red-600 dark:text-red-400",
    },
  ];

  // Compliance color logic
  const compliancePercent = Math.round(stats.complianceRate);
  const complianceColor =
    compliancePercent >= 80
      ? "#52c41a"
      : compliancePercent >= 50
        ? "#faad14"
        : "#ff4d4f";

  return (
    <Card
      title={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileTextOutlined className="text-blue-500" />
            <span>Reports Overview</span>
            {stats.overdueReports > 0 && (
              <Tooltip title={`${stats.overdueReports} overdue report${stats.overdueReports !== 1 ? "s" : ""}`}>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                  {stats.overdueReports} overdue
                </span>
              </Tooltip>
            )}
          </div>
          <Link
            href={reportsPath}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            View All <RightOutlined />
          </Link>
        </div>
      }
      className="shadow-sm"
    >
      <div className="space-y-5">
        {/* Compliance Rate */}
        <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
          <Progress
            type="circle"
            percent={compliancePercent}
            size={64}
            strokeColor={complianceColor}
            format={(pct) => `${pct}%`}
          />
          <div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Compliance Rate
            </div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {compliancePercent >= 80
                ? "On Track"
                : compliancePercent >= 50
                  ? "Needs Attention"
                  : "Below Target"}
            </div>
            <div className="text-xs text-gray-400 dark:text-gray-500">
              {stats.approvedReports} of {stats.totalReports} reports approved
            </div>
          </div>
          {stats.lockedReports > 0 && (
            <Tooltip title={`${stats.lockedReports} locked report${stats.lockedReports !== 1 ? "s" : ""}`}>
              <div className="ml-auto flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <LockOutlined />
                <span>{stats.lockedReports} locked</span>
              </div>
            </Tooltip>
          )}
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="text-center p-2 rounded-lg border border-gray-100 dark:border-slate-600 hover:shadow-sm transition-shadow"
            >
              <div className="mb-1">{metric.icon}</div>
              <div className={`text-xl font-bold ${metric.color}`}>
                {metric.value}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {metric.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
