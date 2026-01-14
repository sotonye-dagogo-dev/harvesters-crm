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
  Statistic,
  Timeline,
  Empty,
} from "antd";
import {
  TrophyOutlined,
  CalendarOutlined,
  PhoneOutlined,
  RiseOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { format, differenceInDays } from "date-fns";
import { StatCard } from "@/components/ui/Card";

export default function MemberAnalyticsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<{
    attendancePercentage: number;
    totalMeetings: number;
    attendedMeetings: number;
    missedMeetings: number;
    interactionCount: number;
    lastInteractionDate: string | null;
    engagementScore: number;
    memberSince: string;
    recentActivity: Array<{
      id: string;
      type: string;
      title: string;
      date: string;
      status?: string;
    }>;
  } | null>(null);

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/analytics/member/${user?.id}`);
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

  if (loading) {
    return (
      <DashboardLayout role="MEMBER">
        <div className="flex items-center justify-center h-96">
          <Spin size="large" />
        </div>
      </DashboardLayout>
    );
  }

  if (!analytics) {
    return (
      <DashboardLayout role="MEMBER">
        <div className="text-center py-12">
          <Card className="bg-white dark:bg-slate-800">
            <Empty description="Analytics data not available" />
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const getEngagementLevel = (score: number) => {
    if (score >= 80) return { level: "Excellent", color: "success" };
    if (score >= 60) return { level: "Good", color: "processing" };
    if (score >= 40) return { level: "Fair", color: "warning" };
    return { level: "Needs Attention", color: "error" };
  };

  const engagementLevel = getEngagementLevel(analytics.engagementScore);
  const daysSinceMembership = differenceInDays(
    new Date(),
    new Date(analytics.memberSince)
  );

  return (
    <DashboardLayout role="MEMBER">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            My Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your engagement and participation over time
          </p>
        </div>

        {/* Engagement Score Card */}
        <Card className="bg-white dark:bg-slate-800">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center justify-center gap-2">
              <TrophyOutlined className="text-yellow-500" />
              Overall Engagement Score
            </h2>
            <Row gutter={24} align="middle" justify="center">
              <Col>
                <Progress
                  type="circle"
                  percent={Math.round(analytics.engagementScore)}
                  size={180}
                  strokeColor={
                    analytics.engagementScore >= 80
                      ? "#52c41a"
                      : analytics.engagementScore >= 60
                        ? "#1890ff"
                        : analytics.engagementScore >= 40
                          ? "#faad14"
                          : "#ff4d4f"
                  }
                  format={(percent) => (
                    <div className="flex flex-col items-center">
                      <div className="text-3xl font-bold text-gray-900 dark:text-white">
                        {percent}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Score
                      </div>
                    </div>
                  )}
                />
              </Col>
              <Col>
                <div className="text-left">
                  <Tag
                    color={engagementLevel.color}
                    className="text-lg px-4 py-2"
                  >
                    {engagementLevel.level}
                  </Tag>
                  <p className="text-gray-600 dark:text-gray-400 mt-4">
                    Your engagement score is calculated based on:
                  </p>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                    <li>• Meeting attendance (50%)</li>
                    <li>• Leader interactions (30%)</li>
                    <li>• Membership duration (20%)</li>
                  </ul>
                </div>
              </Col>
            </Row>
          </div>
        </Card>

        {/* Key Metrics */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Attendance Rate"
              value={`${analytics.attendancePercentage.toFixed(1)}%`}
              icon={<CheckCircleOutlined />}
              color="text-green-600"
              description={`${analytics.attendedMeetings} of ${analytics.totalMeetings} meetings`}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Meetings Attended"
              value={analytics.attendedMeetings}
              icon={<CalendarOutlined />}
              color="text-blue-600"
              description={`${analytics.missedMeetings} missed`}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Leader Interactions"
              value={analytics.interactionCount}
              icon={<PhoneOutlined />}
              color="text-purple-600"
              description={
                analytics.lastInteractionDate
                  ? `Last: ${format(new Date(analytics.lastInteractionDate), "MMM d")}`
                  : "No interactions yet"
              }
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Member Since"
              value={`${Math.round(daysSinceMembership / 30)} mo`}
              icon={<UserOutlined />}
              color="text-orange-600"
              description={format(new Date(analytics.memberSince), "MMM yyyy")}
            />
          </Col>
        </Row>

        {/* Attendance Breakdown */}
        <Card
          title="Attendance Breakdown"
          className="mb-6 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700"
        >
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Statistic
                title="Total Meetings"
                value={analytics.totalMeetings}
                prefix={<CalendarOutlined />}
                valueStyle={{ color: "#1B4B3E" }}
                className="[&_.ant-statistic-title]:text-gray-600 [&_.ant-statistic-title]:dark:text-gray-400"
              />
            </Col>
            <Col xs={24} md={12}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Attended
                  </span>
                  <div className="flex items-center gap-2">
                    <Progress
                      percent={analytics.attendancePercentage}
                      steps={10}
                      strokeColor="#52c41a"
                      style={{ width: 200 }}
                    />
                    <span className="font-semibold text-green-600">
                      {analytics.attendedMeetings}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Missed
                  </span>
                  <div className="flex items-center gap-2">
                    <Progress
                      percent={
                        analytics.totalMeetings > 0
                          ? (analytics.missedMeetings /
                              analytics.totalMeetings) *
                            100
                          : 0
                      }
                      steps={10}
                      strokeColor="#ff4d4f"
                      style={{ width: 200 }}
                    />
                    <span className="font-semibold text-red-600">
                      {analytics.missedMeetings}
                    </span>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Recent Activity Timeline */}
        <Card
          title="Recent Activity"
          extra={<RiseOutlined />}
          className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700"
        >
          {analytics.recentActivity && analytics.recentActivity.length > 0 ? (
            <Timeline
              items={analytics.recentActivity.map((activity) => ({
                dot:
                  activity.type === "meeting" ? (
                    activity.status === "attended" ? (
                      <CheckCircleOutlined style={{ color: "#52c41a" }} />
                    ) : (
                      <CloseCircleOutlined style={{ color: "#ff4d4f" }} />
                    )
                  ) : (
                    <PhoneOutlined style={{ color: "#1890ff" }} />
                  ),
                children: (
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {activity.title}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {format(
                        new Date(activity.date),
                        "MMM d, yyyy 'at' h:mm a"
                      )}
                    </div>
                  </div>
                ),
              }))}
            />
          ) : (
            <Empty
              description="No recent activity"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
