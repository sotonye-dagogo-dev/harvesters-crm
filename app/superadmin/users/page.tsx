"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/features/navigation/DashboardLayout";
import { Input, Select, Button as AntButton, message, Modal, Form } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import UserCard from "@/components/features/users/UserCard";
import EmptyState from "@/components/ui/EmptyState";
import { CardSkeleton } from "@/components/ui/LoadingSkeleton";
import { useRouter } from "next/navigation";

const { Search } = Input;

export default function UsersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchUsers();
    fetchGroups();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, roleFilter, users]);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data.data);
      }
    } catch (error) {
      message.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await fetch("/api/groups");
      if (response.ok) {
        const data = await response.json();
        setGroups(data.data);
      }
    } catch (error) {
      console.error("Failed to load groups");
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Filter by role
    if (roleFilter !== "ALL") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.firstName.toLowerCase().includes(term) ||
          user.lastName.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term)
      );
    }

    setFilteredUsers(filtered);
  };

  const handleDeactivate = async (userId: string) => {
    const user = users.find((u) => u.id === userId);
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
            fetchUsers();
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

  const handleAssignGroup = (userId: string) => {
    setSelectedUserId(userId);
    setShowAssignModal(true);
  };

  const handleAssignSubmit = async (values: { groupId: string }) => {
    if (!selectedUserId) return;

    try {
      const response = await fetch(
        `/api/groups/${values.groupId}/members/${selectedUserId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "APPROVED" }),
        }
      );

      if (response.ok) {
        message.success("User assigned to group successfully");
        setShowAssignModal(false);
        form.resetFields();
        setSelectedUserId(null);
      } else {
        const error = await response.json();
        message.error(error.error || "Failed to assign user");
      }
    } catch (error) {
      message.error("An error occurred");
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="SUPERADMIN">
        <CardSkeleton count={6} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="SUPERADMIN">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              User Management
            </h2>
            <p className="text-gray-600 mt-1">
              Manage church members, leaders, and administrators
            </p>
          </div>
          <AntButton
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => router.push("/users/new")}
          >
            Add User
          </AntButton>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Search
            placeholder="Search by name or email"
            allowClear
            size="large"
            prefix={<SearchOutlined />}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Select
            size="large"
            value={roleFilter}
            onChange={setRoleFilter}
            style={{ width: 200 }}
            options={[
              { label: "All Roles", value: "ALL" },
              { label: "Superadmin", value: "SUPERADMIN" },
              { label: "Leader", value: "LEADER" },
              { label: "Member", value: "MEMBER" },
            ]}
          />
        </div>

        <div className="text-sm text-gray-600">
          Showing {filteredUsers.length} of {users.length} users
        </div>

        {filteredUsers.length === 0 ? (
          <EmptyState
            icon={<SearchOutlined className="text-gray-300" />}
            title="No users found"
            description={
              searchTerm || roleFilter !== "ALL"
                ? "Try adjusting your search or filters"
                : "No users have been added yet"
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                showActions
                onEdit={(id) => router.push(`/users/${id}/edit`)}
                onDeactivate={handleDeactivate}
                onAssignGroup={handleAssignGroup}
              />
            ))}
          </div>
        )}

        <Modal
          title="Assign User to Group"
          open={showAssignModal}
          onCancel={() => {
            setShowAssignModal(false);
            form.resetFields();
            setSelectedUserId(null);
          }}
          footer={null}
        >
          <Form form={form} layout="vertical" onFinish={handleAssignSubmit}>
            <Form.Item
              name="groupId"
              label="Select Group"
              rules={[{ required: true, message: "Please select a group" }]}
            >
              <Select
                placeholder="Choose a group"
                size="large"
                options={groups.map((group) => ({
                  label: group.name,
                  value: group.id,
                }))}
              />
            </Form.Item>
            <Form.Item className="mb-0">
              <div className="flex justify-end gap-2">
                <AntButton
                  onClick={() => {
                    setShowAssignModal(false);
                    form.resetFields();
                    setSelectedUserId(null);
                  }}
                >
                  Cancel
                </AntButton>
                <AntButton type="primary" htmlType="submit">
                  Assign
                </AntButton>
              </div>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
