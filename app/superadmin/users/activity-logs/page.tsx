"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/features/navigation/DashboardLayout";
import { useAuth } from "@/providers/AuthProvider";
import {
  Card,
  Avatar,
  Tooltip,
  message,
} from "antd";
import Table from "@/components/ui/Table";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";
import FilterToolbar, { type FilterConfig } from "@/components/ui/FilterToolbar";
import {
  UserOutlined,
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
import { UserRole } from "@/lib/types";

dayjs.extend(relativeTime);

const activityFilters: FilterConfig[] = [
  {
    key: "search",
    type: "search",
    label: "Search",
    placeholder: "Search users, actions, or resources",
    width: 280,
  },
  {
    key: "action",
    type: "select",
    label: "Action",
    placeholder: "Filter by action",
    options: [
      { label: "All Actions", value: "ALL" },
      { label: "Create", value: "CREATE" },
      { label: "Update", value: "UPDATE" },
      { label: "Delete", value: "DELETE" },
      { label: "Login", value: "LOGIN" },
      { label: "Logout", value: "LOGOUT" },
      { label: "Approve", value: "APPROVE" },
      { label: "Reject", value: "REJECT" },
    ],
  },
  {
    key: "role",
    type: "select",
    label: "Role",
    placeholder: "Filter by role",
    options: [
      { label: "All Roles", value: "ALL" },
      { label: "Superadmin", value: "SUPERADMIN" },
      { label: "Leader", value: "LEADER" },
      { label: "Member", value: "MEMBER" },
    ],
  },
  {
    key: "dateRange",
    type: "dateRange",
    label: "Date Range",
  },
];

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    filterActivities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, actionFilter, roleFilter, dateRange, activities]);

  const fetchActivityLogs = async () => {
    setLoading(true);
    try {
      // Mock activity logs - in production, this would come from API
      const mockLogs: ActivityLog[] = generateMockActivityLogs();
      setActivities(mockLogs);
    } catch {
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
        return <PlusOutlined className="text-ds-status-success" />;
      case "UPDATE":
        return <EditOutlined className="text-ds-chart-1" />;
      case "DELETE":
        return <DeleteOutlined className="text-ds-status-error" />;
      case "LOGIN":
        return <CheckCircleOutlined className="text-ds-status-success" />;
      case "LOGOUT":
        return <CloseCircleOutlined className="text-ds-text-secondary" />;
      case "APPROVE":
        return <CheckCircleOutlined className="text-ds-status-success" />;
      case "REJECT":
        return <CloseCircleOutlined className="text-ds-status-error" />;
      default:
        return <SwapOutlined className="text-ds-text-secondary" />;
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
        dayjs(log.timestamp).format("D MMM YYYY HH:mm:ss"),
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
            <StatusBadge status={record.userRole} category="role" />
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
        <StatusBadge status={type} category="action" />
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
        <span className="text-ds-text-subtle text-xs">{ip}</span>
      ),
    },
    {
      title: "Time",
      dataIndex: "timestamp",
      key: "timestamp",
      render: (timestamp: string) => (
        <Tooltip title={dayjs(timestamp).format("D MMM YYYY HH:mm:ss")}>
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
      <DashboardLayout role={UserRole.SUPERADMIN}>
        <CardSkeleton count={3} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role={user?.role || UserRole.SUPERADMIN}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-ds-text-primary">
              User Activity Logs
            </h2>
            <p className="text-ds-text-secondary mt-1">
              Track and monitor all user actions across the system
            </p>
          </div>
          <div className="flex gap-2">
            <Button icon={<ReloadOutlined />} onClick={fetchActivityLogs}>
              Refresh
            </Button>
            <Button
              icon={<DownloadOutlined />}
              onClick={handleExport}
            >
              Export CSV
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <FilterToolbar
            filters={activityFilters}
            values={{ search: searchTerm, action: actionFilter, role: roleFilter, dateRange }}
            onChange={(key, value) => {
              if (key === "search") setSearchTerm(value as string);
              else if (key === "action") setActionFilter((value as string) || "ALL");
              else if (key === "role") setRoleFilter((value as string) || "ALL");
              else if (key === "dateRange") setDateRange(value as [Dayjs | null, Dayjs | null] | null);
            }}
            onReset={() => {
              setSearchTerm("");
              setActionFilter("ALL");
              setRoleFilter("ALL");
              setDateRange(null);
            }}
            className="!mb-0"
          />
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-ds-text-secondary">
              <FilterOutlined /> Showing {filteredActivities.length} of{" "}
              {activities.length} activities
            </span>
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
