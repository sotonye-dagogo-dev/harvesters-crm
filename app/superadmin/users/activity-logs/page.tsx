"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/features/navigation/DashboardLayout";
import { useAuth } from "@/providers/AuthProvider";
import {
  Card,
  Table,
  Tag,
  Input,
  Select,
  DatePicker,
  Button as AntButton,
  Space,
  Avatar,
  Tooltip,
  message,
} from "antd";
import {
  UserOutlined,
  SearchOutlined,
  FilterOutlined,
  DownloadOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import { CardSkeleton } from "@/components/ui/LoadingSkeleton";
import Pagination from "@/components/ui/Pagination";
import dayjs, { Dayjs } from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const { RangePicker } = DatePicker;
const { Search } = Input;

interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  actionType:
    | "CREATE"
    | "UPDATE"
    | "DELETE"
    | "LOGIN"
    | "LOGOUT"
    | "APPROVE"
    | "REJECT";
  resource: string;
  resourceId?: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

export default function UserActivityLogsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<ActivityLog[]>(
    []
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("ALL");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [dateRange, setDateRange] = useState<
    [Dayjs | null, Dayjs | null] | null
  >(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  useEffect(() => {
    fetchActivityLogs();
  }, []);

  useEffect(() => {
    filterActivities();
  }, [searchTerm, actionFilter, roleFilter, dateRange, activities]);

  const fetchActivityLogs = async () => {
    setLoading(true);
    try {
      // Mock activity logs - in production, this would come from API
      const mockLogs: ActivityLog[] = generateMockActivityLogs();
      setActivities(mockLogs);
    } catch (error) {
      message.error("Failed to load activity logs");
    } finally {
      setLoading(false);
    }
  };

  const generateMockActivityLogs = (): ActivityLog[] => {
    const actions = [
      { type: "CREATE", action: "Created new group", resource: "Group" },
      { type: "UPDATE", action: "Updated profile", resource: "User" },
      { type: "DELETE", action: "Deleted meeting", resource: "Meeting" },
      { type: "LOGIN", action: "Logged in", resource: "Auth" },
      { type: "LOGOUT", action: "Logged out", resource: "Auth" },
      {
        type: "APPROVE",
        action: "Approved membership request",
        resource: "Request",
      },
      {
        type: "REJECT",
        action: "Rejected membership request",
        resource: "Request",
      },
      { type: "CREATE", action: "Created meeting", resource: "Meeting" },
      { type: "UPDATE", action: "Updated group settings", resource: "Group" },
      { type: "CREATE", action: "Added member to group", resource: "Member" },
    ];

    const roles = ["SUPERADMIN", "LEADER", "MEMBER"];
    const users = [
      "John Doe",
      "Jane Smith",
      "Sarah Johnson",
      "Michael Brown",
      "Emily Davis",
    ];

    return Array.from({ length: 150 }, (_, i) => {
      const action = actions[Math.floor(Math.random() * actions.length)];
      const daysAgo = Math.floor(Math.random() * 30);
      const hoursAgo = Math.floor(Math.random() * 24);

      return {
        id: `log-${i + 1}`,
        userId: `user-${Math.floor(Math.random() * 10) + 1}`,
        userName: users[Math.floor(Math.random() * users.length)],
        userRole: roles[Math.floor(Math.random() * roles.length)],
        action: action.action,
        actionType: action.type as ActivityLog["actionType"],
        resource: action.resource,
        resourceId: `res-${Math.floor(Math.random() * 100) + 1}`,
        details: `${action.action} at ${dayjs().subtract(daysAgo, "day").subtract(hoursAgo, "hour").format("h:mm A")}`,
        ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        timestamp: dayjs()
          .subtract(daysAgo, "day")
          .subtract(hoursAgo, "hour")
          .toISOString(),
      };
    }).sort(
      (a, b) => dayjs(b.timestamp).valueOf() - dayjs(a.timestamp).valueOf()
    );
  };

  const filterActivities = () => {
    let filtered = [...activities];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (log) =>
          log.userName.toLowerCase().includes(term) ||
          log.action.toLowerCase().includes(term) ||
          log.resource.toLowerCase().includes(term) ||
          log.details.toLowerCase().includes(term)
      );
    }

    // Action type filter
    if (actionFilter !== "ALL") {
      filtered = filtered.filter((log) => log.actionType === actionFilter);
    }

    // Role filter
    if (roleFilter !== "ALL") {
      filtered = filtered.filter((log) => log.userRole === roleFilter);
    }

    // Date range filter
    if (dateRange && dateRange[0] && dateRange[1]) {
      filtered = filtered.filter((log) => {
        const logDate = dayjs(log.timestamp);
        return (
          logDate.isAfter(dateRange[0]) &&
          logDate.isBefore(dateRange[1]?.add(1, "day"))
        );
      });
    }

    setFilteredActivities(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const getActionIcon = (actionType: ActivityLog["actionType"]) => {
    switch (actionType) {
      case "CREATE":
        return <PlusOutlined className="text-green-600" />;
      case "UPDATE":
        return <EditOutlined className="text-blue-600" />;
      case "DELETE":
        return <DeleteOutlined className="text-red-600" />;
      case "LOGIN":
        return <CheckCircleOutlined className="text-green-600" />;
      case "LOGOUT":
        return <CloseCircleOutlined className="text-gray-600" />;
      case "APPROVE":
        return <CheckCircleOutlined className="text-green-600" />;
      case "REJECT":
        return <CloseCircleOutlined className="text-red-600" />;
      default:
        return <SwapOutlined className="text-gray-600" />;
    }
  };

  const getActionColor = (actionType: ActivityLog["actionType"]) => {
    switch (actionType) {
      case "CREATE":
        return "green";
      case "UPDATE":
        return "blue";
      case "DELETE":
        return "red";
      case "LOGIN":
        return "cyan";
      case "LOGOUT":
        return "default";
      case "APPROVE":
        return "green";
      case "REJECT":
        return "red";
      default:
        return "default";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "SUPERADMIN":
        return "red";
      case "LEADER":
        return "blue";
      case "MEMBER":
        return "green";
      default:
        return "default";
    }
  };

  const handleExport = () => {
    const csv = [
      [
        "Timestamp",
        "User",
        "Role",
        "Action",
        "Resource",
        "Details",
        "IP Address",
      ],
      ...filteredActivities.map((log) => [
        dayjs(log.timestamp).format("YYYY-MM-DD HH:mm:ss"),
        log.userName,
        log.userRole,
        log.action,
        log.resource,
        log.details,
        log.ipAddress,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `activity-logs-${dayjs().format("YYYY-MM-DD")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    message.success("Activity logs exported successfully");
  };

  const columns = [
    {
      title: "User",
      dataIndex: "userName",
      key: "userName",
      render: (name: string, record: ActivityLog) => (
        <div className="flex items-center gap-2">
          <Avatar size="small" icon={<UserOutlined />} />
          <div>
            <div className="font-medium">{name}</div>
            <Tag color={getRoleColor(record.userRole)}>{record.userRole}</Tag>
          </div>
        </div>
      ),
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      render: (action: string, record: ActivityLog) => (
        <div className="flex items-center gap-2">
          {getActionIcon(record.actionType)}
          <span>{action}</span>
        </div>
      ),
    },
    {
      title: "Type",
      dataIndex: "actionType",
      key: "actionType",
      render: (type: string) => (
        <Tag color={getActionColor(type as ActivityLog["actionType"])}>
          {type}
        </Tag>
      ),
    },
    {
      title: "Resource",
      dataIndex: "resource",
      key: "resource",
    },
    {
      title: "Details",
      dataIndex: "details",
      key: "details",
      render: (details: string) => (
        <Tooltip title={details}>
          <div className="truncate max-w-xs">{details}</div>
        </Tooltip>
      ),
    },
    {
      title: "IP Address",
      dataIndex: "ipAddress",
      key: "ipAddress",
      render: (ip: string) => (
        <span className="text-gray-500 text-xs">{ip}</span>
      ),
    },
    {
      title: "Time",
      dataIndex: "timestamp",
      key: "timestamp",
      render: (timestamp: string) => (
        <Tooltip title={dayjs(timestamp).format("YYYY-MM-DD HH:mm:ss")}>
          <span className="text-sm">{dayjs(timestamp).fromNow()}</span>
        </Tooltip>
      ),
      sorter: (a: ActivityLog, b: ActivityLog) =>
        dayjs(a.timestamp).valueOf() - dayjs(b.timestamp).valueOf(),
    },
  ];

  // Paginate data
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = filteredActivities.slice(startIndex, endIndex);

  if (loading) {
    return (
      <DashboardLayout role="SUPERADMIN">
        <CardSkeleton count={3} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role={user?.role || "SUPERADMIN"}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              User Activity Logs
            </h2>
            <p className="text-gray-600 mt-1">
              Track and monitor all user actions across the system
            </p>
          </div>
          <Space>
            <AntButton icon={<ReloadOutlined />} onClick={fetchActivityLogs}>
              Refresh
            </AntButton>
            <AntButton
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleExport}
            >
              Export CSV
            </AntButton>
          </Space>
        </div>

        {/* Filters */}
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Search
              placeholder="Search users, actions, or resources"
              allowClear
              prefix={<SearchOutlined />}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="large"
            />
            <Select
              placeholder="Filter by action"
              size="large"
              value={actionFilter}
              onChange={setActionFilter}
              options={[
                { label: "All Actions", value: "ALL" },
                { label: "Create", value: "CREATE" },
                { label: "Update", value: "UPDATE" },
                { label: "Delete", value: "DELETE" },
                { label: "Login", value: "LOGIN" },
                { label: "Logout", value: "LOGOUT" },
                { label: "Approve", value: "APPROVE" },
                { label: "Reject", value: "REJECT" },
              ]}
            />
            <Select
              placeholder="Filter by role"
              size="large"
              value={roleFilter}
              onChange={setRoleFilter}
              options={[
                { label: "All Roles", value: "ALL" },
                { label: "Superadmin", value: "SUPERADMIN" },
                { label: "Leader", value: "LEADER" },
                { label: "Member", value: "MEMBER" },
              ]}
            />
            <RangePicker
              size="large"
              onChange={(dates) =>
                setDateRange(dates as [Dayjs | null, Dayjs | null])
              }
              format="YYYY-MM-DD"
            />
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-gray-600">
              <FilterOutlined /> Showing {filteredActivities.length} of{" "}
              {activities.length} activities
            </span>
            {(searchTerm ||
              actionFilter !== "ALL" ||
              roleFilter !== "ALL" ||
              dateRange) && (
              <AntButton
                size="small"
                onClick={() => {
                  setSearchTerm("");
                  setActionFilter("ALL");
                  setRoleFilter("ALL");
                  setDateRange(null);
                }}
              >
                Clear Filters
              </AntButton>
            )}
          </div>
        </Card>

        {/* Activity Table */}
        <Card>
          <Table
            dataSource={paginatedData}
            columns={columns}
            rowKey="id"
            pagination={false}
            scroll={{ x: 1200 }}
          />
          <Pagination
            total={filteredActivities.length}
            pageSize={pageSize}
            current={currentPage}
            onChange={(page, newPageSize) => {
              setCurrentPage(page);
              setPageSize(newPageSize);
            }}
          />
        </Card>
      </div>
    </DashboardLayout>
  );
}
