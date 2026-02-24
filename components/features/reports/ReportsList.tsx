"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Table,
  Select,
  Input,
  Button,
  Space,
  Typography,
  Empty,
  Spin,
} from "antd";
import {
  FilterOutlined,
  ReloadOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import Link from "next/link";
import ReportStatusBadge from "./ReportStatusBadge";
import { REPORT_STATUS_LABELS } from "@/lib/constants";
import { getReportPeriodLabel } from "@/lib/utils/reporting";
import { ReportFrequency, ReportStatus } from "@/lib/types";

const { Title } = Typography;
const { Search } = Input;

interface ReportsListProps {
  basePath?: string;
  createPath?: string;
  title?: string;
  showFilters?: boolean;
  showSubmitter?: boolean;
  apiUrl?: string;
}

interface EnrichedReport extends ReportSubmission {
  reportTypeName?: string;
  reportTypeCode?: string;
  submitterName?: string;
  frequency?: ReportFrequency;
}

export default function ReportsList({
  basePath = "/leader/reports",
  createPath,
  title = "Reports",
  showFilters = true,
  showSubmitter = false,
  apiUrl = "/api/reports",
}: ReportsListProps) {
  const [reports, setReports] = useState<EnrichedReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(pagination.current));
      params.set("pageSize", String(pagination.pageSize));
      if (statusFilter) params.set("status", statusFilter);
      if (search) params.set("search", search);

      const response = await fetch(`${apiUrl}?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setReports(data.data ?? []);
        setPagination((prev) => ({
          ...prev,
          total: data.pagination?.total ?? 0,
        }));
      }
    } catch {
      // Error handled silently — empty state shown
    } finally {
      setLoading(false);
    }
  }, [apiUrl, pagination.current, pagination.pageSize, statusFilter, search]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const columns: ColumnsType<EnrichedReport> = [
    {
      title: "Report Type",
      dataIndex: "reportTypeName",
      key: "reportTypeName",
      render: (name: string, record) => (
        <Link
          href={`${basePath}/${record.id}`}
          className="text-green-700 hover:text-green-900 font-medium"
        >
          {name ?? "—"}
        </Link>
      ),
    },
    {
      title: "Period",
      key: "period",
      render: (_, record) =>
        getReportPeriodLabel(
          record.frequency ?? ReportFrequency.WEEKLY,
          record.reportWeek,
          record.reportMonth,
          undefined,
          record.reportYear
        ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: ReportStatus) => <ReportStatusBadge status={status} />,
      filters: Object.entries(REPORT_STATUS_LABELS).map(([value, text]) => ({
        text,
        value,
      })),
      onFilter: (value, record) => record.status === value,
    },
    ...(showSubmitter
      ? [
          {
            title: "Submitted By",
            dataIndex: "submitterName",
            key: "submitterName",
            render: (name: string) => name ?? "—",
          } as ColumnsType<EnrichedReport>[number],
        ]
      : []),
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) =>
        new Date(date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      sorter: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      defaultSortOrder: "descend",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Title level={4} className="!mb-0">
          {title}
        </Title>
        <div className="flex items-center gap-2">
          <Button icon={<ReloadOutlined />} onClick={fetchReports} />
          {createPath && (
            <Link href={createPath}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                className="!bg-green-600 hover:!bg-green-700"
              >
                New Report
              </Button>
            </Link>
          )}
        </div>
      </div>

      {showFilters && (
        <Space wrap>
          <Select
            placeholder="Filter by status"
            allowClear
            style={{ width: 180 }}
            onChange={setStatusFilter}
            value={statusFilter}
            options={Object.entries(REPORT_STATUS_LABELS).map(
              ([value, label]) => ({ value, label })
            )}
            suffixIcon={<FilterOutlined />}
          />
          <Search
            placeholder="Search reports..."
            allowClear
            style={{ width: 240 }}
            onSearch={setSearch}
          />
        </Space>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Spin size="large" />
        </div>
      ) : reports.length === 0 ? (
        <Empty
          description="No reports found"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          {createPath && (
            <Link href={createPath}>
              <Button
                type="primary"
                className="!bg-green-600 hover:!bg-green-700"
              >
                Create Your First Report
              </Button>
            </Link>
          )}
        </Empty>
      ) : (
        <Table
          columns={columns}
          dataSource={reports}
          rowKey="id"
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `${total} reports`,
            onChange: (page, pageSize) =>
              setPagination((prev) => ({
                ...prev,
                current: page,
                pageSize,
              })),
          }}
          scroll={{ x: 800 }}
          size="middle"
        />
      )}
    </div>
  );
}
