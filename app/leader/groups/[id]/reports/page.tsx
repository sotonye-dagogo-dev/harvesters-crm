"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import {
  Card,
  Table,
  Tag,
  Spin,
  message,
  DatePicker,
  Space,
  Button as AntButton,
  Empty,
  Statistic,
  Progress,
} from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  TeamOutlined,
  CalendarOutlined,
  DownloadOutlined,
  TrophyOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { format } from "date-fns";
import type { ColumnsType } from "antd/es/table";
import dayjs, { Dayjs } from "dayjs";

const { RangePicker } = DatePicker;

interface MemberAttendanceStats {
  member: User;
  totalMeetings: number;
  attended: number;
  attendanceRate: number;
}

interface MeetingSummary {
  meeting: MeetingWithDetails;
  attendanceRate: number;
}

export default function AttendanceReportsPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const groupId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState<GroupWithDetails | null>(null);
  const [members, setMembers] = useState<User[]>([]);
  const [meetings, setMeetings] = useState<MeetingWithDetails[]>([]);
  const [memberStats, setMemberStats] = useState<MemberAttendanceStats[]>([]);
  const [meetingSummaries, setMeetingSummaries] = useState<MeetingSummary[]>(
    []
  );
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([
    dayjs().subtract(3, "month"),
    dayjs(),
  ]);
  const [overallStats, setOverallStats] = useState({
    totalMeetings: 0,
    averageAttendance: 0,
    totalMembers: 0,
    activeMembers: 0,
    atRiskMembers: 0,
  });

  useEffect(() => {
    fetchData();
  }, [groupId]);

  useEffect(() => {
    if (members.length > 0 && meetings.length > 0) {
      calculateStats();
    }
  }, [members, meetings, dateRange]);

  const fetchData = async () => {
    try {
      // Fetch group details
      const groupResponse = await fetch(`/api/groups/${groupId}`);
      if (!groupResponse.ok) throw new Error("Failed to fetch group");
      const groupData = await groupResponse.json();
      setGroup(groupData);

      // Fetch group members
      const membersResponse = await fetch(`/api/groups/${groupId}/members`);
      if (!membersResponse.ok) throw new Error("Failed to fetch members");
      const membersData = await membersResponse.json();
      setMembers(membersData);

      // Fetch all meetings for the group
      const meetingsResponse = await fetch(`/api/meetings?groupId=${groupId}`);
      if (!meetingsResponse.ok) throw new Error("Failed to fetch meetings");
      const meetingsData = await meetingsResponse.json();
      setMeetings(meetingsData);
    } catch (error) {
      message.error("Failed to load attendance data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    // Filter meetings by date range
    const filteredMeetings = meetings.filter((meeting) => {
      if (!dateRange[0] || !dateRange[1]) return true;
      const meetingDate = dayjs(meeting.date);
      return (
        meetingDate.isAfter(dateRange[0].subtract(1, "day")) &&
        meetingDate.isBefore(dateRange[1].add(1, "day"))
      );
    });

    // Calculate member statistics
    const memberStatsData: MemberAttendanceStats[] = members.map((member) => {
      const attended = filteredMeetings.filter((meeting) =>
        meeting.attendeeIds?.includes(member.id)
      ).length;
      const totalMeetings = filteredMeetings.length;
      const attendanceRate =
        totalMeetings > 0 ? (attended / totalMeetings) * 100 : 0;

      return {
        member,
        totalMeetings,
        attended,
        attendanceRate,
      };
    });

    // Sort by attendance rate descending
    memberStatsData.sort((a, b) => b.attendanceRate - a.attendanceRate);
    setMemberStats(memberStatsData);

    // Calculate meeting summaries
    const meetingSummariesData: MeetingSummary[] = filteredMeetings.map(
      (meeting) => {
        const attendanceRate =
          members.length > 0
            ? (meeting.attendeeCount / members.length) * 100
            : 0;
        return {
          meeting,
          attendanceRate,
        };
      }
    );

    // Sort by date descending
    meetingSummariesData.sort(
      (a, b) =>
        new Date(b.meeting.date).getTime() - new Date(a.meeting.date).getTime()
    );
    setMeetingSummaries(meetingSummariesData);

    // Calculate overall statistics
    const totalAttendance = filteredMeetings.reduce(
      (sum, meeting) => sum + meeting.attendeeCount,
      0
    );
    const averageAttendance =
      filteredMeetings.length > 0
        ? totalAttendance / filteredMeetings.length
        : 0;

    const activeMembers = memberStatsData.filter(
      (stat) => stat.attendanceRate >= 60
    ).length;
    const atRiskMembers = memberStatsData.filter(
      (stat) => stat.attendanceRate < 40
    ).length;

    setOverallStats({
      totalMeetings: filteredMeetings.length,
      averageAttendance: Math.round(averageAttendance),
      totalMembers: members.length,
      activeMembers,
      atRiskMembers,
    });
  };

  const handleExportReport = () => {
    if (!group || memberStats.length === 0) {
      message.warning("No data to export");
      return;
    }

    // Prepare CSV content
    const headers = [
      "Member Name",
      "Email",
      "Total Meetings",
      "Attended",
      "Attendance Rate",
      "Status",
    ];
    const rows = memberStats.map((stat) => [
      `${stat.member.firstName} ${stat.member.lastName}`,
      stat.member.email,
      stat.totalMeetings.toString(),
      stat.attended.toString(),
      `${stat.attendanceRate.toFixed(1)}%`,
      stat.attendanceRate >= 60
        ? "Active"
        : stat.attendanceRate >= 40
          ? "Moderate"
          : "At Risk",
    ]);

    const csvContent = [
      `Group: ${group.name}`,
      `Report Period: ${dateRange[0]?.format("MMM D, YYYY")} - ${dateRange[1]?.format("MMM D, YYYY")}`,
      `Total Meetings: ${overallStats.totalMeetings}`,
      `Average Attendance: ${overallStats.averageAttendance}`,
      "",
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `${group.name.replace(/\s+/g, "_")}_attendance_report.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    message.success("Report exported successfully");
  };

  // Check permissions
  const canView =
    user?.role === "SUPERADMIN" ||
    (user?.role === "LEADER" && user?.groupId === groupId);

  if (!canView) {
    return (
      <div className="p-8">
        <Card>
          <Empty description="You don't have permission to view this page" />
          <div className="text-center mt-4">
            <AntButton onClick={() => router.push("/dashboard")}>
              Go to Dashboard
            </AntButton>
          </div>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="p-8">
        <Card>
          <Empty description="Group not found" />
        </Card>
      </div>
    );
  }

  const memberColumns: ColumnsType<MemberAttendanceStats> = [
    {
      title: "Member",
      key: "member",
      render: (_, record) => (
        <div>
          <div className="font-medium">
            {record.member.firstName} {record.member.lastName}
          </div>
          <div className="text-sm text-gray-500">{record.member.email}</div>
        </div>
      ),
      sorter: (a, b) => a.member.firstName.localeCompare(b.member.firstName),
    },
    {
      title: "Total Meetings",
      dataIndex: "totalMeetings",
      key: "totalMeetings",
      align: "center" as const,
      sorter: (a, b) => a.totalMeetings - b.totalMeetings,
    },
    {
      title: "Attended",
      dataIndex: "attended",
      key: "attended",
      align: "center" as const,
      sorter: (a, b) => a.attended - b.attended,
    },
    {
      title: "Attendance Rate",
      key: "attendanceRate",
      align: "center" as const,
      render: (_, record) => (
        <div className="flex flex-col items-center gap-1">
          <Progress
            percent={Math.round(record.attendanceRate)}
            size="small"
            strokeColor={
              record.attendanceRate >= 60
                ? "#52c41a"
                : record.attendanceRate >= 40
                  ? "#faad14"
                  : "#ff4d4f"
            }
            style={{ width: "80px" }}
          />
          <span className="text-xs">{record.attendanceRate.toFixed(1)}%</span>
        </div>
      ),
      sorter: (a, b) => a.attendanceRate - b.attendanceRate,
    },
    {
      title: "Status",
      key: "status",
      align: "center" as const,
      render: (_, record) => {
        if (record.attendanceRate >= 60) {
          return (
            <Tag icon={<CheckCircleOutlined />} color="success">
              Active
            </Tag>
          );
        } else if (record.attendanceRate >= 40) {
          return (
            <Tag icon={<WarningOutlined />} color="warning">
              Moderate
            </Tag>
          );
        } else {
          return (
            <Tag icon={<WarningOutlined />} color="error">
              At Risk
            </Tag>
          );
        }
      },
      filters: [
        { text: "Active", value: "active" },
        { text: "Moderate", value: "moderate" },
        { text: "At Risk", value: "at-risk" },
      ],
      onFilter: (value, record) => {
        if (value === "active") return record.attendanceRate >= 60;
        if (value === "moderate")
          return record.attendanceRate >= 40 && record.attendanceRate < 60;
        return record.attendanceRate < 40;
      },
    },
  ];

  const meetingColumns: ColumnsType<MeetingSummary> = [
    {
      title: "Date",
      dataIndex: ["meeting", "date"],
      key: "date",
      render: (date: string) => (
        <div className="flex items-center gap-2">
          <CalendarOutlined className="text-gray-400" />
          <span>{format(new Date(date), "MMM d, yyyy")}</span>
        </div>
      ),
      sorter: (a, b) =>
        new Date(a.meeting.date).getTime() - new Date(b.meeting.date).getTime(),
    },
    {
      title: "Time",
      key: "time",
      render: (_, record) => (
        <span className="text-gray-600">
          {record.meeting.startTime} - {record.meeting.endTime}
        </span>
      ),
    },
    {
      title: "Attendees",
      dataIndex: ["meeting", "attendeeCount"],
      key: "attendeeCount",
      align: "center" as const,
      render: (count: number) => (
        <Tag color="blue" className="font-medium">
          {count} / {members.length}
        </Tag>
      ),
      sorter: (a, b) => a.meeting.attendeeCount - b.meeting.attendeeCount,
    },
    {
      title: "Attendance Rate",
      key: "attendanceRate",
      align: "center" as const,
      render: (_, record) => (
        <Progress
          percent={Math.round(record.attendanceRate)}
          size="small"
          strokeColor={
            record.attendanceRate >= 70
              ? "#52c41a"
              : record.attendanceRate >= 50
                ? "#faad14"
                : "#ff4d4f"
          }
          style={{ width: "100px" }}
        />
      ),
      sorter: (a, b) => a.attendanceRate - b.attendanceRate,
    },
  ];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <AntButton
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push(`/groups/${groupId}`)}
          className="mb-4"
        >
          Back to Group
        </AntButton>

        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Attendance Reports
            </h1>
            <p className="text-gray-600">{group.name}</p>
          </div>
          <AntButton
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleExportReport}
            disabled={memberStats.length === 0}
          >
            Export Report
          </AntButton>
        </div>

        {/* Date Range Filter */}
        <Card className="mb-6">
          <Space>
            <span className="text-gray-600">Report Period:</span>
            <RangePicker
              value={dateRange}
              onChange={(dates) =>
                setDateRange(dates as [Dayjs | null, Dayjs | null])
              }
              format="MMM D, YYYY"
              presets={[
                {
                  label: "Last Month",
                  value: [dayjs().subtract(1, "month"), dayjs()],
                },
                {
                  label: "Last 3 Months",
                  value: [dayjs().subtract(3, "month"), dayjs()],
                },
                {
                  label: "Last 6 Months",
                  value: [dayjs().subtract(6, "month"), dayjs()],
                },
                {
                  label: "This Year",
                  value: [dayjs().startOf("year"), dayjs()],
                },
              ]}
            />
          </Space>
        </Card>
      </div>

      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <Statistic
            title="Total Meetings"
            value={overallStats.totalMeetings}
            prefix={<CalendarOutlined />}
            valueStyle={{ color: "#1B4B3E" }}
          />
        </Card>
        <Card>
          <Statistic
            title="Avg Attendance"
            value={overallStats.averageAttendance}
            prefix={<TeamOutlined />}
            valueStyle={{ color: "#1890ff" }}
          />
        </Card>
        <Card>
          <Statistic
            title="Total Members"
            value={overallStats.totalMembers}
            prefix={<TeamOutlined />}
            valueStyle={{ color: "#722ed1" }}
          />
        </Card>
        <Card>
          <Statistic
            title="Active Members"
            value={overallStats.activeMembers}
            prefix={<TrophyOutlined />}
            valueStyle={{ color: "#52c41a" }}
            suffix={`/ ${overallStats.totalMembers}`}
          />
        </Card>
        <Card>
          <Statistic
            title="At Risk Members"
            value={overallStats.atRiskMembers}
            prefix={<WarningOutlined />}
            valueStyle={{ color: "#ff4d4f" }}
          />
        </Card>
      </div>

      {/* Member Attendance Statistics */}
      <Card title="Member Attendance Statistics" className="mb-6">
        <Table
          columns={memberColumns}
          dataSource={memberStats}
          rowKey={(record) => record.member.id}
          pagination={{
            pageSize: 20,
            showTotal: (total) => `${total} member${total !== 1 ? "s" : ""}`,
          }}
          locale={{
            emptyText: <Empty description="No member data available" />,
          }}
        />
      </Card>

      {/* Meeting Summaries */}
      <Card title="Meeting Summaries">
        <Table
          columns={meetingColumns}
          dataSource={meetingSummaries}
          rowKey={(record) => record.meeting.id}
          pagination={{
            pageSize: 20,
            showTotal: (total) => `${total} meeting${total !== 1 ? "s" : ""}`,
          }}
          locale={{
            emptyText: <Empty description="No meeting data available" />,
          }}
        />
      </Card>
    </div>
  );
}
