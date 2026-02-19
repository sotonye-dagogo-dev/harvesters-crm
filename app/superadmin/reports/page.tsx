"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Table, Button, Space, Spin, message, Typography, Tag } from "antd";
import {
  EyeOutlined,
  ReloadOutlined,
  FileTextOutlined,
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
import {
  REPORT_PERIOD_LABELS,
  REPORT_STATUS_LABELS,
} from "@/lib/constants/reports";

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

function SuperadminReportsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const role = user?.role;

  const [reports, setReports] = useState<ReportListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [filters, setFilters] = useState<ReportFilters>(() => {
    const groupId = searchParams.get("groupId");
    return groupId ? { groupId } : {};
  });
  const [groupName, setGroupName] = useState<string | null>(null);
  const [campuses, setCampuses] = useState<Array<{ id: string; name: string }>>(
    []
  );
  const [templates, setTemplates] = useState<
    Array<{ id: string; name: string }>
  >([]);

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
      if (filters.groupId) params.set("groupId", filters.groupId);

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

  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const [campusRes, templateRes] = await Promise.all([
          fetch("/api/campuses"),
          fetch("/api/report-templates"),
        ]);
        if (campusRes.ok) {
          const d = await campusRes.json();
          setCampuses(
            (d.data || []).map((c: { id: string; name: string }) => ({
              id: c.id,
              name: c.name,
            }))
          );
        }
        if (templateRes.ok) {
          const d = await templateRes.json();
          setTemplates(
            (d.data || []).map((t: { id: string; name: string }) => ({
              id: t.id,
              name: t.name,
            }))
          );
        }
      } catch {
        // non-critical
      }
    };
    fetchFilterData();

    // Resolve group name when a groupId filter is present from URL
    const urlGroupId = searchParams.get("groupId");
    if (urlGroupId) {
      fetch(`/api/groups/${urlGroupId}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d?.data?.name) setGroupName(d.data.name);
        })
        .catch(() => {});
    }
  }, [searchParams]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const columns: ColumnsType<ReportListItem> = [
    {
      title: "Period",
      key: "period",
      render: (_, r) => (
        <div className="flex flex-col">
          <Text className="font-medium">
            {REPORT_PERIOD_LABELS[r.periodType]} — {r.periodYear}
          </Text>
          <Text className="text-xs text-gray-500">
            {r.periodType === ReportPeriodType.WEEKLY
              ? `Week ${r.periodWeek ?? r.periodMonth}`
              : `Month ${r.periodMonth}`}
          </Text>
        </div>
      ),
      sorter: (a, b) =>
        a.periodYear * 100 +
        a.periodMonth -
        (b.periodYear * 100 + b.periodMonth),
    },
    {
      title: "Template",
      key: "template",
      render: (_, r) => (
        <Text className="text-sm">{r.template?.name ?? "—"}</Text>
      ),
    },
    {
      title: "Campus",
      key: "campus",
      render: (_, r) => (
        <Text className="text-sm">{r.campus?.name ?? "—"}</Text>
      ),
    },
    {
      title: "Status",
      key: "status",
      render: (_, r) => <ReportStatusBadge status={r.status} />,
      filters: Object.values(ReportStatus).map((s) => ({
        text: REPORT_STATUS_LABELS[s] || s,
        value: s,
      })),
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Deadline",
      key: "deadline",
      render: (_, r) => <ReportDeadlineCountdown deadline={r.deadline} />,
      sorter: (a, b) =>
        new Date(a.deadline).getTime() - new Date(b.deadline).getTime(),
    },
    {
      title: "Submitted By",
      key: "submittedBy",
      render: (_, r) =>
        r.submittedBy
          ? `${r.submittedBy.firstName} ${r.submittedBy.lastName}`
          : "—",
    },
    {
      title: "Data Entry",
      key: "dataEntry",
      render: (_, r) => (r.isDataEntry ? <Tag color="orange">DE</Tag> : null),
      width: 80,
    },
    {
      title: "",
      key: "actions",
      fixed: "right",
      width: 100,
      render: (_, r) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/superadmin/reports/${r.id}`);
          }}
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
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Title level={3} className="!mb-0">
              {filters.groupId && groupName
                ? `Reports — ${groupName}`
                : "All Reports"}
            </Title>
            <Text className="text-gray-500">
              {filters.groupId
                ? "Showing reports scoped to this group"
                : "Church-wide report oversight and management"}
            </Text>
            {filters.groupId && (
              <div className="mt-1">
                <Button
                  type="link"
                  size="small"
                  className="!p-0"
                  onClick={() => {
                    const { groupId: _, ...rest } = filters;
                    setFilters(rest);
                    setGroupName(null);
                    setPage(1);
                    // Remove groupId from URL
                    router.replace("/superadmin/reports");
                  }}
                >
                  Clear group filter
                </Button>
              </div>
            )}
          </div>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={fetchReports}>
              Refresh
            </Button>
            <Button
              icon={<FileTextOutlined />}
              onClick={() => router.push("/superadmin/reports/templates")}
            >
              Templates
            </Button>
          </Space>
        </div>

        <ReportFilterBar
          filters={filters}
          onChange={(f) => {
            setFilters(f);
            setPage(1);
          }}
          campuses={campuses}
          templates={templates}
          showCampusFilter
        />

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
          scroll={{ x: 1000 }}
          onRow={(record) => ({
            onClick: () => router.push(`/superadmin/reports/${record.id}`),
            className: "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800",
          })}
        />
      </div>
    </DashboardLayout>
  );
}

export default function SuperadminReportsPage() {
  return (
    <Suspense
      fallback={
        <DashboardLayout>
          <div className="flex justify-center items-center h-64">
            <Spin size="large" />
          </div>
        </DashboardLayout>
      }
    >
      <SuperadminReportsPageContent />
    </Suspense>
  );
}