"use client";

import { UserRole } from "@/lib/types";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import DashboardLayout from "@/components/features/navigation/DashboardLayout";
import {
  Card,
  Descriptions,
  Progress,
  Spin,
  message,
  Empty,
  Button as AntButton,
} from "antd";
import Table from "@/components/ui/Table";
import StatusBadge, { BooleanBadge } from "@/components/ui/StatusBadge";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CalendarOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import { format } from "date-fns";
import { StatCard } from "@/components/ui/Card";
import type { ColumnsType } from "antd/es/table";

interface MeetingAttendance {
  meeting: MeetingWithDetails;
  attended: boolean;
}

export default function MemberStatsPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const groupId = params.id as string;
  const memberId = params.memberId as string;
  const [loading, setLoading] = useState(true);
  const [member, setMember] = useState<User | null>(null);
  const [group, setGroup] = useState<GroupWithDetails | null>(null);
  const [attendanceData, setAttendanceData] = useState<MeetingAttendance[]>([]);
  const [stats, setStats] = useState({
    totalMeetings: 0,
    attended: 0,
    missed: 0,
    attendanceRate: 0,
  });

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId, memberId]);

  const fetchData = async () => {
    try {
      // Fetch member details
      const memberRes = await fetch(`/api/users/${memberId}`);
      if (!memberRes.ok) throw new Error("Failed to fetch member");
      const memberData = await memberRes.json();
      setMember(memberData);

      // Fetch group details
      const groupRes = await fetch(`/api/groups/${groupId}`);
      if (!groupRes.ok) throw new Error("Failed to fetch group");
      const groupData = await groupRes.json();
      setGroup(groupData);

      // Fetch all meetings for this group
      const meetingsRes = await fetch(`/api/meetings?groupId=${groupId}`);
      if (!meetingsRes.ok) throw new Error("Failed to fetch meetings");
      const meetings: MeetingWithDetails[] = await meetingsRes.json();

      // Calculate attendance for this member
      const attendance: MeetingAttendance[] = meetings.map((meeting) => ({
        meeting,
        attended: meeting.attendeeIds?.includes(memberId) || false,
      }));

      setAttendanceData(attendance);

      // Calculate stats
      const totalMeetings = attendance.length;
      const attended = attendance.filter((a) => a.attended).length;
      const missed = totalMeetings - attended;
      const attendanceRate =
        totalMeetings > 0 ? (attended / totalMeetings) * 100 : 0;

      setStats({
        totalMeetings,
        attended,
        missed,
        attendanceRate,
      });
    } catch (error) {
      message.error("Failed to load member statistics");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<MeetingAttendance> = [
    {
      title: "Date",
      key: "date",
      render: (_, record) =>
        format(new Date(record.meeting.date), "d MMM yyyy"),
      sorter: (a, b) =>
        new Date(b.meeting.date).getTime() - new Date(a.meeting.date).getTime(),
    },
    {
      title: "Time",
      key: "time",
      render: (_, record) => {
        const start = format(
          new Date(`2000-01-01T${record.meeting.startTime}`),
          "h:mm a"
        );
        const end = format(
          new Date(`2000-01-01T${record.meeting.endTime}`),
          "h:mm a"
        );
        return `${start} - ${end}`;
      },
    },
    {
      title: "Attendees",
      dataIndex: ["meeting", "attendeeCount"],
      key: "attendeeCount",
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => (
        <BooleanBadge value={record.attended} trueLabel="Attended" falseLabel="Absent" />
      ),
      filters: [
        { text: "Attended", value: true },
        { text: "Absent", value: false },
      ],
      onFilter: (value, record) => record.attended === value,
    },
  ];

  if (loading) {
    return (
      <DashboardLayout role={UserRole.SUPERADMIN}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Spin size="large" />
        </div>
      </DashboardLayout>
    );
  }

  if (!member || !group) {
    return (
      <DashboardLayout role={UserRole.SUPERADMIN}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card>
            <Empty description="Member or group not found" />
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Check if user can view these stats
  const canView =
    user?.role === UserRole.SUPERADMIN ||
    (user?.role === UserRole.SMALL_GROUP_LEADER &&
      group.leaderId === user.id) ||
    user?.id === memberId;

  if (!canView) {
    return (
      <DashboardLayout role={UserRole.SUPERADMIN}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card>
            <p className="text-ds-text-subtle">
              You don&apos;t have permission to view these statistics
            </p>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role={UserRole.SUPERADMIN}>
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <button
            onClick={() => router.push(`/superadmin/groups/${groupId}`)}
            className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-4"
          >
            <ArrowLeftOutlined />
            Back to Group
          </button>
          <h1 className="text-2xl font-bold text-ds-text-primary">
            Member Participation Statistics
          </h1>
          <p className="text-ds-text-subtle mt-1">
            {member.firstName} {member.lastName} • {group.name}
          </p>
        </div>

        <div className="space-y-6">
          {/* Member Information */}
          <Card title="Member Information">
            <Descriptions column={2} bordered>
              <Descriptions.Item label="Name" span={2}>
                {member.firstName} {member.lastName}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {member.email}
              </Descriptions.Item>
              <Descriptions.Item label="Phone">
                {member.phone}
              </Descriptions.Item>
              <Descriptions.Item label="Role">
                <StatusBadge status={member.role} category="role" />
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <BooleanBadge value={member.isActive} trueLabel="Active" falseLabel="Inactive" />
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard
              title="Total Meetings"
              value={stats.totalMeetings}
              icon={<CalendarOutlined />}
              color="text-ds-chart-1"
            />
            <StatCard
              title="Attended"
              value={stats.attended}
              icon={<CheckCircleOutlined />}
              color="text-ds-status-success"
            />
            <StatCard
              title="Missed"
              value={stats.missed}
              icon={<CloseCircleOutlined />}
              color="text-ds-status-error"
            />
            <Card className="text-center">
              <div className="text-sm text-ds-text-secondary mb-2">Attendance Rate</div>
              <Progress
                type="circle"
                percent={Math.round(stats.attendanceRate)}
                size={80}
                strokeColor={
                  stats.attendanceRate >= 80
                    ? "#52c41a"
                    : stats.attendanceRate >= 60
                      ? "#faad14"
                      : "#ff4d4f"
                }
              />
            </Card>
          </div>

          {/* Attendance History */}
          <Card
            title="Attendance History"
            extra={
              attendanceData.length > 0 && (
                <AntButton
                  type="link"
                  icon={<HistoryOutlined />}
                  onClick={() =>
                    router.push(
                      `/groups/${groupId}/member/${memberId}/attendance-history`
                    )
                  }
                >
                  View Full History
                </AntButton>
              )
            }
          >
            {attendanceData.length === 0 ? (
              <Empty
                description="No meetings found for this group"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ) : (
              <Table
                dataSource={attendanceData}
                columns={columns}
                rowKey={(record) => record.meeting.id}
                scroll={{ x: 1000 }}
                pagination={{ pageSize: 10 }}
              />
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
