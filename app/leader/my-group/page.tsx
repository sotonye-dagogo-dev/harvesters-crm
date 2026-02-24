"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/features/navigation/DashboardLayout";
import { useAuth } from "@/providers/AuthProvider";
import {
  Card,
  Descriptions,
  Button as AntButton,
  message,
  Tag,
  Row,
  Col,
  Progress,
} from "antd";
import Table from "@/components/ui/Table";
import StatusBadge from "@/components/ui/StatusBadge";
import {
  CalendarOutlined,
  UserOutlined,
  PhoneOutlined,
  PlusOutlined,
  TeamOutlined,
  BarChartOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { StatCard } from "@/components/ui/Card";
import {
  PageHeader,
  PageLoading,
  PageEmpty,
  PageContainer,
} from "@/components/ui/PageLayout";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";

interface GroupDetails {
  id: string;
  name: string;
  description: string;
  meetingFrequency: string;
  memberCount: number;
  attendanceRate: number;
  leaderId: string;
  leader: {
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
}

interface RecentMeeting {
  id: string;
  date: string;
  topic: string;
  summary: string;
  attendees: number;
  totalMembers: number;
  attendanceRate: number;
}

interface MemberSummary {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  attendanceRate: number;
  meetingsAttended: number;
  totalMeetings: number;
  lastSeen: string;
  status: "active" | "at-risk" | "inactive";
}

export default function MyGroupPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState<GroupDetails | null>(null);
  const [recentMeetings, setRecentMeetings] = useState<RecentMeeting[]>([]);
  const [memberSummary, setMemberSummary] = useState<MemberSummary[]>([]);

  const fetchGroupData = useCallback(async () => {
    try {
      // Fetch group details
      const groupResponse = await fetch(`/api/groups/${user?.groupId}`);
      if (groupResponse.ok) {
        const groupData = await groupResponse.json();
        setGroup(groupData.data || groupData);
      }

      // Fetch recent meetings
      const meetingsResponse = await fetch(
        `/api/meetings?groupId=${user?.groupId}&limit=5`
      );
      if (meetingsResponse.ok) {
        const meetingsData = await meetingsResponse.json();
        const meetings = Array.isArray(meetingsData.data)
          ? meetingsData.data
          : Array.isArray(meetingsData)
            ? meetingsData
            : [];

        // Calculate attendance for each meeting
        const meetingsWithStats = meetings.map((meeting: Meeting) => {
          const attendanceCount =
            meeting.attendeeIds?.length || meeting.attendeeCount || 0;
          const totalMembers = group?.memberCount || 0;
          return {
            id: meeting.id,
            date: meeting.date,
            notes: meeting.notes,
            attendees: attendanceCount,
            totalMembers: totalMembers,
            attendanceRate:
              totalMembers > 0 ? (attendanceCount / totalMembers) * 100 : 0,
          };
        });
        setRecentMeetings(meetingsWithStats);
      }

      // Fetch member attendance summary
      const membersResponse = await fetch(
        `/api/groups/${user?.groupId}/members`
      );
      if (membersResponse.ok) {
        const membersData = await membersResponse.json();
        const members = Array.isArray(membersData.data)
          ? membersData.data
          : Array.isArray(membersData)
            ? membersData
            : [];

        // Calculate attendance for each member
        const memberStats = await Promise.all(
          members.map(async (member: User) => {
            const attendanceResponse = await fetch(
              `/api/meetings?memberId=${member.id}`
            );
            const attendanceData = await attendanceResponse.json();
            const meetings = Array.isArray(attendanceData.data)
              ? attendanceData.data
              : Array.isArray(attendanceData)
                ? attendanceData
                : [];

            const totalMeetings = recentMeetings.length || 0;
            const meetingsAttended = meetings.length;
            const attendanceRate =
              totalMeetings > 0 ? (meetingsAttended / totalMeetings) * 100 : 0;

            // Determine status
            let status: "active" | "at-risk" | "inactive" = "active";
            if (attendanceRate < 30) {
              status = "inactive";
            } else if (attendanceRate < 60) {
              status = "at-risk";
            }

            return {
              id: member.id,
              firstName: member.firstName,
              lastName: member.lastName,
              email: member.email,
              attendanceRate,
              meetingsAttended,
              totalMeetings,
              lastSeen: meetings[0]?.date || "Never",
              status,
            };
          })
        );
        setMemberSummary(memberStats);
      }
    } catch (error) {
      console.error("Failed to fetch group data:", error);
      message.error("Failed to load group data");
    } finally {
      setLoading(false);
    }
  }, [user?.groupId, group?.memberCount, recentMeetings.length]);

  useEffect(() => {
    if (user?.groupId) {
      fetchGroupData();
    } else {
      setLoading(false);
    }
  }, [user?.groupId, fetchGroupData]);

  const SCOPED_ROLES = [
    "GROUP_PASTOR",
    "GROUP_ADMIN",
    "CAMPUS_PASTOR",
    "CAMPUS_ADMIN",
    "ZONAL_LEADER",
    "HOD",
  ];
  const isScopedLeader = user?.role && SCOPED_ROLES.includes(user.role);

  if (!user?.groupId && !isScopedLeader) {
    return (
      <DashboardLayout role={user?.role}>
        <PageEmpty
          icon={<TeamOutlined />}
          title="No Group Assigned"
          description="You haven't been assigned to lead a group yet. Contact your administrator for group assignment."
        />
      </DashboardLayout>
    );
  }

  if (isScopedLeader && !user?.groupId) {
    return (
      <DashboardLayout role={user?.role}>
        <PageContainer>
          <PageHeader
            title="My Scope Overview"
            subtitle="As a senior leader, use the Groups, Members, and Meetings pages to manage your scope."
          />
          <Card>
            <div className="text-center py-12">
              <TeamOutlined className="text-6xl text-ds-text-subtle mb-4" />
              <h3 className="text-lg font-semibold text-ds-text-secondary mb-2">
                Senior Leader View
              </h3>
              <p className="text-ds-text-subtle">
                As a {user?.role?.replace(/_/g, " ").toLowerCase()}, you oversee
                multiple groups. Visit the{" "}
                <a
                  href="/leader/groups"
                  className="text-ds-brand-accent hover:underline"
                >
                  Groups
                </a>{" "}
                or{" "}
                <a
                  href="/leader/members"
                  className="text-ds-brand-accent hover:underline"
                >
                  Members
                </a>{" "}
                page to manage your scope.
              </p>
            </div>
          </Card>
        </PageContainer>
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout role={user?.role}>
        <PageLoading message="Loading group data..." />
      </DashboardLayout>
    );
  }

  if (!group) {
    return (
      <DashboardLayout role={user?.role}>
        <PageEmpty title="Group not found" />
      </DashboardLayout>
    );
  }

  const meetingColumns: ColumnsType<RecentMeeting> = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date: string) => dayjs(date).format("D MMM YYYY"),
      sorter: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    },
    {
      title: "Topic",
      dataIndex: "topic",
      key: "topic",
    },
    {
      title: "Attendance",
      key: "attendance",
      render: (_, record) => (
        <div>
          <div className="text-sm">
            {record.attendees} / {record.totalMembers} members
          </div>
          <Progress
            percent={record.attendanceRate}
            size="small"
            status={
              record.attendanceRate >= 70
                ? "success"
                : record.attendanceRate >= 50
                  ? "normal"
                  : "exception"
            }
            showInfo={false}
          />
        </div>
      ),
      sorter: (a, b) => a.attendanceRate - b.attendanceRate,
    },
  ];

  const memberColumns: ColumnsType<MemberSummary> = [
    {
      title: "Member",
      key: "member",
      render: (_, record) => (
        <div>
          <div className="font-medium">
            {record.firstName} {record.lastName}
          </div>
          <div className="text-xs text-ds-text-subtle">{record.email}</div>
        </div>
      ),
      sorter: (a, b) => a.firstName.localeCompare(b.firstName),
    },
    {
      title: "Attendance",
      key: "attendance",
      render: (_, record) => (
        <div>
          <div className="text-sm mb-1">
            {record.meetingsAttended} / {record.totalMeetings} meetings
          </div>
          <Progress
            percent={record.attendanceRate}
            size="small"
            status={
              record.status === "active"
                ? "success"
                : record.status === "at-risk"
                  ? "normal"
                  : "exception"
            }
            showInfo={false}
          />
        </div>
      ),
      sorter: (a, b) => a.attendanceRate - b.attendanceRate,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <StatusBadge status={status} category="engagement" />
      ),
      filters: [
        { text: "Active", value: "active" },
        { text: "At Risk", value: "at-risk" },
        { text: "Inactive", value: "inactive" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Last Seen",
      dataIndex: "lastSeen",
      key: "lastSeen",
      render: (date: string) =>
        date === "Never" ? date : dayjs(date).format("D MMM YYYY"),
    },
  ];

  const activeMembersCount = memberSummary.filter(
    (m) => m.status === "active"
  ).length;
  const atRiskCount = memberSummary.filter(
    (m) => m.status === "at-risk"
  ).length;
  const inactiveCount = memberSummary.filter(
    (m) => m.status === "inactive"
  ).length;

  return (
    <DashboardLayout role={user?.role}>
      <PageContainer>
        <PageHeader
          title={group.name}
          subtitle={group.description}
          actions={
            <>
              <AntButton
                icon={<ClockCircleOutlined />}
                onClick={() => router.push("/leader/follow-ups")}
              >
                Follow-ups
              </AntButton>
              <AntButton
                icon={<BarChartOutlined />}
                onClick={() => router.push("/leader/analytics")}
              >
                Analytics
              </AntButton>
            </>
          }
        />

        {/* Overview Stats */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <StatCard
              title="Total Members"
              value={group.memberCount}
              icon={<UserOutlined />}
              color="text-ds-chart-1"
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <StatCard
              title="Active Members"
              value={activeMembersCount}
              icon={<CheckCircleOutlined />}
              color="text-ds-status-success"
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <StatCard
              title="At Risk"
              value={atRiskCount}
              icon={<ClockCircleOutlined />}
              color="text-ds-chart-4"
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <StatCard
              title="Attendance Rate"
              value={`${group.attendanceRate?.toFixed(0) || 0}%`}
              icon={<CalendarOutlined />}
              color="text-ds-chart-3"
            />
          </Col>
        </Row>

        {/* Group Information */}
        <Card title="Group Information">
          <Descriptions column={{ xs: 1, sm: 2 }} bordered>
            <Descriptions.Item label="Leader">
              {group.leader
                ? `${group.leader.firstName} ${group.leader.lastName}`
                : "Not assigned"}
            </Descriptions.Item>
            <Descriptions.Item label="Meeting Frequency">
              <Tag color="blue">{group.meetingFrequency}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Total Members">
              {group.memberCount}
            </Descriptions.Item>
            <Descriptions.Item label="Created">
              {dayjs(group.createdAt).format("D MMM YYYY")}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Quick Actions Panel */}
        <Card title="Quick Actions">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <AntButton
                type="primary"
                block
                size="large"
                icon={<PlusOutlined />}
                onClick={() => router.push("/leader/meetings/new")}
              >
                Create Meeting
              </AntButton>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <AntButton
                block
                size="large"
                icon={<PhoneOutlined />}
                onClick={() => router.push("/leader/interactions/new")}
              >
                Log Interaction
              </AntButton>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <AntButton
                block
                size="large"
                icon={<TeamOutlined />}
                onClick={() => router.push("/leader/members")}
              >
                Manage Members
              </AntButton>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <AntButton
                block
                size="large"
                icon={<BarChartOutlined />}
                onClick={() => router.push("/leader/analytics")}
              >
                View Analytics
              </AntButton>
            </Col>
          </Row>
        </Card>

        {/* Recent Meetings */}
        <Card
          title="Recent Meetings"
          extra={
            <AntButton
              type="link"
              onClick={() => router.push("/leader/meetings")}
            >
              View All
            </AntButton>
          }
        >
          <Table
            dataSource={recentMeetings}
            columns={meetingColumns}
            rowKey="id"
            actions={[
              {
                key: "viewDetails",
                label: "View Details",
                onClick: (record) =>
                  router.push(`/leader/meetings/${record.id}`),
              },
            ]}
            pagination={false}
            scroll={{ x: 800 }}
            locale={{
              emptyText: "No meetings recorded yet",
            }}
          />
        </Card>

        {/* Member Attendance Summary */}
        <Card
          title="Member Attendance Summary"
          extra={
            <AntButton
              type="link"
              onClick={() => router.push("/leader/members")}
            >
              View All Members
            </AntButton>
          }
        >
          {inactiveCount > 0 && (
            <div className="mb-4">
              <Tag color="red" icon={<CloseCircleOutlined />} className="py-1">
                {inactiveCount} inactive member{inactiveCount > 1 ? "s" : ""}{" "}
                requiring attention
              </Tag>
            </div>
          )}
          <Table
            dataSource={memberSummary}
            columns={memberColumns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            scroll={{ x: 800 }}
            locale={{
              emptyText: "No members in group",
            }}
          />
        </Card>
      </PageContainer>
    </DashboardLayout>
  );
}
