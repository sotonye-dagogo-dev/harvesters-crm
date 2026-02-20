"use client";

import { UserRole } from "@/lib/types";
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
import Button from "@/components/ui/Button";
import { Spin } from "antd";
import { ReportOverviewWidget } from "@/components/features/reports";

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
            totalCampuses: data.data.overview.totalCampuses || 0,
            totalZones: data.data.overview.totalZones || 0,
            totalGroups: data.data.overview.totalGroups,
            totalCells: data.data.overview.totalCells || 0,
            recentMeetings: data.data.overview.totalMeetings,
            recentInteractions: data.data.overview.totalInteractions,
            activeUsers: data.data.overview.activeUsers,
            activeGroups: data.data.overview.activeGroups,
            activeCampaigns: 0,
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
      color: "text-ds-chart-1",
    },
    {
      title: "Total Groups",
      value: analytics?.totalGroups || 0,
      icon: <TeamOutlined />,
      color: "text-ds-brand-accent",
    },
    {
      title: "Recent Meetings",
      value: analytics?.recentMeetings || 0,
      icon: <CalendarOutlined />,
      color: "text-ds-chart-3",
    },
    {
      title: "Recent Interactions",
      value: analytics?.recentInteractions || 0,
      icon: <PhoneOutlined />,
      color: "text-ds-chart-4",
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
      variant: "primary" as const,
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
      <DashboardLayout role={UserRole.SUPERADMIN}>
        <div className="flex items-center justify-center h-96">
          <Spin size="large" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role={UserRole.SUPERADMIN}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-ds-text-primary mb-2">
              Dashboard
            </h2>
            <p className="text-ds-text-secondary">
              Welcome to Harvesters Small Groups CRM
            </p>
          </div>
          <Button
            icon={<BarChartOutlined />}
            onClick={() => router.push("/superadmin/analytics")}
            className="w-full sm:w-auto"
          >
            View Analytics
          </Button>
        </div>

        {/* Report Overview — prioritised first for leadership roles */}
        <ReportOverviewWidget />

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
              className="h-full bg-ds-surface-elevated border-ds-border-base"
            >
              <div className="text-center py-8">
                <div className="text-4xl font-bold text-ds-brand-accent mb-2">
                  {metric.value}
                </div>
                <p className="text-ds-text-secondary">
                  {metric.description}
                </p>
              </div>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card
          title="Quick Actions"
          className="mt-6 bg-ds-surface-elevated border-ds-border-base"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mx-2 sm:mx-0">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || "secondary"}
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
