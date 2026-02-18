"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Table, Button, Space, Spin, message, Typography } from "antd";
import {
  PlusOutlined,
  FileTextOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { ReportStatus, ReportPeriodType } from "@/lib/types";
import { useAuth } from "@/providers/AuthProvider";
import DashboardLayout from "@/components/features/navigation/DashboardLayout";
import {
  ReportStatusBadge,
  ReportDeadlineCountdown,
  ReportFilterBar,
} from "@/components/features/reports";
import type { ReportFilters } from "@/components/features/reports";
import { REPORT_PERIOD_LABELS } from "@/lib/constants/reports";
import { getRoleConfig } from "@/lib/constants/roles";

const { Title, Text } = Typography;

interface ReportListItem {
  id: string;
  templateId: string;
  campusId: string;
  periodType: ReportPeriodType;
  periodYear: number;
  periodMonth: number;
  periodWeek?: number;
  status: ReportStatus;
  submittedById: string;
  deadline: string;
  isDataEntry: boolean;
  createdAt: string;
  updatedAt: string;
  template?: { name: string };
  campus?: { name: string };
  submittedBy?: { firstName: string; lastName: string };
}

export default function LeaderReportsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const role = user?.role;

  const [reports, setReports] = useState<ReportListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [filters, setFilters] = useState<ReportFilters>({});
  const [campuses, setCampuses] = useState<Array<{ id: string; name: string }>>([]);
  const [templates, setTemplates] = useState<Array<{ id: string; name: string }>>([]);

  const roleConfig = role ? getRoleConfig(role) : null;
  const canCreate = roleConfig?.canCreateReports ?? false;

  // Fetch reports with current filters
  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("pageSize", String(pageSize));
      if (filters.status) params.set("status", filters.status);
      if (filters.periodType) params.set("periodType", filters.periodType);
      if (filters.campusId) params.set("campusId", filters.campusId);
      if (filters.templateId) params.set("templateId", filters.templateId);

      const response = await fetch(`/api/reports?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch reports");

      const data = await response.json();
      setReports(data.data || []);
      setTotal(data.pagination?.total || 0);
    } catch {
      message.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filters]);

  // Fetch campuses and templates for filters
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const [campusRes, templateRes] = await Promise.all([
          fetch("/api/campuses"),
          fetch("/api/report-templates"),
        ]);

        if (campusRes.ok) {
          const campusData = await campusRes.json();
          setCampuses(
            (campusData.data || []).map((c: { id: string; name: string }) => ({
              id: c.id,
              name: c.name,
            }))
          );
        }

        if (templateRes.ok) {
          const templateData = await templateRes.json();
          setTemplates(
            (templateData.data || []).map((t: { id: string; name: string }) => ({
              id: t.id,
              name: t.name,
            }))
          );
        }
      } catch {
        // Non-critical; filters will just have fewer options
      }
    };

    fetchFilterData();
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const columns: ColumnsType<ReportListItem> = [
    {
      title: "Period",
      key: "period",
      render: (_, record) => (
        <div className="flex flex-col">
          <Text className="font-medium">
            {REPORT_PERIOD_LABELS[record.periodType]} — {record.periodYear}
          </Text>
          <Text className="text-xs text-gray-500">
            {record.periodType === ReportPeriodType.WEEKLY
              ? `Week ${record.periodWeek ?? record.periodMonth}`
              : `Month ${record.periodMonth}`}
          </Text>
        </div>
      ),
      sorter: (a, b) =>
        a.periodYear * 100 + a.periodMonth - (b.periodYear * 100 + b.periodMonth),
    },
    {
      title: "Template",
      key: "template",
      render: (_, record) => (
        <Text className="text-sm">{record.template?.name ?? "—"}</Text>
      ),
    },
    {
      title: "Campus",
      key: "campus",
      render: (_, record) => (
        <Text className="text-sm">{record.campus?.name ?? "—"}</Text>
      ),
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => <ReportStatusBadge status={record.status} />,
      filters: Object.values(ReportStatus).map((s) => ({
        text: s,
        value: s,
      })),
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Deadline",
      key: "deadline",
      render: (_, record) => (
        <ReportDeadlineCountdown deadline={record.deadline} />
      ),
      sorter: (a, b) =>
        new Date(a.deadline).getTime() - new Date(b.deadline).getTime(),
    },
    {
      title: "Submitted By",
      key: "submittedBy",
      render: (_, record) =>
        record.submittedBy
          ? `${record.submittedBy.firstName} ${record.submittedBy.lastName}`
          : "—",
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 120,
      render: (_, record) => (
        <Button
          type="link"
          icon={<FileTextOutlined />}
          onClick={() => router.push(`/leader/reports/${record.id}`)}
        >
          View
        </Button>
      ),
    },
  ];

  if (!role) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role={role}>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Title level={3} className="!mb-0">
              Reports
            </Title>
            <Text className="text-gray-500">
              {roleConfig?.label} — Manage and track your reports
            </Text>
          </div>

          <Space>
            <Button icon={<ReloadOutlined />} onClick={fetchReports}>
              Refresh
            </Button>
            {canCreate && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => router.push("/leader/reports/new")}
              >
                New Report
              </Button>
            )}
          </Space>
        </div>

        {/* Filters */}
        <ReportFilterBar
          filters={filters}
          onChange={(f) => {
            setFilters(f);
            setPage(1);
          }}
          campuses={campuses}
          templates={templates}
          showCampusFilter={
            roleConfig?.reportVisibilityScope === "all" ||
            roleConfig?.reportVisibilityScope === "group"
          }
        />

        {/* Table */}
        <Table
          dataSource={reports}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            pageSize,
            total,
            onChange: (p) => setPage(p),
            showTotal: (t) => `${t} reports`,
            showSizeChanger: false,
          }}
          scroll={{ x: 900 }}
          onRow={(record) => ({
            onClick: () => router.push(`/leader/reports/${record.id}`),
            className: "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800",
          })}
        />
      </div>
    </DashboardLayout>
  );
}
