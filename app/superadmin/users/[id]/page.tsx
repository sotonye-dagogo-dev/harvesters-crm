"use client";

import { UserRole } from "@/lib/types";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/features/navigation/DashboardLayout";
import {
  Card,
  Descriptions,
  Button as AntButton,
  Tag,
  Spin,
  message,
  Modal,
  Select,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  UserSwitchOutlined,
} from "@ant-design/icons";
import ProfileAvatar from "@/components/features/users/ProfileAvatar";

export default function UserDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [newRole, setNewRole] = useState<string>("");

  useEffect(() => {
    fetchUser();
  }, [userId]);

  const fetchUser = async () => {
    try {
      const response = await fetch(`/api/users/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUser(data.data);
      } else {
        message.error("User not found");
        router.push("/superadmin/users");
      }
    } catch (error) {
      message.error("Failed to load user");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async () => {
    if (!newRole) return;

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        message.success("User role updated successfully");
        setRoleModalOpen(false);
        fetchUser();
      } else {
        const error = await response.json();
        message.error(error.error || "Failed to update role");
      }
    } catch (error) {
      message.error("An error occurred");
    }
  };

  const handleDeactivate = () => {
    if (!user) return;

    Modal.confirm({
      title: user.isActive ? "Deactivate User" : "Activate User",
      content: `Are you sure you want to ${
        user.isActive ? "deactivate" : "activate"
      } this user?`,
      okText: "Confirm",
      cancelText: "Cancel",
      okButtonProps: user.isActive ? { danger: true } : undefined,
      onOk: async () => {
        try {
          const response = await fetch(`/api/users/${userId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isActive: !user.isActive }),
          });

          if (response.ok) {
            message.success(
              `User ${user.isActive ? "deactivated" : "activated"} successfully`
            );
            fetchUser();
          } else {
            const error = await response.json();
            message.error(error.error || "Failed to update user");
          }
        } catch (error) {
          message.error("An error occurred");
        }
      },
    });
  };

  if (loading) {
    return (
      <DashboardLayout role={UserRole.SUPERADMIN}>
        <div className="flex items-center justify-center h-96">
          <Spin size="large" />
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout role={UserRole.SUPERADMIN}>
        <div className="text-center py-12">
          <p className="text-gray-500">User not found</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role={UserRole.SUPERADMIN}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">User Details</h2>
          <div className="flex gap-2">
            <AntButton
              icon={<EditOutlined />}
              onClick={() => router.push(`/users/${userId}/edit`)}
            >
              Edit
            </AntButton>
            <AntButton
              icon={<UserSwitchOutlined />}
              onClick={() => {
                setNewRole(user.role);
                setRoleModalOpen(true);
              }}
            >
              Change Role
            </AntButton>
            <AntButton
              danger={user.isActive}
              icon={<DeleteOutlined />}
              onClick={handleDeactivate}
            >
              {user.isActive ? "Deactivate" : "Activate"}
            </AntButton>
          </div>
        </div>

        <Card>
          <div className="flex items-start gap-6 mb-6">
            <ProfileAvatar
              firstName={user.firstName}
              lastName={user.lastName}
              avatarUrl={user.avatar}
              size={80}
            />
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900">
                {user.firstName} {user.lastName}
              </h3>
              <p className="text-gray-600">{user.email}</p>
              <div className="mt-2 flex gap-2">
                <Tag
                  color={
                    user.role === UserRole.SUPERADMIN
                      ? "red"
                      : user.role === UserRole.SMALL_GROUP_LEADER
                        ? "blue"
                        : "green"
                  }
                >
                  {user.role}
                </Tag>
                <Tag color={user.isActive ? "success" : "error"}>
                  {user.isActive ? "Active" : "Inactive"}
                </Tag>
              </div>
            </div>
          </div>

          <Descriptions column={2} bordered>
            <Descriptions.Item label="Phone" span={2}>
              {user.phone}
            </Descriptions.Item>
            <Descriptions.Item label="WhatsApp">
              {user.whatsappPhone || "Not provided"}
            </Descriptions.Item>
            <Descriptions.Item label="Age">
              {user.age || "Not provided"}
            </Descriptions.Item>
            <Descriptions.Item label="Location" span={2}>
              {user.location || "Not provided"}
            </Descriptions.Item>
            <Descriptions.Item label="Marital Status">
              {user.maritalStatus || "Not provided"}
            </Descriptions.Item>
            <Descriptions.Item label="Employment Status">
              {user.employmentStatus || "Not provided"}
            </Descriptions.Item>
            <Descriptions.Item label="Interests" span={2}>
              {user.interests && user.interests.length > 0
                ? user.interests.join(", ")
                : "Not provided"}
            </Descriptions.Item>
            <Descriptions.Item label="Created At" span={2}>
              {new Date(user.createdAt).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Updated At" span={2}>
              {new Date(user.updatedAt).toLocaleString()}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Modal
          title="Change User Role"
          open={roleModalOpen}
          onOk={handleRoleChange}
          onCancel={() => setRoleModalOpen(false)}
          okText="Change Role"
        >
          <div className="py-4">
            <p className="text-gray-600 mb-4">
              Select the new role for {user.firstName} {user.lastName}:
            </p>
            <Select
              value={newRole}
              onChange={setNewRole}
              style={{ width: "100%" }}
              size="large"
              options={[
                { label: "Superadmin", value: UserRole.SUPERADMIN },
                { label: "Leader", value: UserRole.SMALL_GROUP_LEADER },
                { label: "Member", value: UserRole.MEMBER },
              ]}
            />
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
