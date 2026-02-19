"use client";

import { UserRole } from "@/lib/types";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/features/navigation/DashboardLayout";
import { useAuth } from "@/providers/AuthProvider";
import {
  Card,
  Descriptions,
  Button as AntButton,
  Tag,
  Spin,
  message,
  Table,
  Modal,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  UserAddOutlined,
  CalendarOutlined,
  UserSwitchOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import { StatCard } from "@/components/ui/Card";
import type { ColumnsType } from "antd/es/table";

export default function GroupDetailsPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const groupId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState<GroupWithDetails | null>(null);
  const [members, setMembers] = useState<User[]>([]);

  useEffect(() => {
    fetchGroupDetails();
    fetchMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  const fetchGroupDetails = async () => {
    try {
      const response = await fetch(`/api/groups/${groupId}`);
      if (response.ok) {
        const data = await response.json();
        setGroup(data.data);
      } else {
        message.error("Group not found");
        router.push("/superadmin/groups");
      }
    } catch {
      message.error("Failed to load group");
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await fetch(`/api/groups/${groupId}/members`);
      if (response.ok) {
        const data = await response.json();
        setMembers(data.data);
      }
    } catch {
      console.error("Failed to load members");
    }
  };

  const handleRemoveMember = (memberId: string) => {
    Modal.confirm({
      title: "Remove Member",
      content: "Are you sure you want to remove this member from the group?",
      okText: "Remove",
      okType: "danger",
      onOk: async () => {
        try {
          const response = await fetch(
            `/api/groups/${groupId}/members/${memberId}`,
            { method: "DELETE" }
          );

          if (response.ok) {
            message.success("Member removed successfully");
            fetchMembers();
            fetchGroupDetails();
          } else {
            const error = await response.json();
            message.error(error.error || "Failed to remove member");
          }
        } catch {
          message.error("An error occurred");
        }
      },
    });
  };

  const handleDeleteGroup = () => {
    Modal.confirm({
      title: "Delete Group",
      content: (
        <div>
          <p>Are you sure you want to delete this group?</p>
          <p className="text-red-600 mt-2">
            Warning: This will also delete all meetings and interactions
            associated with this group. This action cannot be undone.
          </p>
        </div>
      ),
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const response = await fetch(`/api/groups/${groupId}`, {
            method: "DELETE",
          });

          if (response.ok) {
            message.success("Group deleted successfully");
            router.push("/superadmin/groups");
          } else {
            const error = await response.json();
            message.error(error.error || "Failed to delete group");
          }
        } catch {
          message.error("An error occurred while deleting the group");
        }
      },
    });
  };

  const columns: ColumnsType<User> = [
    {
      title: "Name",
      key: "name",
      render: (_, record) => `${record.firstName} ${record.lastName}`,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role: string) => (
        <Tag
          color={
            role === UserRole.SUPERADMIN
              ? "red"
              : role === UserRole.SMALL_GROUP_LEADER
                ? "blue"
                : "green"
          }
        >
          {role}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div className="flex gap-2">
          <AntButton
            size="small"
            onClick={() =>
              router.push(
                `/superadmin/groups/${groupId}/member/${record.id}/stats`
              )
            }
          >
            View Stats
          </AntButton>
          {user?.role === UserRole.SUPERADMIN &&
            record.id !== group?.leaderId && (
              <AntButton
                size="small"
                danger
                onClick={() => handleRemoveMember(record.id)}
              >
                Remove
              </AntButton>
            )}
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <DashboardLayout role={user?.role || UserRole.SUPERADMIN}>
        <div className="flex items-center justify-center h-96">
          <Spin size="large" />
        </div>
      </DashboardLayout>
    );
  }

  if (!group) {
    return (
      <DashboardLayout role={user?.role || UserRole.SUPERADMIN}>
        <div className="text-center py-12">
          <p className="text-gray-500">Group not found</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role={user?.role || UserRole.SUPERADMIN}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{group.name}</h2>
            <p className="text-gray-600 mt-1">{group.description}</p>
          </div>
          {user?.role === UserRole.SUPERADMIN && (
            <div className="flex flex-wrap gap-2">
              <AntButton
                icon={<BarChartOutlined />}
                onClick={() => router.push(`/superadmin/reports?groupId=${groupId}`)}
              >
                View Reports
              </AntButton>
              <AntButton
                icon={<UserSwitchOutlined />}
                onClick={() =>
                  router.push(`/superadmin/groups/${groupId}/assign-leader`)
                }
              >
                Assign Leader
              </AntButton>
              <AntButton
                icon={<UserAddOutlined />}
                onClick={() =>
                  router.push(`/superadmin/groups/${groupId}/add-member`)
                }
              >
                Add Member
              </AntButton>
              <AntButton
                icon={<EditOutlined />}
                onClick={() =>
                  router.push(`/superadmin/groups/${groupId}/edit`)
                }
              >
                Edit
              </AntButton>
              <AntButton
                danger
                icon={<DeleteOutlined />}
                onClick={handleDeleteGroup}
              >
                Delete
              </AntButton>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mx-2 sm:mx-0">
          <StatCard
            title="Total Members"
            value={group.memberCount}
            icon={<UserAddOutlined />}
            color="text-blue-600 dark:text-blue-400"
          />
          <StatCard
            title="Recent Meetings"
            value={group.recentMeetings?.length || 0}
            icon={<CalendarOutlined />}
            color="text-green-600 dark:text-green-400"
          />
          <StatCard
            title="Attendance Rate"
            value={`${group.attendanceRate?.toFixed(0) || 0}%`}
            icon={<CalendarOutlined />}
            color="text-purple-600 dark:text-purple-400"
          />
        </div>

        <Card title="Group Information">
          <Descriptions column={2} bordered>
            <Descriptions.Item label="Leader" span={2}>
              {group.leader
                ? `${group.leader.firstName} ${group.leader.lastName}`
                : "Not assigned"}
            </Descriptions.Item>
            <Descriptions.Item label="Meeting Frequency">
              {group.meetingFrequency}
            </Descriptions.Item>
            <Descriptions.Item label="Member Count">
              {group.memberCount}
            </Descriptions.Item>
            <Descriptions.Item label="Created" span={2}>
              {new Date(group.createdAt).toLocaleDateString()}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card title="Group Members">
          <Table
            dataSource={members}
            columns={columns}
            rowKey="id"
            scroll={{ x: 1000 }}
            pagination={{ pageSize: 10 }}
          />
        </Card>
      </div>
    </DashboardLayout>
  );
}
