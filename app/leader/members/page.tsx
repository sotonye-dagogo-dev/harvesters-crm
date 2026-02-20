"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/features/navigation/DashboardLayout";
import { Card, message, Spin, Space, Avatar } from "antd";
import Table from "@/components/ui/Table";
import StatusBadge, { BooleanBadge } from "@/components/ui/StatusBadge";
import FilterToolbar, {
  type FilterConfig,
} from "@/components/ui/FilterToolbar";
import { UserOutlined, PhoneOutlined, MailOutlined } from "@ant-design/icons";
import { UserRole } from "@/lib/types";

const leaderMemberFilters: FilterConfig[] = [
  {
    key: "search",
    type: "search",
    label: "Members",
    placeholder: "Search members by name or email...",
    width: 400,
  },
];

interface GroupMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  age: number;
  location: string;
  attendanceRate?: number;
  lastAttended?: string;
  isActive: boolean;
}

export default function LeaderMembersPage() {
  const router = useRouter();
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      // Get current user's group
      const userResponse = await fetch("/api/auth/me");
      if (!userResponse.ok) {
        router.push("/login");
        return;
      }

      const userData = await userResponse.json();
      const user = userData.data;

      if (!user.groupId) {
        message.info("You are not assigned to any group yet");
        setLoading(false);
        return;
      }

      // Fetch group members
      const response = await fetch(`/api/groups/${user.groupId}/members`);
      if (response.ok) {
        const data = await response.json();
        setMembers(data.data || []);
      } else {
        message.error("Failed to fetch group members");
      }
    } catch {
      message.error("An error occurred while fetching members");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const filteredMembers = members.filter(
    (member) =>
      member.firstName.toLowerCase().includes(searchText.toLowerCase()) ||
      member.lastName.toLowerCase().includes(searchText.toLowerCase()) ||
      member.email.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: "Member",
      key: "member",
      render: (record: GroupMember) => (
        <Space>
          <Avatar
            size="large"
            icon={<UserOutlined />}
            className="bg-gradient-to-br from-green-600 to-green-700"
          >
            {record.firstName[0]}
            {record.lastName[0]}
          </Avatar>
          <div>
            <div className="font-semibold text-ds-text-primary">
              {record.firstName} {record.lastName}
            </div>
            <div className="text-sm text-ds-text-subtle">{record.location}</div>
          </div>
        </Space>
      ),
    },
    {
      title: "Contact",
      key: "contact",
      render: (record: GroupMember) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <MailOutlined className="text-ds-text-subtle" />
            <span className="text-ds-text-secondary">{record.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <PhoneOutlined className="text-ds-text-subtle" />
            <span className="text-ds-text-secondary">{record.phone}</span>
          </div>
        </div>
      ),
    },
    {
      title: "Age",
      dataIndex: "age",
      key: "age",
      width: 80,
      render: (age: number) => (
        <span className="text-ds-text-secondary">{age}</span>
      ),
    },
    {
      title: "Attendance Rate",
      key: "attendanceRate",
      width: 150,
      render: (record: GroupMember) => {
        const rate = record.attendanceRate || 0;
        const status = rate >= 80 ? "present" : rate >= 50 ? "late" : "absent";
        return (
          <StatusBadge
            status={status}
            category="attendance"
            label={`${rate.toFixed(1)}%`}
            className="font-semibold"
          />
        );
      },
    },
    {
      title: "Status",
      key: "status",
      width: 120,
      render: (record: GroupMember) => (
        <BooleanBadge
          value={record.isActive}
          trueLabel="Active"
          falseLabel="Inactive"
        />
      ),
    },
  ];

  if (loading) {
    return (
      <DashboardLayout role={UserRole.SMALL_GROUP_LEADER}>
        <div className="flex items-center justify-center min-h-[400px]">
          <Spin size="large" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role={UserRole.SMALL_GROUP_LEADER}>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-slate-800 dark:to-slate-900 p-6 rounded-2xl shadow-lg border border-ds-border-base">
          <h2 className="text-3xl font-bold text-ds-text-primary flex items-center gap-3">
            <div className="w-12 h-12 bg-ds-status-success/10 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <UserOutlined className="text-2xl text-ds-status-success" />
            </div>
            Group Members
          </h2>
          <p className="text-ds-text-secondary mt-2 ml-15">
            View and manage members in your fellowship group
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="shadow-lg dark:bg-ds-surface-elevated dark:border-ds-border-base">
          <FilterToolbar
            filters={leaderMemberFilters}
            values={{ search: searchText }}
            onChange={(key, value) => {
              if (key === "search") setSearchText(value as string);
            }}
            onReset={() => setSearchText("")}
            className="!mb-0"
          />
        </Card>

        {/* Members Table */}
        <Card
          title={
            <span className="text-xl font-semibold">
              All Members ({filteredMembers.length})
            </span>
          }
          className="shadow-ds-xl"
        >
          <Table
            columns={columns}
            dataSource={filteredMembers}
            rowKey="id"
            actions={[
              {
                key: "viewDetails",
                label: "View Details",
                onClick: (record) =>
                  router.push(`/leader/members/${record.id}`),
              },
            ]}
            scroll={{ x: 1000 }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} members`,
            }}
          />
        </Card>
      </div>
    </DashboardLayout>
  );
}
