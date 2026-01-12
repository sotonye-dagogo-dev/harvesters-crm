"use client";

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
import { Spin, Button } from "antd";
import { useAuth } from "@/providers/AuthProvider";

interface MemberAnalytics {
  attendanceRate: number;
  totalMeetings: number;
  meetingsAttended: number;
  totalInteractions: number;
  engagementLevel: "HIGH" | "MEDIUM" | "LOW" | "AT_RISK";
}

export default function MemberDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<MemberAnalytics | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/analytics/members/${user.id}`);
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
  }, [user?.id]);

  const getEngagementColor = (level: string) => {
    switch (level) {
      case "HIGH":
        return "text-green-600";
      case "MEDIUM":
        return "text-blue-600";
      case "LOW":
        return "text-orange-600";
      case "AT_RISK":
        return "text-red-600";
      default:
        return "text-gray-600";
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

  return (
    <DashboardLayout role="MEMBER">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              My Dashboard
            </h2>
            <p className="text-gray-600">Track your fellowship engagement</p>
          </div>
          <Button
            type="primary"
            icon={<BarChartOutlined />}
            onClick={() => router.push("/analytics")}
          >
            View Analytics
          </Button>
        </div>

        {user?.groupId ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Attendance Rate"
                value={`${analytics?.attendanceRate?.toFixed(1) || 0}%`}
                icon={<CalendarOutlined />}
                color="text-blue-600"
              />
              <StatCard
                title="Meetings Attended"
                value={`${analytics?.meetingsAttended || 0}/${analytics?.totalMeetings || 0}`}
                icon={<TeamOutlined />}
                color="text-green-600"
              />
              <StatCard
                title="Leader Interactions"
                value={analytics?.totalInteractions || 0}
                icon={<PhoneOutlined />}
                color="text-purple-600"
              />
              <StatCard
                title="Engagement Level"
                value={analytics?.engagementLevel || "N/A"}
                icon={<TrophyOutlined />}
                color={getEngagementColor(analytics?.engagementLevel || "")}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card title="My Attendance">
                <div className="text-center py-8">
                  <div className="text-4xl font-bold text-church-primary mb-2">
                    {analytics?.attendanceRate?.toFixed(0) || 0}%
                  </div>
                  <p className="text-gray-600">of meetings attended</p>
                </div>
              </Card>

              <Card title="Keep Growing!">
                <div className="py-4 px-2">
                  <p className="text-gray-700 mb-4">
                    Your engagement level is{" "}
                    <span
                      className={`font-semibold ${getEngagementColor(analytics?.engagementLevel || "")}`}
                    >
                      {analytics?.engagementLevel || "N/A"}
                    </span>
                  </p>
                  <ul className="text-sm text-gray-600 space-y-2">
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
              <TeamOutlined className="text-6xl text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Not in a Group
              </h3>
              <p className="text-gray-500">
                You haven't joined a fellowship group yet.
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Browse available groups and request to join one!
              </p>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
