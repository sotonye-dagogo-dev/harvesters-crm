"use client";

import { UserRole } from "@/lib/types";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/features/navigation/DashboardLayout";
import { Select, Spin, message } from "antd";
import Card from "@/components/ui/Card";
import Table from "@/components/ui/Table";
import StatusBadge, { BooleanBadge } from "@/components/ui/StatusBadge";
import { EditOutlined } from "@ant-design/icons";
import { SearchInput } from "@/components/ui/SearchInput";
import type { ColumnsType } from "antd/es/table";
const { Option } = Select;

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  groupId?: string;
  isActive: boolean;
  createdAt: string;
}

export default function MembersPage() {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | undefined>();

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (roleFilter) params.append("role", roleFilter);

      const response = await fetch(`/api/users?${params}`);
      if (response.ok) {
        const data = await response.json();
        setMembers(data.data || []);
      } else {
        message.error("Failed to fetch members");
      }
    } catch {
      message.error("An error occurred while fetching members");
    } finally {
      setLoading(false);
    }
  }, [roleFilter]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const columns: ColumnsType<Member> = [
    {
      title: "Name",
      key: "name",
      render: (_, record) => `${record.firstName} ${record.lastName}`,
      sorter: (a, b) => a.firstName.localeCompare(b.firstName),
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
      render: (role: UserRole) => (
        <StatusBadge status={role} category="role" />
      ),
      filters: [
        { text: "Superadmin", value: "SUPERADMIN" },
        { text: "Leader", value: "LEADER" },
        { text: "Member", value: "MEMBER" },
      ],
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: boolean) => (
        <BooleanBadge value={isActive} trueLabel="Active" falseLabel="Inactive" />
      ),
    },
  ];

  const filteredMembers = members.filter((member) =>
    searchText
      ? member.firstName.toLowerCase().includes(searchText.toLowerCase()) ||
        member.lastName.toLowerCase().includes(searchText.toLowerCase()) ||
        member.email.toLowerCase().includes(searchText.toLowerCase())
      : true
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-ds-text-primary">
              Members Directory
            </h1>
            <p className="text-ds-text-secondary mt-1">
              Manage all church members
            </p>
          </div>
        </div>

        <Card className="dark:bg-ds-surface-elevated dark:border-ds-border-base">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <SearchInput
              placeholder="Search by name or email"
              allowClear
              size="large"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="flex-1"
            />
            <Select
              placeholder="Filter by role"
              allowClear
              size="large"
              style={{ width: 200 }}
              value={roleFilter}
              onChange={setRoleFilter}
            >
              <Option value="SUPERADMIN">Superadmin</Option>
              <Option value="LEADER">Leader</Option>
              <Option value="MEMBER">Member</Option>
            </Select>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Spin size="large" />
            </div>
          ) : (
            <Table
              columns={columns}
              dataSource={filteredMembers}
              rowKey="id"
              actions={[
                {
                  key: "view",
                  label: "View",
                  icon: <EditOutlined />,
                  onClick: (record) => router.push(`/superadmin/users/${record.id}`),
                },
              ]}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} members`,
              }}
              scroll={{ x: 800 }}
            />
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
