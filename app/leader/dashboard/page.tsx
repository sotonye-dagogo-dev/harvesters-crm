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
  ApartmentOutlined,
  FileTextOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Spin, message } from "antd";
import { useAuth } from "@/providers/AuthProvider";
import FollowUpReminderWidget from "@/components/features/communications/FollowUpReminderWidget";
import { ReportOverviewWidget } from "@/components/features/reports";

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

interface ScopeOverview {
  totalUsers: number;
  totalCampuses: number;
  totalGroups: number;
  totalCells: number;
  totalMeetings: number;
  totalDepartments: number;
  scopeName: string;
}

/** Roles that see a scoped overview rather than a single-group dashboard. */
const SCOPED_LEADER_ROLES: string[] = [
  "GROUP_PASTOR",
  "GROUP_ADMIN",
  "CAMPUS_PASTOR",
  "CAMPUS_ADMIN",
  "ZONAL_LEADER",
  "HOD",
];

export default function LeaderDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<GroupAnalytics | null>(null);
  const [scopeOverview, setScopeOverview] = useState<ScopeOverview | null>(
    null
  );
  const { user } = useAuth();

  const isDataEntry = user?.role === "DATA_ENTRY";
  const isScopedLeader = user?.role && SCOPED_LEADER_ROLES.includes(user.role);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        if (isScopedLeader) {
          // Fetch scoped overview data for higher-level leaders
          const params = new URLSearchParams();
          if (user.campusId) params.set("campusId", user.campusId);
          if (user.zoneId) params.set("zoneId", user.zoneId);
          if (user.departmentId) params.set("departmentId", user.departmentId);

          const [usersRes, meetingsRes, groupsRes, cellsRes] =
            await Promise.all([
              fetch(`/api/users?pageSize=999`),
              fetch(`/api/meetings?pageSize=999`),
              fetch(`/api/groups?pageSize=999`),
              fetch(`/api/cells?pageSize=999`),
            ]);

          const usersData = usersRes.ok ? await usersRes.json() : { data: [] };
          const meetingsData = meetingsRes.ok
            ? await meetingsRes.json()
            : { data: [] };
          const groupsData = groupsRes.ok
            ? await groupsRes.json()
            : { data: [] };
          const cellsData = cellsRes.ok ? await cellsRes.json() : { data: [] };

          const allUsers = Array.isArray(usersData.data) ? usersData.data : [];
          const allMeetings = Array.isArray(meetingsData.data)
            ? meetingsData.data
            : [];
          const allGroups = Array.isArray(groupsData.data)
            ? groupsData.data
            : [];
          const allCells = Array.isArray(cellsData.data) ? cellsData.data : [];

          // Determine scope name
          let scopeName = "Your Scope";
          if (user.role === "GROUP_PASTOR" || user.role === "GROUP_ADMIN") {
            scopeName = user.zoneId ? "Your Organization Group" : "All Groups";
          } else if (
            user.role === "CAMPUS_PASTOR" ||
            user.role === "CAMPUS_ADMIN"
          ) {
            scopeName = "Your Campus";
          } else if (user.role === "ZONAL_LEADER") {
            scopeName = "Your Zone";
          } else if (user.role === "HOD") {
            scopeName = "Your Department";
          }

          setScopeOverview({
            totalUsers: allUsers.length,
            totalCampuses: 0, // Not directly available from these APIs
            totalGroups: allGroups.length,
            totalCells: allCells.length,
            totalMeetings: allMeetings.length,
            totalDepartments: 0,
            scopeName,
          });
        } else if (isDataEntry) {
          // Fetch report stats for data-entry users
          const reportsRes = await fetch(`/api/reports?pageSize=999`);
          const reportsData = reportsRes.ok ? await reportsRes.json() : { data: [] };
          const myReports = Array.isArray(reportsData.data) ? reportsData.data : [];
          setScopeOverview({
            totalUsers: 0,
            totalCampuses: 0,
            totalGroups: 0,
            totalCells: 0,
            totalMeetings: myReports.length,
            totalDepartments: 0,
            scopeName: "Data Entry",
          });
        } else if (user.groupId) {
          // Fetch single-group analytics for SGL/Cell Leader
          const response = await fetch(`/api/analytics/groups/${user.groupId}`);

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
              errorData.error || `HTTP error! status: ${response.status}`
            );
          }

          const result = await response.json();
          if (result.data) {
            setAnalytics(result.data);
          } else {
            throw new Error("Invalid response format from analytics API");
          }
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        message.error(
          `Failed to load dashboard data: ${errorMessage}. Please refresh the page.`
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, isScopedLeader, isDataEntry]);

  // Quick actions configuration — adapted per role
  const getQuickActions = () => {
    if (isDataEntry) {
      return [
        {
          label: "Data Entry",
          icon: <EditOutlined />,
          path: "/leader/reports/data-entry",
        },
        {
          label: "View Reports",
          icon: <FileTextOutlined />,
          path: "/leader/reports",
        },
      ];
    }
    if (isScopedLeader) {
      return [
        {
          label: "View Groups",
          icon: <TeamOutlined />,
          path: "/leader/groups",
        },
        {
          label: "View Meetings",
          icon: <CalendarOutlined />,
          path: "/leader/meetings",
        },
        {
          label: "View Members",
          icon: <UserOutlined />,
          path: "/leader/members",
        },
        {
          label: "View Reports",
          icon: <BarChartOutlined />,
          path: "/leader/reports",
        },
      ];
    }
    return [
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
  };

  const quickActions = getQuickActions();

  // Stats for single-group view
  const groupStats = [
    {
      title: "Group Members",
      value: analytics?.summary.totalMembers || 0,
      icon: <UserOutlined />,
      color: "text-ds-chart-1",
    },
    {
      title: "Total Meetings",
      value: analytics?.summary.totalMeetings || 0,
      icon: <CalendarOutlined />,
      color: "text-ds-brand-accent",
    },
    {
      title: "Attendance Rate",
      value: `${analytics?.summary.attendanceRate || 0}%`,
      icon: <TeamOutlined />,
      color: "text-ds-chart-3",
    },
    {
      title: "Total Interactions",
      value: analytics?.summary.totalInteractions || 0,
      icon: <PhoneOutlined />,
      color: "text-ds-chart-4",
    },
  ];

  // Stats for scoped view
  const scopeStats = [
    {
      title: "Users in Scope",
      value: scopeOverview?.totalUsers || 0,
      icon: <UserOutlined />,
      color: "text-ds-chart-1",
    },
    {
      title: "Groups",
      value: scopeOverview?.totalGroups || 0,
      icon: <TeamOutlined />,
      color: "text-ds-brand-accent",
    },
    {
      title: "Cells",
      value: scopeOverview?.totalCells || 0,
      icon: <ApartmentOutlined />,
      color: "text-ds-chart-3",
    },
    {
      title: "Meetings",
      value: scopeOverview?.totalMeetings || 0,
      icon: <CalendarOutlined />,
      color: "text-ds-chart-4",
    },
  ];

  if (loading) {
    return (
      <DashboardLayout role={user?.role}>
        <div className="flex items-center justify-center h-96">
          <Spin size="large" />
        </div>
      </DashboardLayout>
    );
  }

  // Determine role label for heading
  const getRoleLabel = () => {
    switch (user?.role) {
      case "GROUP_PASTOR":
        return "Group Pastor";
      case "GROUP_ADMIN":
        return "Group Admin";
      case "CAMPUS_PASTOR":
        return "Campus Pastor";
      case "CAMPUS_ADMIN":
        return "Campus Admin";
      case "ZONAL_LEADER":
        return "Zonal Leader";
      case "HOD":
        return "Head of Department";
      case "DATA_ENTRY":
        return "Data Entry";
      default:
        return "Leader";
    }
  };

  return (
    <DashboardLayout role={user?.role}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-ds-text-primary mb-2">
              {getRoleLabel()} Dashboard
            </h2>
            <p className="text-ds-text-secondary">
              {isDataEntry
                ? "Enter and manage historical report data"
                : isScopedLeader
                ? `Overview of ${scopeOverview?.scopeName || "your scope"}`
                : "Manage your group and track engagement"}
            </p>
          </div>
          {!isScopedLeader && user?.groupId && (
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                icon={<ClockCircleOutlined />}
                onClick={() => router.push("/leader/follow-ups")}
              >
                Follow-ups
              </Button>
              <Button
                icon={<BarChartOutlined />}
                onClick={() => router.push("/leader/analytics")}
              >
                View Analytics
              </Button>
            </div>
          )}
        </div>

        {isDataEntry ? (
          <>
            {/* Data Entry Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mx-2 sm:mx-0">
              <StatCard
                title="Reports Entered"
                value={scopeOverview?.totalMeetings || 0}
                icon={<FileTextOutlined />}
                color="text-ds-chart-1"
              />
              <StatCard
                title="Role"
                value="Data Entry"
                icon={<EditOutlined />}
                color="text-ds-brand-accent"
              />
            </div>

            {/* Report Overview Widget */}
            <ReportOverviewWidget />

            <Card
              title="Quick Actions"
              className="bg-ds-surface-elevated border-ds-border-base"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mx-2 sm:mx-0">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="secondary"
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
        ) : isScopedLeader ? (
          <>
            {/* Scoped Overview Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mx-2 sm:mx-0">
              {scopeStats.map((stat, index) => (
                <StatCard
                  key={index}
                  title={stat.title}
                  value={stat.value}
                  icon={stat.icon}
                  color={stat.color}
                />
              ))}
            </div>

            {/* Report Overview Widget */}
            <ReportOverviewWidget />

            <Card
              title="Quick Actions"
              className="bg-ds-surface-elevated border-ds-border-base"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mx-2 sm:mx-0">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="secondary"
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
        ) : user?.groupId ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mx-2 sm:mx-0">
              {groupStats.map((stat, index) => (
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

            {/* Report Overview Widget */}
            <ReportOverviewWidget />

            <Card
              title="Average Attendance"
              className="bg-ds-surface-elevated border-ds-border-base"
            >
              <div className="text-center py-8">
                <div className="text-4xl font-bold text-ds-brand-accent mb-2">
                  {analytics?.summary.averageAttendance?.toFixed(1) || "0"}
                </div>
                <p className="text-ds-text-secondary">
                  Average members per meeting
                </p>
              </div>
            </Card>

            <Card
              title="Quick Actions"
              className="bg-ds-surface-elevated border-ds-border-base"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mx-2 sm:mx-0">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="secondary"
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
              <TeamOutlined className="text-6xl text-ds-text-subtle mb-4" />
              <h3 className="text-lg font-semibold text-ds-text-secondary mb-2">
                No Group Assigned
              </h3>
              <p className="text-ds-text-subtle">
                You haven&apos;t been assigned to lead a group yet.
              </p>
              <p className="text-ds-text-subtle text-sm mt-2">
                Contact your administrator for group assignment.
              </p>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
