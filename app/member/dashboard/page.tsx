"use client";

import { UserRole } from "@/lib/types";
import DashboardLayout from "@/components/features/navigation/DashboardLayout";
import { StatCard } from "@/components/ui/Card";
import {
  CalendarOutlined,
  PhoneOutlined,
  TeamOutlined,
  TrophyOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Spin, message } from "antd";
import { useAuth } from "@/providers/AuthProvider";

export default function MemberDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<MemberDashboardAnalytics | null>(
    null
  );
  const { user } = useAuth();

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/analytics/members/${user.id}`);

        if (!response.ok) {
          throw new Error("Failed to fetch analytics");
        }

        const result = await response.json();
        // API returns data in result.data
        setAnalytics(result.data);
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
        message.error(
          "Failed to load dashboard data. Please refresh the page."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user?.id]);

  const getEngagementColor = (level: string) => {
    switch (level) {
      case "HIGH":
        return "text-ds-status-success";
      case "MEDIUM":
        return "text-ds-chart-1";
      case "LOW":
        return "text-ds-chart-4";
      case "AT_RISK":
        return "text-ds-status-error";
      default:
        return "text-ds-text-secondary";
    }
  };

  // Dynamic stats configuration
  const stats = [
    {
      title: "Attendance Rate",
      value: `${analytics?.attendanceRate?.toFixed(1) || 0}%`,
      icon: <CalendarOutlined />,
      color: "text-ds-chart-1",
    },
    {
      title: "Meetings Attended",
      value: `${analytics?.meetingsAttended || 0}/${analytics?.totalMeetings || 0}`,
      icon: <TeamOutlined />,
      color: "text-ds-brand-accent",
    },
    {
      title: "Leader Interactions",
      value: analytics?.totalInteractions || 0,
      icon: <PhoneOutlined />,
      color: "text-ds-chart-3",
    },
    {
      title: "Engagement Level",
      value: analytics?.engagementLevel || "N/A",
      icon: <TrophyOutlined />,
      color: getEngagementColor(analytics?.engagementLevel || ""),
    },
  ];

  if (loading) {
    return (
      <DashboardLayout role={UserRole.MEMBER}>
        <div className="flex items-center justify-center h-96">
          <Spin size="large" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role={UserRole.MEMBER}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-ds-text-primary mb-2">
              My Dashboard
            </h2>
            <p className="text-ds-text-secondary">
              Track your fellowship engagement
            </p>
          </div>
          <Button
            icon={<BarChartOutlined />}
            onClick={() => router.push("/member/analytics")}
          >
            View Analytics
          </Button>
        </div>

        {user?.groupId ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mx-2 sm:mx-0">
              {stats.map((stat, index) => (
                <StatCard
                  key={index}
                  title={stat.title}
                  value={stat.value}
                  icon={stat.icon}
                  color={stat.color}
                />
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mx-2 sm:mx-0">
              <Card
                title="My Attendance"
                className="bg-ds-surface-elevated border-ds-border-base"
              >
                <div className="text-center py-8">
                  <div className="text-4xl font-bold text-ds-brand-accent mb-2">
                    {analytics?.attendanceRate?.toFixed(0) || 0}%
                  </div>
                  <p className="text-ds-text-secondary">
                    of meetings attended
                  </p>
                </div>
              </Card>

              <Card
                title="Keep Growing!"
                className="bg-ds-surface-elevated border-ds-border-base"
              >
                <div className="py-4 px-2">
                  <p className="text-ds-text-secondary mb-4">
                    Your engagement level is{" "}
                    <span
                      className={`font-semibold ${getEngagementColor(analytics?.engagementLevel || "")}`}
                    >
                      {analytics?.engagementLevel || "N/A"}
                    </span>
                  </p>
                  <ul className="text-sm text-ds-text-secondary space-y-2">
                    <li>✓ Attend fellowship meetings regularly</li>
                    <li>✓ Participate actively in discussions</li>
                    <li>✓ Stay connected with your fellowship leader</li>
                  </ul>
                </div>
              </Card>
            </div>
          </>
        ) : (
          <Card>
            <div className="text-center py-12">
              <TeamOutlined className="text-6xl text-ds-text-subtle mb-4" />
              <h3 className="text-lg font-semibold text-ds-text-secondary mb-2">
                Not in a Group
              </h3>
              <p className="text-ds-text-subtle">
                You haven&apos;t joined a fellowship group yet.
              </p>
              <p className="text-ds-text-subtle text-sm mt-2">
                Browse available groups and request to join one!
              </p>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
