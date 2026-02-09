"use client";

import { UserRole } from "@/lib/types";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/features/navigation/DashboardLayout";
import {
  Card,
  Descriptions,
  List,
  Avatar,
  Tag,
  Spin,
  Button,
  Empty,
  message,
} from "antd";
import {
  TeamOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
} from "@ant-design/icons";

interface GroupMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
}

interface Group {
  id: string;
  name: string;
  description: string;
  meetingFrequency: string;
  leaderId: string;
  leader?: GroupMember;
  members: GroupMember[];
  createdAt: string;
}

export default function MyGroupPage() {
  const router = useRouter();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMyGroup = useCallback(async () => {
    try {
      setLoading(true);
      // Get current user's group
      const userResponse = await fetch("/api/auth/me");

      if (!userResponse.ok) {
        message.error("Session expired. Please log in again.");
        router.push("/login");
        return;
      }

      const userData = await userResponse.json();
      const user = userData.data || userData;

      if (!user.groupId) {
        setLoading(false);
        return;
      }

      // Fetch group details
      const groupResponse = await fetch(`/api/groups/${user.groupId}`);

      if (!groupResponse.ok) {
        throw new Error("Failed to fetch group");
      }

      const groupData = await groupResponse.json();
      setGroup(groupData.data || groupData);
    } catch (error) {
      console.error("Failed to fetch group:", error);
      message.error("Failed to load group details. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchMyGroup();
  }, [fetchMyGroup]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-96">
          <Spin size="large" />
        </div>
      </DashboardLayout>
    );
  }

  if (!group) {
    return (
      <DashboardLayout>
        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <Empty
            description={
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  You are not currently assigned to a group
                </p>
                <Button
                  type="primary"
                  onClick={() => router.push("/member/membership-requests/new")}
                >
                  Request to Join a Group
                </Button>
              </div>
            }
          />
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <TeamOutlined className="text-church-primary dark:text-green-400" />
              {group.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Your fellowship group
            </p>
          </div>
        </div>

        <Card
          title="Group Information"
          className="dark:bg-slate-800 dark:border-slate-700"
        >
          <Descriptions column={{ xs: 1, sm: 2 }} bordered>
            <Descriptions.Item label="Group Name">
              {group.name}
            </Descriptions.Item>
            <Descriptions.Item label="Meeting Frequency">
              <Tag color="blue">{group.meetingFrequency}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Description" span={2}>
              {group.description || "No description provided"}
            </Descriptions.Item>
            <Descriptions.Item label="Total Members" span={2}>
              {group.members?.length || 0} members
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {group.leader && (
          <Card
            title="Group Leader"
            className="dark:bg-slate-800 dark:border-slate-700"
          >
            <div className="flex items-center gap-4">
              <Avatar size={64} icon={<UserOutlined />} />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {group.leader.firstName} {group.leader.lastName}
                </h3>
                <div className="space-y-1 mt-2">
                  <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <MailOutlined /> {group.leader.email}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <PhoneOutlined /> {group.leader.phone}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}

        <Card
          title={`Group Members (${group.members?.length || 0})`}
          className="dark:bg-slate-800 dark:border-slate-700"
        >
          <List
            dataSource={group.members || []}
            renderItem={(member) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar icon={<UserOutlined />} />}
                  title={
                    <div className="flex items-center gap-2">
                      <span className="text-gray-900 dark:text-white">
                        {member.firstName} {member.lastName}
                      </span>
                      {member.role === UserRole.SMALL_GROUP_LEADER && (
                        <Tag color="blue">Leader</Tag>
                      )}
                    </div>
                  }
                  description={
                    <div className="text-gray-600 dark:text-gray-400">
                      <div className="flex flex-col sm:flex-row sm:gap-4">
                        <span className="flex items-center gap-1">
                          <MailOutlined /> {member.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <PhoneOutlined /> {member.phone}
                        </span>
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
            locale={{
              emptyText: "No members in this group yet",
            }}
          />
        </Card>
      </div>
    </DashboardLayout>
  );
}
