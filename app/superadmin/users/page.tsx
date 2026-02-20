"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/features/navigation/DashboardLayout";
import { Input, Select, message, Form, DatePicker } from "antd";
import { PasswordInput } from "@/components/ui/Input";
import Modal, { ConfirmModal } from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import FilterToolbar, {
  type FilterConfig,
} from "@/components/ui/FilterToolbar";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import UserCard from "@/components/features/users/UserCard";
import EmptyState from "@/components/ui/EmptyState";
import { CardSkeleton } from "@/components/ui/LoadingSkeleton";
import { useRouter } from "next/navigation";
import { UserRole } from "@/lib/types";
import dayjs from "dayjs";

const userPageFilters: FilterConfig[] = [
  {
    key: "search",
    type: "search",
    label: "Users",
    placeholder: "Search by name or email",
    width: "100%",
  },
  {
    key: "role",
    type: "select",
    label: "Role",
    placeholder: "All Roles",
    allowClear: false,
    options: [
      { label: "All Roles", value: "ALL" },
      { label: "Superadmin", value: "SUPERADMIN" },
      { label: "Leader", value: "LEADER" },
      { label: "Member", value: "MEMBER" },
    ],
    width: 200,
  },
];

export default function UsersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [form] = Form.useForm();
  const [createForm] = Form.useForm();
  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
  const [deactivateUserId, setDeactivateUserId] = useState<string | null>(null);
  const [deactivateLoading, setDeactivateLoading] = useState(false);
  const deactivateUser = deactivateUserId
    ? users.find((u) => u.id === deactivateUserId)
    : null;

  useEffect(() => {
    fetchUsers();
    fetchGroups();
  }, []);

  useEffect(() => {
    filterUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, roleFilter, users]);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data.data);
      }
    } catch {
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
    } catch {
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

  const handleDeactivate = (userId: string) => {
    setDeactivateUserId(userId);
    setDeactivateModalOpen(true);
  };

  const handleConfirmDeactivate = async () => {
    if (!deactivateUserId || !deactivateUser) return;

    setDeactivateLoading(true);
    try {
      const response = await fetch(`/api/users/${deactivateUserId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !deactivateUser.isActive }),
      });

      if (response.ok) {
        message.success(
          `User ${deactivateUser.isActive ? "deactivated" : "activated"} successfully`
        );
        fetchUsers();
      } else {
        const error = await response.json();
        message.error(error.error || "Failed to update user");
      }
    } catch {
      message.error("An error occurred");
    } finally {
      setDeactivateLoading(false);
      setDeactivateModalOpen(false);
      setDeactivateUserId(null);
    }
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
    } catch {
      message.error("An error occurred");
    }
  };

  const handleCreateUser = async (values: Record<string, unknown>) => {
    setCreateLoading(true);
    try {
      const payload = {
        ...values,
        dateOfBirth: values.dateOfBirth
          ? dayjs(values.dateOfBirth as string).format("YYYY-MM-DD")
          : undefined,
        age: values.dateOfBirth
          ? dayjs().diff(dayjs(values.dateOfBirth as string), "year")
          : undefined,
      };

      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        message.success("User created successfully");
        setShowCreateModal(false);
        createForm.resetFields();
        fetchUsers();
      } else {
        const error = await response.json();
        message.error(error.error || "Failed to create user");
      }
    } catch {
      message.error("An error occurred while creating user");
    } finally {
      setCreateLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role={UserRole.SUPERADMIN}>
        <CardSkeleton count={6} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role={UserRole.SUPERADMIN}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-ds-text-primary">
              User Management
            </h2>
            <p className="text-ds-text-secondary mt-1">
              Manage church members, leaders, and administrators
            </p>
          </div>
          <Button
            icon={<PlusOutlined />}
            onClick={() => setShowCreateModal(true)}
          >
            Add User
          </Button>
        </div>

        <FilterToolbar
          filters={userPageFilters}
          values={{ search: searchTerm, role: roleFilter }}
          onChange={(key, value) => {
            if (key === "search") setSearchTerm(value as string);
            if (key === "role") setRoleFilter(value as string);
          }}
          onReset={() => {
            setSearchTerm("");
            setRoleFilter("ALL");
          }}
        />

        <div className="text-sm text-ds-text-secondary">
          Showing {filteredUsers.length} of {users.length} users
        </div>

        {filteredUsers.length === 0 ? (
          <EmptyState
            icon={<SearchOutlined className="text-ds-text-subtle" />}
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
                onEdit={(id) => router.push(`/superadmin/users/${id}`)}
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
          size="sm"
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
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowAssignModal(false);
                    form.resetFields();
                    setSelectedUserId(null);
                  }}
                >
                  Cancel
                </Button>
                <Button htmlType="submit">Assign</Button>
              </div>
            </Form.Item>
          </Form>
        </Modal>

        {/* Create User Modal */}
        <Modal
          title="Create New User"
          open={showCreateModal}
          onCancel={() => {
            setShowCreateModal(false);
            createForm.resetFields();
          }}
          footer={null}
          size="lg"
        >
          <Form
            form={createForm}
            layout="vertical"
            onFinish={handleCreateUser}
            initialValues={{
              role: UserRole.MEMBER,
              gender: "MALE",
              maritalStatus: "SINGLE",
              employmentStatus: "EMPLOYED",
            }}
            className="mt-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
              <Form.Item
                name="firstName"
                label="First Name"
                rules={[{ required: true, message: "First name is required" }]}
              >
                <Input placeholder="Enter first name" size="large" />
              </Form.Item>
              <Form.Item
                name="lastName"
                label="Last Name"
                rules={[{ required: true, message: "Last name is required" }]}
              >
                <Input placeholder="Enter last name" size="large" />
              </Form.Item>
            </div>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Email is required" },
                { type: "email", message: "Please enter a valid email" },
              ]}
            >
              <Input placeholder="Enter email address" size="large" />
            </Form.Item>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
              <Form.Item
                name="password"
                label="Password"
                rules={[
                  { required: true, message: "Password is required" },
                  { min: 8, message: "Password must be at least 8 characters" },
                ]}
              >
                <PasswordInput placeholder="Set password" size="large" />
              </Form.Item>
              <Form.Item
                name="role"
                label="Role"
                rules={[{ required: true, message: "Role is required" }]}
              >
                <Select
                  size="large"
                  options={[
                    { label: "Superadmin", value: UserRole.SUPERADMIN },
                    { label: "Group Pastor", value: UserRole.GROUP_PASTOR },
                    { label: "Group Admin", value: UserRole.GROUP_ADMIN },
                    { label: "Campus Pastor", value: UserRole.CAMPUS_PASTOR },
                    { label: "Campus Admin", value: UserRole.CAMPUS_ADMIN },
                    { label: "Zonal Leader", value: UserRole.ZONAL_LEADER },
                    { label: "HOD", value: UserRole.HOD },
                    {
                      label: "Small Group Leader",
                      value: UserRole.SMALL_GROUP_LEADER,
                    },
                    { label: "Cell Leader", value: UserRole.CELL_LEADER },
                    { label: "Data Entry", value: UserRole.DATA_ENTRY },
                    { label: "Member", value: UserRole.MEMBER },
                  ]}
                />
              </Form.Item>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
              <Form.Item
                name="phone"
                label="Phone"
                rules={[
                  { required: true, message: "Phone number is required" },
                ]}
              >
                <Input placeholder="Enter phone number" size="large" />
              </Form.Item>
              <Form.Item name="whatsappPhone" label="WhatsApp Phone">
                <Input placeholder="Enter WhatsApp number" size="large" />
              </Form.Item>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
              <Form.Item
                name="dateOfBirth"
                label="Date of Birth"
                rules={[
                  { required: true, message: "Date of birth is required" },
                ]}
              >
                <DatePicker
                  className="w-full"
                  size="large"
                  format="D MMM YYYY"
                />
              </Form.Item>
              <Form.Item
                name="gender"
                label="Gender"
                rules={[{ required: true, message: "Gender is required" }]}
              >
                <Select
                  size="large"
                  options={[
                    { label: "Male", value: "MALE" },
                    { label: "Female", value: "FEMALE" },
                  ]}
                />
              </Form.Item>
            </div>
            <Form.Item
              name="address"
              label="Address"
              rules={[{ required: true, message: "Address is required" }]}
            >
              <Input placeholder="Enter address" size="large" />
            </Form.Item>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
              <Form.Item name="maritalStatus" label="Marital Status">
                <Select
                  size="large"
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
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowCreateModal(false);
                    createForm.resetFields();
                  }}
                >
                  Cancel
                </Button>
                <Button htmlType="submit" loading={createLoading}>
                  Create User
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Modal>

        {/* Deactivate/Activate User Confirm Modal */}
        <ConfirmModal
          open={deactivateModalOpen}
          title={deactivateUser?.isActive ? "Deactivate User" : "Activate User"}
          content={`Are you sure you want to ${deactivateUser?.isActive ? "deactivate" : "activate"} this user?`}
          danger={deactivateUser?.isActive ?? false}
          confirmLoading={deactivateLoading}
          onConfirm={handleConfirmDeactivate}
          onCancel={() => {
            setDeactivateModalOpen(false);
            setDeactivateUserId(null);
          }}
        />
      </div>
    </DashboardLayout>
  );
}
