"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Card,
  Spin,
  message,
  Typography,
  Row,
  Col,
  Statistic,
  Progress,
} from "antd";
import Table from "@/components/ui/Table";
import Button from "@/components/ui/Button";
import FilterToolbar, { type FilterConfig } from "@/components/ui/FilterToolbar";
import {
  BarChartOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  LockOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useAuth } from "@/providers/AuthProvider";
import DashboardLayout from "@/components/features/navigation/DashboardLayout";

const { Title, Text } = Typography;

interface DashboardStats {
  totalReports: number;
  draftReports: number;
  submittedReports: number;
  approvedReports: number;
  requiresEditsReports: number;
  lockedReports: number;
  overdueReports: number;
  complianceRate: number;
}

interface ComplianceRow {
  campusId: string;
  campusName: string;
  totalExpected: number;
  submitted: number;
  onTime: number;
  late: number;
  missing: number;
  compliancePercentage: number;
}

interface MetricRow {
  metricName: string;
  totalGoal: number;
  totalAchieved: number;
  achievementRate: number;
  yoyGrowth: number;
  reportCount: number;
}

interface Campus {
  id: string;
  name: string;
}

export default function SuperadminReportAnalyticsPage() {
  const { user } = useAuth();
  const role = user?.role;

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [compliance, setCompliance] = useState<ComplianceRow[]>([]);
  const [metrics, setMetrics] = useState<MetricRow[]>([]);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [campusId, setCampusId] = useState<string | undefined>();
  const [periodYear, setPeriodYear] = useState<number | undefined>();
  const [loading, setLoading] = useState(true);

  const fetchCampuses = useCallback(async () => {
    try {
      const res = await fetch("/api/campuses");
      if (res.ok) {
        const data = await res.json();
        setCampuses(data.data || []);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (campusId) params.set("campusId", campusId);
      if (periodYear) params.set("periodYear", String(periodYear));
      // Always fetch metric aggregates by requesting metricName as empty — triggers via periodYear
      // The API returns metricAggregates when periodYear is set
      const qs = params.toString();
      const res = await fetch(`/api/analytics/reports${qs ? `?${qs}` : ""}`);
      if (!res.ok) throw new Error("Failed to fetch analytics");
      const data = await res.json();
      setStats(data.data?.dashboard || null);
      setCompliance(data.data?.compliance || []);
      setMetrics(data.data?.metricAggregates || []);
    } catch {
      message.error("Failed to load report analytics");
    } finally {
      setLoading(false);
    }
  }, [campusId, periodYear]);

  useEffect(() => {
    fetchCampuses();
  }, [fetchCampuses]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const complianceColumns: ColumnsType<ComplianceRow> = [
    { title: "Campus", dataIndex: "campusName", key: "campusName" },
    { title: "Expected", dataIndex: "totalExpected", key: "totalExpected", align: "center" },
    { title: "Submitted", dataIndex: "submitted", key: "submitted", align: "center" },
    {
      title: "On Time",
      dataIndex: "onTime",
      key: "onTime",
      align: "center",
      render: (v: number) => <Text className="text-ds-status-success">{v}</Text>,
    },
    {
      title: "Late",
      dataIndex: "late",
      key: "late",
      align: "center",
      render: (v: number) => <Text className={v > 0 ? "text-ds-chart-4" : ""}>{v}</Text>,
    },
    {
      title: "Missing",
      dataIndex: "missing",
      key: "missing",
      align: "center",
      render: (v: number) => <Text className={v > 0 ? "text-ds-status-error font-semibold" : ""}>{v}</Text>,
    },
    {
      title: "Compliance",
      dataIndex: "compliancePercentage",
      key: "compliancePercentage",
      align: "center",
      sorter: (a, b) => a.compliancePercentage - b.compliancePercentage,
      render: (pct: number) => (
        <Progress
          percent={pct}
          size="small"
          status={pct >= 80 ? "success" : pct >= 50 ? "normal" : "exception"}
        />
      ),
    },
  ];

  const metricColumns: ColumnsType<MetricRow> = [
    { title: "Metric", dataIndex: "metricName", key: "metricName" },
    {
      title: "Total Goal",
      dataIndex: "totalGoal",
      key: "totalGoal",
      align: "right",
      render: (v: number) => v.toLocaleString(),
    },
    {
      title: "Total Achieved",
      dataIndex: "totalAchieved",
      key: "totalAchieved",
      align: "right",
      render: (v: number) => v.toLocaleString(),
    },
    {
      title: "Achievement",
      dataIndex: "achievementRate",
      key: "achievementRate",
      align: "center",
      sorter: (a, b) => a.achievementRate - b.achievementRate,
      render: (pct: number) => (
        <Progress
          percent={pct}
          size="small"
          status={pct >= 100 ? "success" : pct >= 70 ? "normal" : "exception"}
        />
      ),
    },
    {
      title: "YoY Growth",
      dataIndex: "yoyGrowth",
      key: "yoyGrowth",
      align: "center",
      render: (v: number) => (
        <Text className={v >= 0 ? "text-ds-status-success" : "text-ds-status-error"}>{v >= 0 ? "+" : ""}{v}%</Text>
      ),
    },
    { title: "Reports", dataIndex: "reportCount", key: "reportCount", align: "center" },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const analyticsFilters: FilterConfig[] = useMemo(() => [
    {
      key: "campus",
      type: "select" as const,
      label: "Campus",
      placeholder: "All Campuses",
      options: campuses.map((c) => ({ label: c.name, value: c.id })),
      width: 180,
    },
    {
      key: "year",
      type: "select" as const,
      label: "Year",
      placeholder: "All Years",
      options: years.map((y) => ({ label: String(y), value: String(y) })),
      width: 120,
    },
  ], [campuses, years]);

  if (!role) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64"><Spin size="large" /></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role={role}>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Title level={3} className="!mb-0">Report Analytics</Title>
            <Text className="text-ds-text-subtle">
              Organization-wide reporting insights and compliance tracking
            </Text>
          </div>
        </div>

        <FilterToolbar
          filters={analyticsFilters}
          values={{ campus: campusId, year: periodYear ? String(periodYear) : undefined }}
          onChange={(key, value) => {
            if (key === "campus") setCampusId(value as string | undefined);
            if (key === "year") setPeriodYear(value ? Number(value) : undefined);
          }}
          onReset={() => {
            setCampusId(undefined);
            setPeriodYear(undefined);
          }}
          actions={
            <Button icon={<ReloadOutlined />} variant="secondary" onClick={fetchAnalytics}>Refresh</Button>
          }
        />

        {/* Stat Cards */}
        {loading && !stats ? (
          <div className="flex justify-center py-12"><Spin size="large" /></div>
        ) : stats ? (
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Total Reports"
                  value={stats.totalReports}
                  prefix={<FileTextOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Approved"
                  value={stats.approvedReports}
                  valueStyle={{ color: "#52c41a" }}
                  prefix={<CheckCircleOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Overdue"
                  value={stats.overdueReports}
                  valueStyle={stats.overdueReports > 0 ? { color: "#ff4d4f" } : undefined}
                  prefix={<WarningOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Compliance Rate"
                  value={stats.complianceRate}
                  suffix="%"
                  prefix={<BarChartOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic title="Drafts" value={stats.draftReports} prefix={<ClockCircleOutlined />} />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="Requires Edits"
                  value={stats.requiresEditsReports}
                  valueStyle={stats.requiresEditsReports > 0 ? { color: "#faad14" } : undefined}
                  prefix={<WarningOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic title="Locked" value={stats.lockedReports} prefix={<LockOutlined />} />
              </Card>
            </Col>
          </Row>
        ) : null}

        {/* Campus Compliance */}
        <Card title="Campus Compliance Summary">
          <Table
            dataSource={compliance}
            columns={complianceColumns}
            rowKey="campusId"
            loading={loading}
            pagination={false}
            size="middle"
          />
        </Card>

        {/* Metric Aggregates */}
        {metrics.length > 0 && (
          <Card title="Metric Aggregates">
            <Table
              dataSource={metrics}
              columns={metricColumns}
              rowKey="metricName"
              loading={loading}
              pagination={false}
              size="middle"
            />
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
