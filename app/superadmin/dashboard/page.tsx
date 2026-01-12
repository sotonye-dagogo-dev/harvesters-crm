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

interface AnalyticsData {
  totalUsers: number;
  totalGroups: number;
  recentMeetings: number;
  recentInteractions: number;
  activeUsers: number;
  activeGroups: number;
}

export default function SuperadminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch("/api/analytics/overview");
        if (response.ok) {
          const data = await response.json();
          setAnalytics(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

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
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Dashboard</h2>
            <p className="text-gray-600 dark:text-gray-400">Welcome to Church Fellowship CRM</p>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <StatCard
            title="Total Members"
            value={analytics?.totalUsers || 0}
            icon={<UserOutlined />}
            color="text-blue-600 dark:text-blue-400"
          />
          <StatCard
            title="Total Groups"
            value={analytics?.totalGroups || 0}
            icon={<TeamOutlined />}
            color="text-green-600 dark:text-green-400"
          />
          <StatCard
            title="Recent Meetings"
            value={analytics?.recentMeetings || 0}
            icon={<CalendarOutlined />}
            color="text-purple-600 dark:text-purple-400"
          />
          <StatCard
            title="Recent Interactions"
            value={analytics?.recentInteractions || 0}
            icon={<PhoneOutlined />}
            color="text-orange-600 dark:text-orange-400"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          <Card title="Active Members" className="h-full bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
            <div className="text-center py-8">
              <div className="text-4xl font-bold text-church-primary dark:text-green-400 mb-2">
                {analytics?.activeUsers || 0}
              </div>
              <p className="text-gray-600 dark:text-gray-400">Members are actively engaged</p>
            </div>
          </Card>

          <Card title="Active Groups" className="h-full bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
            <div className="text-center py-8">
              <div className="text-4xl font-bold text-church-primary dark:text-green-400 mb-2">
                {analytics?.activeGroups || 0}
              </div>
              <p className="text-gray-600 dark:text-gray-400">Groups meeting regularly</p>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card title="Quick Actions" className="mt-6 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button
              type="primary"
              size="large"
              block
              icon={<BarChartOutlined />}
              onClick={() => router.push("/superadmin/analytics")}
            >
              Church-Wide Analytics
            </Button>
            <Button
              size="large"
              block
              icon={<PieChartOutlined />}
              onClick={() => router.push("/superadmin/interests")}
            >
              Interest Insights
            </Button>
            <Button
              size="large"
              block
              icon={<TeamOutlined />}
              onClick={() => router.push("/superadmin/groups")}
            >
              Manage Groups
            </Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
