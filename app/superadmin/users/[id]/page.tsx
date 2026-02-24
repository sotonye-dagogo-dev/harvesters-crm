"use client";

import { UserRole } from "@/lib/types";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { formatDateTime } from "@/lib/utils/format";
import DashboardLayout from "@/components/features/navigation/DashboardLayout";
import {
  Card,
  Descriptions,
  Button as AntButton,
  Spin,
  message,
  Modal,
  Select,
  Form,
  Input,
} from "antd";
import StatusBadge, { BooleanBadge } from "@/components/ui/StatusBadge";
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
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [newRole, setNewRole] = useState<string>("");
  const [editForm] = Form.useForm();

  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    } catch {
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
    } catch {
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
        } catch {
          message.error("An error occurred");
        }
      },
    });
  };

  const openEditModal = () => {
    if (!user) return;
    editForm.setFieldsValue({
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      whatsappPhone: user.whatsappPhone || "",
      location: user.location || "",
      maritalStatus: user.maritalStatus || undefined,
      employmentStatus: user.employmentStatus || undefined,
    });
    setEditModalOpen(true);
  };

  const handleEditUser = async (values: Record<string, unknown>) => {
    setEditLoading(true);
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        message.success("User updated successfully");
        setEditModalOpen(false);
        fetchUser();
      } else {
        const error = await response.json();
        message.error(error.error || "Failed to update user");
      }
    } catch {
      message.error("An error occurred while updating user");
    } finally {
      setEditLoading(false);
    }
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
          <p className="text-ds-text-subtle">User not found</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role={UserRole.SUPERADMIN}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-ds-text-primary">User Details</h2>
          <div className="flex gap-2">
            <AntButton
              icon={<EditOutlined />}
              onClick={openEditModal}
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
              <h3 className="text-xl font-semibold text-ds-text-primary">
                {user.firstName} {user.lastName}
              </h3>
              <p className="text-ds-text-secondary">{user.email}</p>
              <div className="mt-2 flex gap-2">
                <StatusBadge status={user.role} category="role" />
                <BooleanBadge value={user.isActive} trueLabel="Active" falseLabel="Inactive" />
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
              {formatDateTime(user.createdAt)}
            </Descriptions.Item>
            <Descriptions.Item label="Updated At" span={2}>
              {formatDateTime(user.updatedAt)}
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
            <p className="text-ds-text-secondary mb-4">
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

        {/* Edit User Modal */}
        <Modal
          title={`Edit User — ${user.firstName} ${user.lastName}`}
          open={editModalOpen}
          onCancel={() => { setEditModalOpen(false); editForm.resetFields(); }}
          footer={null}
          width={560}
        >
          <Form
            form={editForm}
            layout="vertical"
            onFinish={handleEditUser}
            className="mt-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
              <Form.Item
                name="firstName"
                label="First Name"
                rules={[{ required: true, message: "First name is required" }]}
              >
                <Input size="large" />
              </Form.Item>
              <Form.Item
                name="lastName"
                label="Last Name"
                rules={[{ required: true, message: "Last name is required" }]}
              >
                <Input size="large" />
              </Form.Item>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
              <Form.Item
                name="phone"
                label="Phone"
                rules={[{ required: true, message: "Phone is required" }]}
              >
                <Input size="large" />
              </Form.Item>
              <Form.Item name="whatsappPhone" label="WhatsApp Phone">
                <Input size="large" />
              </Form.Item>
            </div>
            <Form.Item name="location" label="Location">
              <Input size="large" />
            </Form.Item>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
              <Form.Item name="maritalStatus" label="Marital Status">
                <Select
                  size="large"
                  allowClear
                  options={[
                    { label: "Single", value: "SINGLE" },
                    { label: "Married", value: "MARRIED" },
                    { label: "Divorced", value: "DIVORCED" },
                    { label: "Widowed", value: "WIDOWED" },
                  ]}
                />
              </Form.Item>
              <Form.Item name="employmentStatus" label="Employment Status">
                <Select
                  size="large"
                  allowClear
                  options={[
                    { label: "Student", value: "STUDENT" },
                    { label: "Employed", value: "EMPLOYED" },
                    { label: "Self-Employed", value: "SELF_EMPLOYED" },
                    { label: "Unemployed", value: "UNEMPLOYED" },
                  ]}
                />
              </Form.Item>
            </div>
            <Form.Item className="mb-0 mt-4">
              <div className="flex justify-end gap-2">
                <AntButton onClick={() => { setEditModalOpen(false); editForm.resetFields(); }}>
                  Cancel
                </AntButton>
                <AntButton type="primary" htmlType="submit" loading={editLoading}>
                  Save Changes
                </AntButton>
              </div>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
