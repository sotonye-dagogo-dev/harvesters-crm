"use client";

import { UserRole } from "@/lib/types";
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

interface Member {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

export interface Engagement {
  memberId: string;
  score: number;
  lastActivity: string;
}
interface GroupAnalytics {
  group: {
    id: string;
    name: string;
    description: string;
    leader: {
      id: string;
      name: string;
    };
  };
  summary: {
    totalMembers: number;
    totalMeetings: number;
    totalInteractions: number;
    averageAttendance: number;
    attendanceRate: number;
  };
  memberEngagement: Engagement[];
  interactionsByType: Record<string, number>;
  atRiskMembers: Member[];
  highlyEngagedMembers: Member[];
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
          const errorData = await response.json().catch(() => ({}));
          const errorMessage =
            errorData.error || `HTTP error! status: ${response.status}`;
          console.error("Analytics API error:", errorMessage);
          throw new Error(errorMessage);
        }

        const result = await response.json();
        // API returns data in result.data
        if (result.data) {
          setAnalytics(result.data);
        } else {
          console.error("No data in analytics response:", result);
          throw new Error("Invalid response format from analytics API");
        }
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        message.error(
          `Failed to load dashboard data: ${errorMessage}. Please refresh the page.`
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user?.groupId]);

  // Dynamic stats configuration
  const stats = [
    {
      title: "Group Members",
      value: analytics?.summary.totalMembers || 0,
      icon: <UserOutlined />,
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Total Meetings",
      value: analytics?.summary.totalMeetings || 0,
      icon: <CalendarOutlined />,
      color: "text-green-600 dark:text-green-400",
    },
    {
      title: "Attendance Rate",
      value: `${analytics?.summary.attendanceRate || 0}%`,
      icon: <TeamOutlined />,
      color: "text-purple-600 dark:text-purple-400",
    },
    {
      title: "Total Interactions",
      value: analytics?.summary.totalInteractions || 0,
      icon: <PhoneOutlined />,
      color: "text-orange-600 dark:text-orange-400",
    },
  ];

  // Quick actions configuration
  const quickActions = [
    {
      label: "View My Group",
      icon: <TeamOutlined />,
      path: "/leader/my-group",
    },
    {
      label: "Create Meeting",
      icon: <CalendarOutlined />,
      path: "/leader/meetings/new",
    },
    {
      label: "Log Interaction",
      icon: <PhoneOutlined />,
      path: "/leader/interactions/new",
    },
    {
      label: "Manage Follow-ups",
      icon: <ClockCircleOutlined />,
      path: "/leader/follow-ups",
    },
  ];

  if (loading) {
    return (
      <DashboardLayout role={UserRole.SMALL_GROUP_LEADER}>
        <div className="flex items-center justify-center h-96">
          <Spin size="large" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role={UserRole.SMALL_GROUP_LEADER}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Leader Dashboard
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your group and track engagement
            </p>
          </div>
          {user?.groupId && (
            <div className="flex flex-wrap gap-2">
              <Button
                icon={<ClockCircleOutlined />}
                onClick={() => router.push("/leader/follow-ups")}
              >
                Follow-ups
              </Button>
              <Button
                type="primary"
                icon={<BarChartOutlined />}
                onClick={() => router.push("/leader/analytics")}
              >
                View Analytics
              </Button>
            </div>
          )}
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

            {/* Follow-up Reminders Widget */}
            <FollowUpReminderWidget leaderGroupId={user.groupId} />

            <Card
              title="Average Attendance"
              className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700"
            >
              <div className="text-center py-8">
                <div className="text-4xl font-bold text-church-primary dark:text-green-400 mb-2">
                  {analytics?.summary.averageAttendance?.toFixed(1) || "0"}
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  Average members per meeting
                </p>
              </div>
            </Card>

            <Card
              title="Quick Actions"
              className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mx-2 sm:mx-0">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    size="large"
                    block
                    icon={action.icon}
                    onClick={() => router.push(action.path)}
                  >
                    {action.label}
                  </Button>
                ))}
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
                You haven&apos;t been assigned to lead a group yet.
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
