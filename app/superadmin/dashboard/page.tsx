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
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h2>
            <p className="text-gray-600">Welcome to Church Fellowship CRM</p>
          </div>
          <Button
            type="primary"
            icon={<BarChartOutlined />}
            onClick={() => router.push("/analytics")}
          >
            View Analytics
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Members"
            value={analytics?.totalUsers || 0}
            icon={<UserOutlined />}
            color="text-blue-600"
          />
          <StatCard
            title="Total Groups"
            value={analytics?.totalGroups || 0}
            icon={<TeamOutlined />}
            color="text-green-600"
          />
          <StatCard
            title="Recent Meetings"
            value={analytics?.recentMeetings || 0}
            icon={<CalendarOutlined />}
            color="text-purple-600"
          />
          <StatCard
            title="Recent Interactions"
            value={analytics?.recentInteractions || 0}
            icon={<PhoneOutlined />}
            color="text-orange-600"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Active Members" className="h-full">
            <div className="text-center py-8">
              <div className="text-4xl font-bold text-church-primary mb-2">
                {analytics?.activeUsers || 0}
              </div>
              <p className="text-gray-600">Members are actively engaged</p>
            </div>
          </Card>

          <Card title="Active Groups" className="h-full">
            <div className="text-center py-8">
              <div className="text-4xl font-bold text-church-primary mb-2">
                {analytics?.activeGroups || 0}
              </div>
              <p className="text-gray-600">Groups meeting regularly</p>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card title="Quick Actions" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              type="primary"
              size="large"
              block
              icon={<BarChartOutlined />}
              onClick={() => router.push("/analytics")}
            >
              Church-Wide Analytics
            </Button>
            <Button
              size="large"
              block
              icon={<PieChartOutlined />}
              onClick={() => router.push("/interests")}
            >
              Interest Insights
            </Button>
            <Button
              size="large"
              block
              icon={<TeamOutlined />}
              onClick={() => router.push("/groups")}
            >
              Manage Groups
            </Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
