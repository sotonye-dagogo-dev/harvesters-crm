"use client";

import DashboardLayout from "@/components/features/navigation/DashboardLayout";
import { StatCard } from "@/components/ui/Card";
import {
  UserOutlined,
  CalendarOutlined,
  PhoneOutlined,
  TeamOutlined,
  BarChartOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import { Spin, Button, message } from "antd";
import { useAuth } from "@/providers/AuthProvider";
import FollowUpReminderWidget from "@/components/features/communications/FollowUpReminderWidget";

interface GroupAnalytics {
  totalMembers: number;
  totalMeetings: number;
  recentMeetings: number;
  recentInteractions: number;
  averageAttendance: number;
}

export default function LeaderDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<GroupAnalytics | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user?.groupId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/analytics/groups/${user.groupId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch analytics");
        }

        const result = await response.json();
        // Handle both data.data and direct data formats
        setAnalytics(result.data || result);
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
  }, [user?.groupId]);

  if (loading) {
    return (
      <DashboardLayout role="LEADER">
        <div className="flex items-center justify-center h-96">
          <Spin size="large" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="LEADER">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Leader Dashboard
            </h2>
            <p className="text-gray-600">
              Manage your group and track engagement
            </p>
          </div>
          {user?.groupId && (
            <div className="flex gap-2">
              <Button
                icon={<ClockCircleOutlined />}
                onClick={() => router.push("/follow-ups")}
              >
                Follow-ups
              </Button>
              <Button
                type="primary"
                icon={<BarChartOutlined />}
                onClick={() => router.push("/analytics")}
              >
                View Analytics
              </Button>
            </div>
          )}
        </div>

        {user?.groupId ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Group Members"
                value={analytics?.totalMembers || 0}
                icon={<UserOutlined />}
                color="text-blue-600"
              />
              <StatCard
                title="Total Meetings"
                value={analytics?.totalMeetings || 0}
                icon={<CalendarOutlined />}
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

            {/* Follow-up Reminders Widget */}
            <FollowUpReminderWidget leaderGroupId={user.groupId} />

            <Card title="Average Attendance">
              <div className="text-center py-8">
                <div className="text-4xl font-bold text-church-primary mb-2">
                  {analytics?.averageAttendance?.toFixed(1) || "0"}%
                </div>
                <p className="text-gray-600">Group attendance rate</p>
              </div>
            </Card>

            <Card title="Quick Actions">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  size="large"
                  block
                  icon={<TeamOutlined />}
                  onClick={() => router.push("/my-group")}
                >
                  View My Group
                </Button>
                <Button
                  size="large"
                  block
                  icon={<CalendarOutlined />}
                  onClick={() => router.push("/meetings/new")}
                >
                  Create Meeting
                </Button>
                <Button
                  size="large"
                  block
                  icon={<PhoneOutlined />}
                  onClick={() => router.push("/interactions/new")}
                >
                  Log Interaction
                </Button>
                <Button
                  size="large"
                  block
                  icon={<ClockCircleOutlined />}
                  onClick={() => router.push("/follow-ups")}
                >
                  Manage Follow-ups
                </Button>
              </div>
            </Card>
          </>
        ) : (
          <Card>
            <div className="text-center py-12">
              <TeamOutlined className="text-6xl text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No Group Assigned
              </h3>
              <p className="text-gray-500">
                You haven't been assigned to lead a group yet.
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Contact your administrator for group assignment.
              </p>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
