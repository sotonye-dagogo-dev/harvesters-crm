"use client";

import { UserRole } from "@/lib/types";
import { useEffect, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import DashboardLayout from "@/components/features/navigation/DashboardLayout";
import {
  Card,
  Progress,
  Tag,
  Spin,
  message,
  Row,
  Col,
  Empty,
  Alert,
} from "antd";
import Table from "@/components/ui/Table";
import {
  TeamOutlined,
  CalendarOutlined,
  TrophyOutlined,
  WarningOutlined,
  RiseOutlined,
} from "@ant-design/icons";
import { StatCard } from "@/components/ui/Card";
import type { ColumnsType } from "antd/es/table";

interface MemberPerformance {
  memberId: string;
  memberName: string;
  totalMeetings: number;
  meetingsAttended: number;
  attendanceRate: number;
  totalInteractions: number;
  lastAttendance?: string;
}

export default function GroupAnalyticsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<LeaderAnalyticsResponse | null>(
    null
  );

  useEffect(() => {
    if (user?.groupId) {
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/analytics/group/${user?.groupId}`);
      if (response.ok) {
        const result = await response.json();
        setAnalytics(result.data);
      } else {
        message.error("Failed to load analytics");
      }
    } catch (error) {
      message.error("An error occurred");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!user?.groupId) {
    return (
      <div className="p-8">
        <Card>
          <Empty description="You are not assigned to a group" />
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <DashboardLayout role={UserRole.SMALL_GROUP_LEADER}>
        <div className="flex items-center justify-center h-96">
          <Spin size="large" />
        </div>
      </DashboardLayout>
    );
  }

  if (!analytics) {
    return (
      <DashboardLayout role={UserRole.SMALL_GROUP_LEADER}>
        <div className="text-center py-12">
          <Card className="bg-ds-surface-elevated">
            <Empty description="Analytics data not available" />
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const columns: ColumnsType<MemberPerformance> = [
    {
      title: "Member",
      key: "member",
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.memberName}</div>
          <div className="text-sm text-ds-text-subtle">{record.memberId}</div>
        </div>
      ),
      sorter: (a, b) => a.memberName.localeCompare(b.memberName),
    },
    {
      title: "Attendance",
      key: "attendance",
      align: "center" as const,
      render: (_, record) => (
        <div className="flex flex-col items-center gap-1">
          <Progress
            percent={Math.round(record.attendanceRate)}
            size="small"
            strokeColor={
              record.attendanceRate >= 80
                ? "#52c41a"
                : record.attendanceRate >= 60
                  ? "#1890ff"
                  : record.attendanceRate >= 40
                    ? "#faad14"
                    : "#ff4d4f"
            }
            style={{ width: "100px" }}
          />
          <span className="text-xs text-ds-text-secondary">
            {record.meetingsAttended} / {record.totalMeetings}
          </span>
        </div>
      ),
      sorter: (a, b) => a.attendanceRate - b.attendanceRate,
    },
    {
      title: "Interactions",
      key: "interactions",
      align: "center" as const,
      dataIndex: "totalInteractions",
      sorter: (a, b) => a.totalInteractions - b.totalInteractions,
    },
  ];

  return (
    <DashboardLayout role={UserRole.SMALL_GROUP_LEADER}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-ds-text-primary mb-2">
            Group Analytics Dashboard
          </h1>
          <p className="text-ds-text-secondary">
            {analytics.groupName}
          </p>
        </div>

        {/* Alert for At-Risk Members */}
        {analytics.atRiskMembers > 0 && (
          <Alert
            message="Attention Needed"
            description={`${analytics.atRiskMembers} member${analytics.atRiskMembers !== 1 ? "s" : ""} ${analytics.atRiskMembers !== 1 ? "are" : "is"} at risk of disengagement. Consider reaching out with a call or follow-up.`}
            type="warning"
            icon={<WarningOutlined />}
            showIcon
            className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
          />
        )}

        {/* Key Metrics */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Total Members"
              value={analytics.totalMembers}
              icon={<TeamOutlined />}
              color="text-ds-chart-1"
              description="In your group"
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Active Members"
              value={analytics.activeMembers}
              icon={<TrophyOutlined />}
              color="text-ds-status-success"
              description={`${((analytics.activeMembers / analytics.totalMembers) * 100).toFixed(0)}% of total`}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="At Risk Members"
              value={analytics.atRiskMembers}
              icon={<WarningOutlined />}
              color="text-ds-status-error"
              description="Need attention"
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Total Meetings"
              value={analytics.totalMeetings}
              icon={<CalendarOutlined />}
              color="text-ds-chart-3"
              description="All time"
            />
          </Col>
        </Row>

        {/* Group Performance Card */}
        <Card title="Group Performance Overview" className="mb-6">
          <Row gutter={24}>
            <Col xs={24} md={8}>
              <div className="text-center p-4">
                <div className="text-sm text-ds-text-secondary mb-2">
                  Average Attendance Rate
                </div>
                <Progress
                  type="circle"
                  percent={Math.round(analytics.averageAttendance)}
                  size={120}
                  strokeColor={
                    analytics.averageAttendance >= 70
                      ? "#52c41a"
                      : analytics.averageAttendance >= 50
                        ? "#1890ff"
                        : "#ff4d4f"
                  }
                />
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div className="text-center p-4">
                <div className="text-sm text-ds-text-secondary mb-2">
                  Meeting Frequency Adherence
                </div>
                <Progress
                  type="circle"
                  percent={Math.round(analytics.meetingFrequencyAdherence)}
                  size={120}
                  strokeColor={
                    analytics.meetingFrequencyAdherence >= 80
                      ? "#52c41a"
                      : analytics.meetingFrequencyAdherence >= 60
                        ? "#faad14"
                        : "#ff4d4f"
                  }
                />
                <div className="text-xs text-ds-text-subtle mt-2">
                  {analytics.meetingFrequencyAdherence >= 80
                    ? "On track"
                    : analytics.meetingFrequencyAdherence >= 60
                      ? "Needs improvement"
                      : "Behind schedule"}
                </div>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div className="text-center p-4">
                <div className="text-sm text-ds-text-secondary mb-2">Recent Trend</div>
                <div className="flex flex-col items-center gap-2">
                  <RiseOutlined
                    className={`text-5xl ${
                      analytics.recentTrend === "improving"
                        ? "text-ds-status-success"
                        : analytics.recentTrend === "stable"
                          ? "text-ds-chart-1"
                          : "text-ds-status-error"
                    }`}
                    style={{
                      transform:
                        analytics.recentTrend === "declining"
                          ? "rotate(180deg)"
                          : analytics.recentTrend === "stable"
                            ? "rotate(90deg)"
                            : "none",
                    }}
                  />
                  <Tag
                    color={
                      analytics.recentTrend === "improving"
                        ? "success"
                        : analytics.recentTrend === "stable"
                          ? "processing"
                          : "error"
                    }
                    className="text-sm"
                  >
                    {analytics.recentTrend.charAt(0).toUpperCase() +
                      analytics.recentTrend.slice(1)}
                  </Tag>
                </div>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Member Performance Table */}
        <Card
          title="Member Performance Breakdown"
          className="bg-ds-surface-elevated"
        >
          <Table
            columns={columns}
            dataSource={
              (analytics as any).memberEngagement ||
              analytics.memberPerformance ||
              []
            }
            rowKey={(record: any) => record.memberId || record.member?.id}
            scroll={{ x: 1200 }}
            pagination={{
              pageSize: 20,
              showTotal: (total) => `${total} member${total !== 1 ? "s" : ""}`,
            }}
            locale={{
              emptyText: <Empty description="No member data available" />,
            }}
            className="[&_.ant-table]:bg-ds-surface-elevated [&_.ant-table-thead>tr>th]:bg-ds-surface-sunken [&_.ant-table-thead>tr>th]:text-ds-text-primary [&_.ant-table-tbody>tr>td]:bg-ds-surface-elevated [&_.ant-table-tbody>tr>td]:text-ds-text-primary [&_.ant-table-tbody>tr:hover>td]:bg-ds-surface-sunken"
          />
        </Card>
      </div>
    </DashboardLayout>
  );
}
