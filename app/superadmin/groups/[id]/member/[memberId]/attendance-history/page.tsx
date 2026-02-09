"use client";

import { UserRole } from "@/lib/types";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import DashboardLayout from "@/components/features/navigation/DashboardLayout";
import {
  Card,
  Table,
  Tag,
  Spin,
  message,
  DatePicker,
  Select,
  Space,
  Button as AntButton,
  Empty,
  Statistic,
} from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CalendarOutlined,
  DownloadOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import { format } from "date-fns";
import type { ColumnsType } from "antd/es/table";
import { Dayjs } from "dayjs";

const { RangePicker } = DatePicker;

interface MeetingAttendance {
  meeting: MeetingWithDetails;
  attended: boolean;
}

export default function AttendanceHistoryPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const groupId = params.id as string;
  const memberId = params.memberId as string;
  const [loading, setLoading] = useState(true);
  const [member, setMember] = useState<User | null>(null);
  const [group, setGroup] = useState<GroupWithDetails | null>(null);
  const [attendanceData, setAttendanceData] = useState<MeetingAttendance[]>([]);
  const [filteredData, setFilteredData] = useState<MeetingAttendance[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([
    null,
    null,
  ]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId, memberId]);

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attendanceData, statusFilter, dateRange]);

  const fetchData = async () => {
    try {
      // Fetch member details
      const memberResponse = await fetch(`/api/users/${memberId}`);
      if (!memberResponse.ok) throw new Error("Failed to fetch member");
      const memberData = await memberResponse.json();
      setMember(memberData);

      // Fetch group details
      const groupResponse = await fetch(`/api/groups/${groupId}`);
      if (!groupResponse.ok) throw new Error("Failed to fetch group");
      const groupData = await groupResponse.json();
      setGroup(groupData);

      // Fetch all meetings for the group
      const meetingsResponse = await fetch(`/api/meetings?groupId=${groupId}`);
      if (!meetingsResponse.ok) throw new Error("Failed to fetch meetings");
      const meetingsData = await meetingsResponse.json();

      // Build attendance data
      const attendance = meetingsData.map((meeting: MeetingWithDetails) => ({
        meeting,
        attended: meeting.attendeeIds?.includes(memberId) || false,
      }));

      // Sort by date descending (most recent first)
      attendance.sort(
        (a: MeetingAttendance, b: MeetingAttendance) =>
          new Date(b.meeting.date).getTime() -
          new Date(a.meeting.date).getTime()
      );

      setAttendanceData(attendance);
    } catch (error) {
      message.error("Failed to load attendance history");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...attendanceData];

    // Filter by attendance status
    if (statusFilter === "ATTENDED") {
      filtered = filtered.filter((item) => item.attended);
    } else if (statusFilter === "ABSENT") {
      filtered = filtered.filter((item) => !item.attended);
    }

    // Filter by date range
    if (dateRange[0] && dateRange[1]) {
      const startDate = dateRange[0].startOf("day").toDate();
      const endDate = dateRange[1].endOf("day").toDate();
      filtered = filtered.filter((item) => {
        const meetingDate = new Date(item.meeting.date);
        return meetingDate >= startDate && meetingDate <= endDate;
      });
    }

    setFilteredData(filtered);
  };

  const handleExportCSV = () => {
    if (!member || filteredData.length === 0) {
      message.warning("No data to export");
      return;
    }

    // Prepare CSV content
    const headers = ["Date", "Time", "Duration", "Total Attendees", "Status"];
    const rows = filteredData.map((item) => [
      format(new Date(item.meeting.date), "MMM d, yyyy"),
      item.meeting.startTime,
      `${item.meeting.startTime} - ${item.meeting.endTime}`,
      item.meeting.attendeeCount.toString(),
      item.attended ? "Attended" : "Absent",
    ]);

    const csvContent = [
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
      `${member.firstName}_${member.lastName}_attendance_history.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    message.success("Attendance history exported successfully");
  };

  const clearFilters = () => {
    setStatusFilter("ALL");
    setDateRange([null, null]);
  };

  // Check permissions
  const canView =
    user?.role === UserRole.SUPERADMIN ||
    (user?.role === UserRole.SMALL_GROUP_LEADER && user?.groupId === groupId) ||
    user?.id === memberId;

  if (!canView) {
    return (
      <DashboardLayout role={UserRole.SUPERADMIN}>
        <div className="max-w-7xl mx-auto">
          <Card>
            <Empty description="You don't have permission to view this page" />
            <div className="text-center mt-4">
              <AntButton onClick={() => router.push("/superadmin/dashboard")}>
                Go to Dashboard
              </AntButton>
            </div>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

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
        <div className="max-w-7xl mx-auto">
          <Card>
            <Empty description="Member or group not found" />
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Calculate stats for filtered data
  const filteredStats = {
    total: filteredData.length,
    attended: filteredData.filter((item) => item.attended).length,
    absent: filteredData.filter((item) => !item.attended).length,
  };

  const columns: ColumnsType<MeetingAttendance> = [
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
      title: "Total Attendees",
      dataIndex: ["meeting", "attendeeCount"],
      key: "attendeeCount",
      align: "center" as const,
      render: (count: number) => (
        <Tag color="blue" className="font-medium">
          {count}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "attended",
      key: "status",
      align: "center" as const,
      render: (attended: boolean) =>
        attended ? (
          <Tag icon={<CheckCircleOutlined />} color="success">
            Attended
          </Tag>
        ) : (
          <Tag icon={<CloseCircleOutlined />} color="error">
            Absent
          </Tag>
        ),
      filters: [
        { text: "Attended", value: true },
        { text: "Absent", value: false },
      ],
      onFilter: (value, record) => record.attended === value,
    },
    {
      title: "Notes",
      dataIndex: ["meeting", "notes"],
      key: "notes",
      ellipsis: true,
      render: (notes: string) =>
        notes ? (
          <span className="text-gray-600">{notes}</span>
        ) : (
          <span className="text-gray-400 italic">No notes</span>
        ),
    },
  ];

  return (
    <DashboardLayout role={UserRole.SUPERADMIN}>
      <div className="max-w-7xl mx-auto space-y-6">
        <AntButton
          icon={<ArrowLeftOutlined />}
          onClick={() =>
            router.push(
              `/superadmin/groups/${groupId}/member/${memberId}/stats`
            )
          }
          className="mb-4"
        >
          Back to Stats
        </AntButton>

        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Attendance History
            </h1>
            <p className="text-gray-600">
              {member.firstName} {member.lastName} • {group.name}
            </p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <Statistic
              title="Total Meetings"
              value={filteredStats.total}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: "#1B4B3E" }}
            />
          </Card>
          <Card>
            <Statistic
              title="Attended"
              value={filteredStats.attended}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
          <Card>
            <Statistic
              title="Absent"
              value={filteredStats.absent}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <Space wrap>
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: 150 }}
                options={[
                  { label: "All Status", value: "ALL" },
                  { label: "Attended", value: "ATTENDED" },
                  { label: "Absent", value: "ABSENT" },
                ]}
                prefix={<FilterOutlined />}
              />
              <RangePicker
                value={dateRange}
                onChange={(dates) =>
                  setDateRange(dates as [Dayjs | null, Dayjs | null])
                }
                format="MMM D, YYYY"
              />
              <AntButton onClick={clearFilters}>Clear Filters</AntButton>
            </Space>
            <AntButton
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleExportCSV}
              disabled={filteredData.length === 0}
            >
              Export CSV
            </AntButton>
          </div>
        </Card>

        {/* Attendance Table */}
        <Card>
          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey={(record) => record.meeting.id}
            scroll={{ x: 1200 }}
            pagination={{
              pageSize: 20,
              showTotal: (total) => `${total} meeting${total !== 1 ? "s" : ""}`,
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50", "100"],
            }}
            locale={{
              emptyText: (
                <Empty
                  description={
                    statusFilter !== "ALL" || dateRange[0] || dateRange[1]
                      ? "No meetings match your filters"
                      : "No meeting history available"
                  }
                />
              ),
            }}
          />
        </Card>
      </div>
    </DashboardLayout>
  );
}
