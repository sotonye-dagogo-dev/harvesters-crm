"use client";

import DashboardLayout from "@/components/features/navigation/DashboardLayout";
import { StatCard } from "@/components/ui/Card";
import {
  TeamOutlined,
  UserOutlined,
  CalendarOutlined,
  PhoneOutlined,
  BarChartOutlined,
  PieChartOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import { Spin, Button } from "antd";

export default function SuperadminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] =
    useState<SuperadminDashboardAnalytics | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch("/api/analytics/overview");
        if (response.ok) {
          const data = await response.json();
          // API returns data in overview property
          setAnalytics({
            totalUsers: data.data.overview.totalUsers,
            totalGroups: data.data.overview.totalGroups,
            recentMeetings: data.data.overview.totalMeetings,
            recentInteractions: data.data.overview.totalInteractions,
            activeUsers: data.data.overview.activeUsers,
            activeGroups: data.data.overview.activeGroups,
          });
        }
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // Dynamic stats configuration
  const stats = [
    {
      title: "Total Members",
      value: analytics?.totalUsers || 0,
      icon: <UserOutlined />,
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Total Groups",
      value: analytics?.totalGroups || 0,
      icon: <TeamOutlined />,
      color: "text-green-600 dark:text-green-400",
    },
    {
      title: "Recent Meetings",
      value: analytics?.recentMeetings || 0,
      icon: <CalendarOutlined />,
      color: "text-purple-600 dark:text-purple-400",
    },
    {
      title: "Recent Interactions",
      value: analytics?.recentInteractions || 0,
      icon: <PhoneOutlined />,
      color: "text-orange-600 dark:text-orange-400",
    },
  ];

  // Dynamic active metrics configuration
  const activeMetrics = [
    {
      title: "Active Members",
      value: analytics?.activeUsers || 0,
      description: "Members are actively engaged",
    },
    {
      title: "Active Groups",
      value: analytics?.activeGroups || 0,
      description: "Groups meeting regularly",
    },
  ];

  // Quick actions configuration
  const quickActions = [
    {
      label: "Church-Wide Analytics",
      icon: <BarChartOutlined />,
      onClick: () => router.push("/superadmin/analytics"),
      type: "primary" as const,
    },
    {
      label: "Interest Insights",
      icon: <PieChartOutlined />,
      onClick: () => router.push("/superadmin/interests"),
    },
    {
      label: "Manage Groups",
      icon: <TeamOutlined />,
      onClick: () => router.push("/superadmin/groups"),
    },
  ];

  if (loading) {
    return (
      <DashboardLayout role="SUPERADMIN">
        <div className="flex items-center justify-center h-96">
          <Spin size="large" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="SUPERADMIN">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Dashboard
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Welcome to Church Fellowship CRM
            </p>
          </div>
          <Button
            type="primary"
            icon={<BarChartOutlined />}
            onClick={() => router.push("/superadmin/analytics")}
            className="w-full sm:w-auto"
          >
            View Analytics
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mx-2 sm:mx-0">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mx-2 sm:mx-0">
          {activeMetrics.map((metric, index) => (
            <Card
              key={index}
              title={metric.title}
              className="h-full bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700"
            >
              <div className="text-center py-8">
                <div className="text-4xl font-bold text-church-primary dark:text-green-400 mb-2">
                  {metric.value}
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  {metric.description}
                </p>
              </div>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card
          title="Quick Actions"
          className="mt-6 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mx-2 sm:mx-0">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                type={action.type || "default"}
                size="large"
                block
                icon={action.icon}
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
