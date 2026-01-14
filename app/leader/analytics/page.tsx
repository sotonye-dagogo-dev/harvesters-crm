"use client";

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
  Table,
  Empty,
  Alert,
} from "antd";
import {
  TeamOutlined,
  CalendarOutlined,
  TrophyOutlined,
  WarningOutlined,
  RiseOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { StatCard } from "@/components/ui/Card";
import type { ColumnsType } from "antd/es/table";

interface MemberPerformance {
  member: User;
  attendanceRate: number;
  meetingsAttended: number;
  totalMeetings: number;
  engagementScore: number;
  status: "excellent" | "good" | "fair" | "at-risk";
}

export default function GroupAnalyticsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<{
    groupName: string;
    totalMembers: number;
    activeMembers: number;
    atRiskMembers: number;
    averageAttendance: number;
    totalMeetings: number;
    meetingFrequencyAdherence: number;
    memberPerformance: MemberPerformance[];
    recentTrend: "improving" | "stable" | "declining";
  } | null>(null);

  useEffect(() => {
    if (user?.groupId) {
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/analytics/group/${user?.groupId}`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
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
      <DashboardLayout role="LEADER">
        <div className="flex items-center justify-center h-96">
          <Spin size="large" />
        </div>
      </DashboardLayout>
    );
  }

  if (!analytics) {
    return (
      <DashboardLayout role="LEADER">
        <div className="text-center py-12">
          <Card className="bg-white dark:bg-slate-800">
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
          <div className="font-medium">
            {record.member.firstName} {record.member.lastName}
          </div>
          <div className="text-sm text-gray-500">{record.member.email}</div>
        </div>
      ),
      sorter: (a, b) => a.member.firstName.localeCompare(b.member.firstName),
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
          <span className="text-xs text-gray-600">
            {record.meetingsAttended} / {record.totalMeetings}
          </span>
        </div>
      ),
      sorter: (a, b) => a.attendanceRate - b.attendanceRate,
    },
    {
      title: "Engagement",
      key: "engagement",
      align: "center" as const,
      render: (_, record) => (
        <div className="flex items-center justify-center gap-2">
          <Progress
            type="circle"
            percent={record.engagementScore}
            size={50}
            strokeColor={
              record.engagementScore >= 80
                ? "#52c41a"
                : record.engagementScore >= 60
                  ? "#1890ff"
                  : record.engagementScore >= 40
                    ? "#faad14"
                    : "#ff4d4f"
            }
          />
        </div>
      ),
      sorter: (a, b) => a.engagementScore - b.engagementScore,
    },
    {
      title: "Status",
      key: "status",
      align: "center" as const,
      render: (_, record) => {
        const statusConfig = {
          excellent: {
            label: "Excellent",
            color: "success",
            icon: <CheckCircleOutlined />,
          },
          good: {
            label: "Good",
            color: "processing",
            icon: <CheckCircleOutlined />,
          },
          fair: { label: "Fair", color: "warning", icon: <WarningOutlined /> },
          "at-risk": {
            label: "At Risk",
            color: "error",
            icon: <WarningOutlined />,
          },
        };
        const config = statusConfig[record.status];
        return (
          <Tag icon={config.icon} color={config.color}>
            {config.label}
          </Tag>
        );
      },
      filters: [
        { text: "Excellent", value: "excellent" },
        { text: "Good", value: "good" },
        { text: "Fair", value: "fair" },
        { text: "At Risk", value: "at-risk" },
      ],
      onFilter: (value, record) => record.status === value,
    },
  ];

  return (
    <DashboardLayout role="LEADER">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Group Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
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
              color="text-blue-600"
              description="In your group"
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Active Members"
              value={analytics.activeMembers}
              icon={<TrophyOutlined />}
              color="text-green-600"
              description={`${((analytics.activeMembers / analytics.totalMembers) * 100).toFixed(0)}% of total`}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="At Risk Members"
              value={analytics.atRiskMembers}
              icon={<WarningOutlined />}
              color="text-red-600"
              description="Need attention"
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Total Meetings"
              value={analytics.totalMeetings}
              icon={<CalendarOutlined />}
              color="text-purple-600"
              description="All time"
            />
          </Col>
        </Row>

        {/* Group Performance Card */}
        <Card
          title="Group Performance Overview"
          className="mb-6 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700"
        >
          <Row gutter={24}>
            <Col xs={24} md={8}>
              <div className="text-center p-4">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
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
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
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
                <div className="text-xs text-gray-500 mt-2">
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
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Recent Trend
                </div>
                <div className="flex flex-col items-center gap-2">
                  <RiseOutlined
                    className={`text-5xl ${
                      analytics.recentTrend === "improving"
                        ? "text-green-500"
                        : analytics.recentTrend === "stable"
                          ? "text-blue-500"
                          : "text-red-500"
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
          className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700"
        >
          <Table
            columns={columns}
            dataSource={analytics.memberPerformance}
            rowKey={(record) => record.member.id}
            pagination={{
              pageSize: 20,
              showTotal: (total) => `${total} member${total !== 1 ? "s" : ""}`,
            }}
            locale={{
              emptyText: <Empty description="No member data available" />,
            }}
            className="[&_.ant-table]:bg-white dark:[&_.ant-table]:bg-slate-800 [&_.ant-table-thead>tr>th]:bg-gray-50 dark:[&_.ant-table-thead>tr>th]:bg-slate-700 [&_.ant-table-thead>tr>th]:text-gray-900 dark:[&_.ant-table-thead>tr>th]:text-white [&_.ant-table-tbody>tr>td]:bg-white dark:[&_.ant-table-tbody>tr>td]:bg-slate-800 [&_.ant-table-tbody>tr>td]:text-gray-900 dark:[&_.ant-table-tbody>tr>td]:text-gray-200 [&_.ant-table-tbody>tr:hover>td]:bg-gray-50 dark:[&_.ant-table-tbody>tr:hover>td]:bg-slate-700"
          />
        </Card>
      </div>
    </DashboardLayout>
  );
}
