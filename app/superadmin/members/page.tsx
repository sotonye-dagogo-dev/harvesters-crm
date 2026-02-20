"use client";

import { UserRole } from "@/lib/types";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/features/navigation/DashboardLayout";
import { Spin, message } from "antd";
import Card from "@/components/ui/Card";
import Table from "@/components/ui/Table";
import StatusBadge, { BooleanBadge } from "@/components/ui/StatusBadge";
import FilterToolbar, {
  type FilterConfig,
} from "@/components/ui/FilterToolbar";
import { EditOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

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

  const memberFilters: FilterConfig[] = [
    {
      key: "search",
      type: "search",
      label: "Members",
      placeholder: "Search by name or email",
      width: "100%",
    },
    {
      key: "role",
      type: "select",
      label: "Role",
      placeholder: "Filter by role",
      options: [
        { label: "Superadmin", value: "SUPERADMIN" },
        { label: "Leader", value: "LEADER" },
        { label: "Member", value: "MEMBER" },
      ],
      width: 200,
    },
  ];

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
      render: (role: UserRole) => <StatusBadge status={role} category="role" />,
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
        <BooleanBadge
          value={isActive}
          trueLabel="Active"
          falseLabel="Inactive"
        />
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
          <FilterToolbar
            filters={memberFilters}
            values={{ search: searchText, role: roleFilter }}
            onChange={(key, value) => {
              if (key === "search") setSearchText(value as string);
              if (key === "role") setRoleFilter(value as string | undefined);
            }}
            onReset={() => {
              setSearchText("");
              setRoleFilter(undefined);
            }}
            className="!mb-0"
          />

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
                  onClick: (record) =>
                    router.push(`/superadmin/users/${record.id}`),
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
