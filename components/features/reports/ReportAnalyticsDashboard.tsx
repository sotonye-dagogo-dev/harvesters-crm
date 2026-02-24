"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Typography,
  Select,
  Spin,
  Empty,
  Tag,
} from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  WarningOutlined,
  RiseOutlined,
  FallOutlined,
} from "@ant-design/icons";
import {
  REPORT_STATUS_COLORS,
  PERFORMANCE_STATUS_COLORS,
} from "@/lib/constants";

const { Title, Text } = Typography;

interface ReportAnalyticsDashboardProps {
  defaultYear?: number;
}

interface AnalyticsData {
  compliance: {
    totalExpected: number;
    totalSubmitted: number;
    onTimeSubmissions: number;
    lateSubmissions: number;
    pendingSubmissions: number;
    missingSubmissions: number;
    complianceRate: number;
  };
  overview: {
    totalSubmissions: number;
    byStatus: Record<string, number>;
    byType: Record<string, number>;
    monthOverMonthChange: number;
  };
  typeBreakdown: Array<{
    reportTypeId: string;
    reportTypeName: string;
    reportTypeCode: string;
    total: number;
    approved: number;
    pending: number;
    drafts: number;
    requiresEdits: number;
    avgCompletionRate: number;
  }>;
  monthlyTrend: Array<{
    month: number;
    year: number;
    label: string;
    total: number;
    approved: number;
    submitted: number;
  }>;
}

export default function ReportAnalyticsDashboard({
  defaultYear,
}: ReportAnalyticsDashboardProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(defaultYear ?? new Date().getFullYear());

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics/reports?reportYear=${year}`);
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      }
    } catch {
      // Error handled — empty state shown
    } finally {
      setLoading(false);
    }
  }, [year]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spin size="large" />
      </div>
    );
  }

  if (!data) {
    return <Empty description="No analytics data available" />;
  }

  const { compliance, overview, typeBreakdown, monthlyTrend } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Title level={4} className="!mb-0">
          Report Analytics
        </Title>
        <Select
          value={year}
          onChange={setYear}
          style={{ width: 120 }}
          options={[
            { value: 2025, label: "2025" },
            { value: 2024, label: "2024" },
            { value: 2023, label: "2023" },
          ]}
        />
      </div>

      {/* Overview Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card size="small">
            <Statistic
              title="Total Submissions"
              value={overview.totalSubmissions}
              prefix={<FileTextOutlined className="text-blue-500" />}
              suffix={
                overview.monthOverMonthChange !== 0 ? (
                  <span
                    className={`text-xs ${
                      overview.monthOverMonthChange > 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {overview.monthOverMonthChange > 0 ? (
                      <RiseOutlined />
                    ) : (
                      <FallOutlined />
                    )}{" "}
                    {Math.abs(overview.monthOverMonthChange)}%
                  </span>
                ) : null
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card size="small">
            <Statistic
              title="Compliance Rate"
              value={compliance.complianceRate}
              suffix="%"
              prefix={<CheckCircleOutlined className="text-green-500" />}
              valueStyle={{
                color:
                  compliance.complianceRate >= 80
                    ? PERFORMANCE_STATUS_COLORS.EXCEEDING
                    : compliance.complianceRate >= 60
                      ? PERFORMANCE_STATUS_COLORS.ON_TRACK
                      : PERFORMANCE_STATUS_COLORS.BELOW_TARGET,
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card size="small">
            <Statistic
              title="Pending Review"
              value={compliance.pendingSubmissions}
              prefix={<ClockCircleOutlined className="text-orange-500" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card size="small">
            <Statistic
              title="Missing Reports"
              value={compliance.missingSubmissions}
              prefix={<WarningOutlined className="text-red-500" />}
              valueStyle={{
                color:
                  compliance.missingSubmissions > 0
                    ? PERFORMANCE_STATUS_COLORS.BELOW_TARGET
                    : PERFORMANCE_STATUS_COLORS.EXCEEDING,
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Compliance Progress */}
      <Card title="Submission Compliance" size="small">
        <div className="space-y-4">
          <Progress
            percent={compliance.complianceRate}
            strokeColor={
              compliance.complianceRate >= 80
                ? "#16a34a"
                : compliance.complianceRate >= 60
                  ? "#d97706"
                  : "#dc2626"
            }
            size="default"
          />
          <Row gutter={[16, 8]}>
            <Col xs={12} sm={6}>
              <Text type="secondary" className="block text-xs">
                On Time
              </Text>
              <Text strong className="text-green-600">
                {compliance.onTimeSubmissions}
              </Text>
            </Col>
            <Col xs={12} sm={6}>
              <Text type="secondary" className="block text-xs">
                Late
              </Text>
              <Text strong className="text-orange-600">
                {compliance.lateSubmissions}
              </Text>
            </Col>
            <Col xs={12} sm={6}>
              <Text type="secondary" className="block text-xs">
                Pending
              </Text>
              <Text strong className="text-blue-600">
                {compliance.pendingSubmissions}
              </Text>
            </Col>
            <Col xs={12} sm={6}>
              <Text type="secondary" className="block text-xs">
                Missing
              </Text>
              <Text strong className="text-red-600">
                {compliance.missingSubmissions}
              </Text>
            </Col>
          </Row>
        </div>
      </Card>

      {/* Status Distribution */}
      <Card title="Status Distribution" size="small">
        <Row gutter={[16, 8]}>
          {Object.entries(overview.byStatus).map(([status, count]) => (
            <Col key={status} xs={12} sm={8} md={4}>
              <div className="text-center py-2">
                <Tag color={REPORT_STATUS_COLORS[status] ?? "default"}>
                  {status}
                </Tag>
                <div className="mt-1">
                  <Text strong>{count}</Text>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Type Breakdown */}
      {typeBreakdown.length > 0 && (
        <Card title="Report Type Performance" size="small">
          <div className="space-y-4">
            {typeBreakdown.map((tb) => (
              <div
                key={tb.reportTypeId}
                className="flex items-center gap-4 flex-wrap"
              >
                <div className="min-w-[200px]">
                  <Text strong className="block text-sm">
                    {tb.reportTypeName}
                  </Text>
                  <Text type="secondary" className="text-xs">
                    {tb.total} submissions
                  </Text>
                </div>
                <div className="flex-1 min-w-[200px]">
                  <Progress
                    percent={tb.avgCompletionRate}
                    size="small"
                    strokeColor={
                      tb.avgCompletionRate >= 80
                        ? "#16a34a"
                        : tb.avgCompletionRate >= 60
                          ? "#d97706"
                          : "#dc2626"
                    }
                  />
                </div>
                <div className="flex gap-2">
                  <Tag color="green">{tb.approved} approved</Tag>
                  <Tag color="processing">{tb.pending} pending</Tag>
                  {tb.requiresEdits > 0 && (
                    <Tag color="warning">{tb.requiresEdits} edits</Tag>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Monthly Trend */}
      {monthlyTrend.length > 0 && (
        <Card title="Monthly Trend" size="small">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {monthlyTrend.map((month) => (
              <div
                key={`${month.year}-${month.month}`}
                className="text-center p-3 rounded-lg border dark:border-gray-700"
              >
                <Text type="secondary" className="block text-xs mb-1">
                  {month.label}
                </Text>
                <Text strong className="block text-lg">
                  {month.total}
                </Text>
                <div className="flex justify-center gap-1 mt-1">
                  <Tag color="green" className="!text-xs !m-0">
                    {month.approved}
                  </Tag>
                  <Tag color="processing" className="!text-xs !m-0">
                    {month.submitted}
                  </Tag>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
