"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  Button,
} from "antd";
import {
  TeamOutlined,
  UsergroupAddOutlined,
  TrophyOutlined,
  WarningOutlined,
  DownloadOutlined,
  RiseOutlined,
  FallOutlined,
  MinusOutlined,
} from "@ant-design/icons";
import { StatCard } from "@/components/ui/Card";
import type { ColumnsType } from "antd/es/table";

interface GroupPerformance {
  group: Group;
  memberCount: number;
  meetingCount: number;
  averageAttendance: number;
  activeMembers: number;
  atRiskMembers: number;
  performanceScore: number;
  trend: "improving" | "stable" | "declining";
}

export default function ChurchAnalyticsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<{
    totalMembers: number;
    totalGroups: number;
    totalMeetings: number;
    overallEngagement: number;
    activeMembers: number;
    inactiveMembers: number;
    atRiskMembers: number;
    groupPerformance: GroupPerformance[];
  } | null>(null);

  useEffect(() => {
    if (user?.role === "SUPERADMIN") {
      fetchAnalytics();
    } else {
      router.push("/dashboard");
    }
  }, [user]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/analytics/church");
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

  const exportReport = () => {
    if (!analytics) return;

    const csvContent = [
      ["Church Fellowship CRM - Analytics Report"],
      ["Generated:", new Date().toLocaleString()],
      [],
      ["Overall Statistics"],
      ["Total Members", analytics.totalMembers],
      ["Active Members", analytics.activeMembers],
      ["Inactive Members", analytics.inactiveMembers],
      ["At Risk Members", analytics.atRiskMembers],
      ["Total Groups", analytics.totalGroups],
      ["Total Meetings", analytics.totalMeetings],
      ["Overall Engagement", `${analytics.overallEngagement.toFixed(1)}%`],
      [],
      ["Group Performance"],
      [
        "Group Name",
        "Members",
        "Meetings",
        "Avg Attendance",
        "Active",
        "At Risk",
        "Score",
        "Trend",
      ],
      ...analytics.groupPerformance.map((g) => [
        g.group.name,
        g.memberCount,
        g.meetingCount,
        `${g.averageAttendance.toFixed(1)}%`,
        g.activeMembers,
        g.atRiskMembers,
        g.performanceScore,
        g.trend,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `church-analytics-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    message.success("Report exported successfully");
  };

  if (user?.role !== "SUPERADMIN") {
    return null;
  }

  if (loading) {
    return (
      <DashboardLayout role="SUPERADMIN">
        <div className="flex items-center justify-center h-96">
          <Spin size="large" />
        </div>
      </DashboardLayout>
    );
  }

  if (!analytics) {
    return (
      <DashboardLayout role="SUPERADMIN">
        <div className="text-center py-12">
          <Card className="bg-white dark:bg-slate-800">
            <Empty description="Analytics data not available" />
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const columns: ColumnsType<GroupPerformance> = [
    {
      title: "Group",
      key: "group",
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.group.name}</div>
          <div className="text-sm text-gray-500">
            {record.group.meetingFrequency}
          </div>
        </div>
      ),
      sorter: (a, b) => a.group.name.localeCompare(b.group.name),
    },
    {
      title: "Members",
      dataIndex: "memberCount",
      key: "members",
      align: "center" as const,
      sorter: (a, b) => a.memberCount - b.memberCount,
    },
    {
      title: "Meetings",
      dataIndex: "meetingCount",
      key: "meetings",
      align: "center" as const,
      sorter: (a, b) => a.meetingCount - b.meetingCount,
    },
    {
      title: "Avg Attendance",
      key: "attendance",
      align: "center" as const,
      render: (_, record) => (
        <div className="flex flex-col items-center gap-1">
          <Progress
            percent={Math.round(record.averageAttendance)}
            size="small"
            strokeColor={
              record.averageAttendance >= 70
                ? "#52c41a"
                : record.averageAttendance >= 50
                  ? "#1890ff"
                  : "#ff4d4f"
            }
            style={{ width: "100px" }}
          />
        </div>
      ),
      sorter: (a, b) => a.averageAttendance - b.averageAttendance,
    },
    {
      title: "Active",
      dataIndex: "activeMembers",
      key: "active",
      align: "center" as const,
      sorter: (a, b) => a.activeMembers - b.activeMembers,
    },
    {
      title: "At Risk",
      dataIndex: "atRiskMembers",
      key: "atRisk",
      align: "center" as const,
      render: (value) => (
        <Tag color={value > 0 ? "error" : "success"}>{value}</Tag>
      ),
      sorter: (a, b) => a.atRiskMembers - b.atRiskMembers,
    },
    {
      title: "Score",
      key: "score",
      align: "center" as const,
      render: (_, record) => (
        <Progress
          type="circle"
          percent={record.performanceScore}
          size={50}
          strokeColor={
            record.performanceScore >= 80
              ? "#52c41a"
              : record.performanceScore >= 60
                ? "#1890ff"
                : "#ff4d4f"
          }
        />
      ),
      sorter: (a, b) => a.performanceScore - b.performanceScore,
    },
    {
      title: "Trend",
      key: "trend",
      align: "center" as const,
      render: (_, record) => {
        const trendConfig = {
          improving: {
            icon: <RiseOutlined />,
            color: "success",
            label: "Improving",
          },
          stable: {
            icon: <MinusOutlined />,
            color: "default",
            label: "Stable",
          },
          declining: {
            icon: <FallOutlined />,
            color: "error",
            label: "Declining",
          },
        };
        const config = trendConfig[record.trend];
        return (
          <Tag icon={config.icon} color={config.color}>
            {config.label}
          </Tag>
        );
      },
      filters: [
        { text: "Improving", value: "improving" },
        { text: "Stable", value: "stable" },
        { text: "Declining", value: "declining" },
      ],
      onFilter: (value, record) => record.trend === value,
    },
  ];

  return (
    <DashboardLayout role="SUPERADMIN">
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Church-Wide Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Comprehensive overview of all groups and members
            </p>
          </div>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={exportReport}
          >
            Export Report
          </Button>
        </div>

        {/* Key Metrics */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Total Members"
              value={analytics.totalMembers}
              icon={<TeamOutlined />}
              color="text-blue-600"
              description="Across all groups"
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
              title="Total Groups"
              value={analytics.totalGroups}
              icon={<UsergroupAddOutlined />}
              color="text-purple-600"
              description={`${analytics.totalMeetings} meetings`}
            />
          </Col>
        </Row>

        {/* Overall Engagement Card */}
        <Card title="Overall Church Engagement" className="mb-6">
          <div className="flex flex-col md:flex-row items-center justify-around gap-8">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-4">
                Average Engagement Score
              </div>
              <Progress
                type="circle"
                percent={Math.round(analytics.overallEngagement)}
                size={180}
                strokeColor={
                  analytics.overallEngagement >= 70
                    ? "#52c41a"
                    : analytics.overallEngagement >= 50
                      ? "#1890ff"
                      : "#ff4d4f"
                }
              />
              <div className="mt-4">
                <Tag
                  color={
                    analytics.overallEngagement >= 70
                      ? "success"
                      : analytics.overallEngagement >= 50
                        ? "processing"
                        : "error"
                  }
                  className="text-sm"
                >
                  {analytics.overallEngagement >= 70
                    ? "Excellent"
                    : analytics.overallEngagement >= 50
                      ? "Good"
                      : "Needs Improvement"}
                </Tag>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {analytics.activeMembers}
                </div>
                <div className="text-sm text-gray-600 mt-1">Active Members</div>
                <div className="text-xs text-gray-500 mt-1">
                  {(
                    (analytics.activeMembers / analytics.totalMembers) *
                    100
                  ).toFixed(1)}
                  % of total
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-400">
                  {analytics.inactiveMembers}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Inactive Members
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {(
                    (analytics.inactiveMembers / analytics.totalMembers) *
                    100
                  ).toFixed(1)}
                  % of total
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">
                  {analytics.atRiskMembers}
                </div>
                <div className="text-sm text-gray-600 mt-1">At Risk</div>
                <div className="text-xs text-gray-500 mt-1">
                  {(
                    (analytics.atRiskMembers / analytics.totalMembers) *
                    100
                  ).toFixed(1)}
                  % of total
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {analytics.totalMeetings}
                </div>
                <div className="text-sm text-gray-600 mt-1">Total Meetings</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  All groups
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Group Comparative Performance */}
        <Card
          title="Group Comparative Performance"
          className="bg-white dark:bg-slate-800"
        >
          <Table
            columns={columns}
            dataSource={analytics.groupPerformance}
            rowKey={(record) => record.group.id}
            pagination={{
              pageSize: 20,
              showTotal: (total) => `${total} group${total !== 1 ? "s" : ""}`,
            }}
            locale={{
              emptyText: <Empty description="No group data available" />,
            }}
            className="[&_.ant-table]:bg-white dark:[&_.ant-table]:bg-slate-800 [&_.ant-table-thead>tr>th]:bg-gray-50 dark:[&_.ant-table-thead>tr>th]:bg-slate-700 [&_.ant-table-thead>tr>th]:text-gray-900 dark:[&_.ant-table-thead>tr>th]:text-white [&_.ant-table-tbody>tr>td]:bg-white dark:[&_.ant-table-tbody>tr>td]:bg-slate-800 [&_.ant-table-tbody>tr>td]:text-gray-900 dark:[&_.ant-table-tbody>tr>td]:text-gray-200 [&_.ant-table-tbody>tr:hover>td]:bg-gray-50 dark:[&_.ant-table-tbody>tr:hover>td]:bg-slate-700"
          />
        </Card>
      </div>
    </DashboardLayout>
  );
}
