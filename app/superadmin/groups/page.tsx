"use client";

import { useEffect, useState, useCallback } from "react";
import DashboardLayout from "@/components/features/navigation/DashboardLayout";
import { useAuth } from "@/providers/AuthProvider";
import { message, Tabs, Tag, Statistic, Tooltip } from "antd";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import FilterToolbar, {
  type FilterConfig,
} from "@/components/ui/FilterToolbar";
import {
  PlusOutlined,
  SearchOutlined,
  BankOutlined,
  TeamOutlined,
  AppstoreOutlined,
  ClusterOutlined,
  UserOutlined,
} from "@ant-design/icons";
import GroupCard from "@/components/features/groups/GroupCard";
import EmptyState from "@/components/ui/EmptyState";
import { CardSkeleton } from "@/components/ui/LoadingSkeleton";
import { useRouter } from "next/navigation";
import { UserRole } from "@/lib/types";

const searchFilter: FilterConfig[] = [
  {
    key: "search",
    type: "search",
    label: "Search",
    placeholder: "Search by name...",
    width: "100%",
  },
];

interface OrgSummary {
  campuses: Campus[];
  departments: Department[];
  groups: GroupWithDetails[];
  cells: Cell[];
}

export default function GroupsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<OrgSummary>({
    campuses: [],
    departments: [],
    groups: [],
    cells: [],
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  const fetchAll = useCallback(async () => {
    try {
      const [campusRes, deptRes, groupRes, cellRes] = await Promise.all([
        fetch("/api/campuses?pageSize=100"),
        fetch("/api/departments?pageSize=100"),
        fetch("/api/groups?pageSize=100"),
        fetch("/api/cells?pageSize=100"),
      ]);

      const [campusData, deptData, groupData, cellData] = await Promise.all([
        campusRes.ok ? campusRes.json() : { data: [] },
        deptRes.ok ? deptRes.json() : { data: [] },
        groupRes.ok ? groupRes.json() : { data: [] },
        cellRes.ok ? cellRes.json() : { data: [] },
      ]);

      setData({
        campuses: campusData.data || [],
        departments: deptData.data || [],
        groups: groupData.data || [],
        cells: cellData.data || [],
      });
    } catch {
      message.error("Failed to load organizational data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const filterBySearch = <T extends { name: string }>(items: T[]): T[] => {
    if (!searchTerm) return items;
    const term = searchTerm.toLowerCase();
    return items.filter((item) => item.name.toLowerCase().includes(term));
  };

  if (loading) {
    return (
      <DashboardLayout role={user?.role || UserRole.SUPERADMIN}>
        <CardSkeleton count={6} />
      </DashboardLayout>
    );
  }

  const overviewStats = [
    {
      label: "Campuses",
      value: data.campuses.length,
      icon: <BankOutlined className="text-ds-chart-1 text-2xl" />,
      color: "bg-ds-chart-1/10",
    },
    {
      label: "Departments",
      value: data.departments.length,
      icon: <AppstoreOutlined className="text-ds-chart-3 text-2xl" />,
      color: "bg-ds-chart-3/10",
    },
    {
      label: "Groups",
      value: data.groups.length,
      icon: <TeamOutlined className="text-ds-brand-accent text-2xl" />,
      color: "bg-ds-brand-accent-subtle",
    },
    {
      label: "Cells",
      value: data.cells.length,
      icon: <ClusterOutlined className="text-ds-chart-6 text-2xl" />,
      color: "bg-ds-chart-6/10",
    },
  ];

  const tabItems = [
    {
      key: "overview",
      label: (
        <span className="flex items-center gap-2">
          <AppstoreOutlined /> Overview
        </span>
      ),
      children: (
        <div className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {overviewStats.map((stat) => (
              <div
                key={stat.label}
                className="bg-ds-surface-elevated rounded-xl p-5 border border-ds-border-base cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setActiveTab(stat.label.toLowerCase())}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}
                  >
                    {stat.icon}
                  </div>
                  <span className="text-sm font-medium text-ds-text-secondary">
                    {stat.label}
                  </span>
                </div>
                <Statistic
                  value={stat.value}
                  valueStyle={{
                    fontSize: "1.75rem",
                    fontWeight: 700,
                    lineHeight: 1,
                  }}
                />
              </div>
            ))}
          </div>

          {/* Campuses with nested structure */}
          <div>
            <h3 className="text-lg font-bold text-ds-text-primary mb-4">
              Campus Breakdown
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.campuses.map((campus) => {
                const campusGroups = data.groups.filter(
                  (g) => g.campusId === campus.id
                );
                const campusCells = data.cells.filter(
                  (c) => c.campusId === campus.id
                );
                const campusDepts = data.departments.filter(
                  (d) => d.campusId === campus.id
                );
                return (
                  <Card
                    key={campus.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-base font-bold text-ds-text-primary">
                          {campus.name}
                        </h4>
                        <Tag
                          color={campus.isActive ? "success" : "default"}
                          className="text-xs"
                        >
                          {campus.isActive ? "Active" : "Inactive"}
                        </Tag>
                      </div>
                      {campus.location && (
                        <p className="text-xs text-ds-text-subtle">
                          {campus.location}
                        </p>
                      )}
                      <div className="flex gap-4 text-sm">
                        <Tooltip title="Departments">
                          <span className="text-ds-text-secondary">
                            <AppstoreOutlined className="mr-1" />
                            {campusDepts.length}
                          </span>
                        </Tooltip>
                        <Tooltip title="Groups">
                          <span className="text-ds-text-secondary">
                            <TeamOutlined className="mr-1" />
                            {campusGroups.length}
                          </span>
                        </Tooltip>
                        <Tooltip title="Cells">
                          <span className="text-ds-text-secondary">
                            <ClusterOutlined className="mr-1" />
                            {campusCells.length}
                          </span>
                        </Tooltip>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "campuses",
      label: (
        <span className="flex items-center gap-2">
          <BankOutlined /> Campuses
          <Tag className="ml-1">{data.campuses.length}</Tag>
        </span>
      ),
      children: (
        <div className="space-y-4">
          <FilterToolbar
            filters={searchFilter}
            values={{ search: searchTerm }}
            onChange={(_, value) => setSearchTerm(value as string)}
            onReset={() => setSearchTerm("")}
          />
          {filterBySearch(data.campuses).length === 0 ? (
            <EmptyState
              icon={<SearchOutlined className="text-ds-text-subtle" />}
              title="No campuses found"
              description="No campuses match your search criteria"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filterBySearch(data.campuses).map((campus) => (
                <Card
                  key={campus.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-bold text-ds-text-primary">
                        {campus.name}
                      </h4>
                      <Tag color={campus.isActive ? "success" : "default"}>
                        {campus.isActive ? "Active" : "Inactive"}
                      </Tag>
                    </div>
                    {campus.location && (
                      <p className="text-sm text-ds-text-subtle">
                        {campus.location}
                      </p>
                    )}
                    <div className="flex gap-4 text-sm text-ds-text-secondary pt-2">
                      <span>
                        <TeamOutlined className="mr-1" />
                        {
                          data.groups.filter((g) => g.campusId === campus.id)
                            .length
                        }{" "}
                        groups
                      </span>
                      <span>
                        <UserOutlined className="mr-1" />
                        {
                          data.cells.filter((c) => c.campusId === campus.id)
                            .length
                        }{" "}
                        cells
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "departments",
      label: (
        <span className="flex items-center gap-2">
          <AppstoreOutlined /> Departments
          <Tag className="ml-1">{data.departments.length}</Tag>
        </span>
      ),
      children: (
        <div className="space-y-4">
          <FilterToolbar
            filters={searchFilter}
            values={{ search: searchTerm }}
            onChange={(_, value) => setSearchTerm(value as string)}
            onReset={() => setSearchTerm("")}
          />
          {filterBySearch(data.departments).length === 0 ? (
            <EmptyState
              icon={<SearchOutlined className="text-ds-text-subtle" />}
              title="No departments found"
              description="No departments match your search criteria"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filterBySearch(data.departments).map((dept) => {
                const campus = data.campuses.find(
                  (c) => c.id === dept.campusId
                );
                return (
                  <Card
                    key={dept.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-base font-bold text-ds-text-primary">
                          {dept.name}
                        </h4>
                        <Tag color={dept.isActive ? "success" : "default"}>
                          {dept.isActive ? "Active" : "Inactive"}
                        </Tag>
                      </div>
                      {campus && (
                        <p className="text-sm text-ds-text-subtle">
                          <BankOutlined className="mr-1" />
                          {campus.name}
                        </p>
                      )}
                      {dept.description && (
                        <p className="text-sm text-ds-text-secondary line-clamp-2">
                          {dept.description}
                        </p>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "groups",
      label: (
        <span className="flex items-center gap-2">
          <TeamOutlined /> Groups
          <Tag className="ml-1">{data.groups.length}</Tag>
        </span>
      ),
      children: (
        <div className="space-y-4">
          <FilterToolbar
            filters={searchFilter}
            values={{ search: searchTerm }}
            onChange={(_, value) => setSearchTerm(value as string)}
            onReset={() => setSearchTerm("")}
          />
          <div className="flex justify-between items-center">
            <p className="text-sm text-ds-text-secondary">
              Showing {filterBySearch(data.groups).length} of{" "}
              {data.groups.length} groups
            </p>
            <Button
              icon={<PlusOutlined />}
              onClick={() => router.push("/superadmin/groups/new")}
            >
              Create Group
            </Button>
          </div>
          {filterBySearch(data.groups).length === 0 ? (
            <EmptyState
              icon={<SearchOutlined className="text-ds-text-subtle" />}
              title="No groups found"
              description={
                searchTerm
                  ? "Try adjusting your search"
                  : "No groups have been created yet"
              }
              action={
                <Button
                  icon={<PlusOutlined />}
                  onClick={() => router.push("/superadmin/groups/new")}
                >
                  Create First Group
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filterBySearch(data.groups).map((group) => (
                <GroupCard
                  key={group.id}
                  group={{
                    ...group,
                    leaderName: group.leader
                      ? `${group.leader.firstName} ${group.leader.lastName}`
                      : undefined,
                  }}
                  routePrefix="/superadmin/groups"
                  showActions={user?.role === "SUPERADMIN"}
                  onEdit={(id) => router.push(`/superadmin/groups/${id}/edit`)}
                  onDelete={() =>
                    message.info("Delete functionality coming soon")
                  }
                />
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "cells",
      label: (
        <span className="flex items-center gap-2">
          <ClusterOutlined /> Cells
          <Tag className="ml-1">{data.cells.length}</Tag>
        </span>
      ),
      children: (
        <div className="space-y-4">
          <FilterToolbar
            filters={searchFilter}
            values={{ search: searchTerm }}
            onChange={(_, value) => setSearchTerm(value as string)}
            onReset={() => setSearchTerm("")}
          />
          {filterBySearch(data.cells).length === 0 ? (
            <EmptyState
              icon={<SearchOutlined className="text-ds-text-subtle" />}
              title="No cells found"
              description="No cells match your search criteria"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filterBySearch(data.cells).map((cell) => {
                const parentGroup = data.groups.find(
                  (g) => g.id === cell.groupId
                );
                return (
                  <Card
                    key={cell.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-base font-bold text-ds-text-primary">
                          {cell.name}
                        </h4>
                        <Tag color={cell.isActive ? "success" : "default"}>
                          {cell.isActive ? "Active" : "Inactive"}
                        </Tag>
                      </div>
                      {parentGroup && (
                        <p className="text-sm text-ds-text-subtle">
                          <TeamOutlined className="mr-1" />
                          {parentGroup.name}
                        </p>
                      )}
                      {cell.meetingFrequency && (
                        <p className="text-sm text-ds-text-secondary">
                          Meets {cell.meetingFrequency.toLowerCase()}
                        </p>
                      )}
                      <div className="flex gap-4 text-sm text-ds-text-secondary pt-1">
                        <span>
                          <UserOutlined className="mr-1" />
                          {cell.memberCount || 0} members
                        </span>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout role={user?.role || UserRole.SUPERADMIN}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-ds-text-primary">
              Organization Structure
            </h2>
            <p className="text-ds-text-secondary mt-1">
              Manage campuses, departments, groups, and cells across the church
            </p>
          </div>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={(key) => {
            setActiveTab(key);
            setSearchTerm("");
          }}
          items={tabItems}
          size="large"
        />
      </div>
    </DashboardLayout>
  );
}
