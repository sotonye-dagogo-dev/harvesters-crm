"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/features/navigation/DashboardLayout";
import {
  Card,
  Table,
  Button,
  Tag,
  message,
  Spin,
  Input,
  Space,
  Avatar,
} from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { UserRole } from "@/lib/types";

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
            <div className="font-semibold text-gray-900 dark:text-white">
              {record.firstName} {record.lastName}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {record.location}
            </div>
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
            <MailOutlined className="text-gray-500" />
            <span className="text-gray-700 dark:text-gray-300">
              {record.email}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <PhoneOutlined className="text-gray-500" />
            <span className="text-gray-700 dark:text-gray-300">
              {record.phone}
            </span>
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
        <span className="text-gray-700 dark:text-gray-300">{age}</span>
      ),
    },
    {
      title: "Attendance Rate",
      key: "attendanceRate",
      width: 150,
      render: (record: GroupMember) => {
        const rate = record.attendanceRate || 0;
        let color = "red";
        if (rate >= 80) color = "green";
        else if (rate >= 50) color = "orange";

        return (
          <Tag color={color} className="font-semibold">
            {rate.toFixed(1)}%
          </Tag>
        );
      },
    },
    {
      title: "Status",
      key: "status",
      width: 120,
      render: (record: GroupMember) => (
        <Tag
          icon={
            record.isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />
          }
          color={record.isActive ? "success" : "default"}
        >
          {record.isActive ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (record: GroupMember) => (
        <Space>
          <Button
            type="link"
            size="small"
            onClick={() => router.push(`/leader/members/${record.id}`)}
          >
            View Details
          </Button>
        </Space>
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
        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-slate-800 dark:to-slate-900 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <UserOutlined className="text-2xl text-green-600 dark:text-green-400" />
            </div>
            Group Members
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2 ml-15">
            View and manage members in your fellowship group
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="shadow-lg dark:bg-slate-800 dark:border-slate-700">
          <Input
            placeholder="Search members by name or email..."
            prefix={<SearchOutlined />}
            size="large"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="max-w-md"
          />
        </Card>

        {/* Members Table */}
        <Card
          title={
            <span className="text-xl font-semibold">
              All Members ({filteredMembers.length})
            </span>
          }
          className="shadow-xl"
        >
          <Table
            columns={columns}
            dataSource={filteredMembers}
            rowKey="id"
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
