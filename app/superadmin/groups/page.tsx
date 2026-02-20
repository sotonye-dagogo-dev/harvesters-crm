"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/features/navigation/DashboardLayout";
import { useAuth } from "@/providers/AuthProvider";
import { message } from "antd";
import Button from "@/components/ui/Button";
import FilterToolbar, { type FilterConfig } from "@/components/ui/FilterToolbar";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import GroupCard from "@/components/features/groups/GroupCard";
import EmptyState from "@/components/ui/EmptyState";
import { CardSkeleton } from "@/components/ui/LoadingSkeleton";
import { useRouter } from "next/navigation";
import { UserRole } from "@/lib/types";

const groupFilters: FilterConfig[] = [
  {
    key: "search",
    type: "search",
    label: "Groups",
    placeholder: "Search groups by name, description, or leader",
    width: "100%",
  },
];

export default function GroupsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<GroupWithDetails[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<GroupWithDetails[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    filterGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, groups]);

  const fetchGroups = async () => {
    try {
      const response = await fetch("/api/groups");
      if (response.ok) {
        const data = await response.json();
        setGroups(data.data);
      }
    } catch {
      message.error("Failed to load groups");
    } finally {
      setLoading(false);
    }
  };

  const filterGroups = () => {
    if (!searchTerm) {
      setFilteredGroups(groups);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = groups.filter(
      (group) =>
        group.name.toLowerCase().includes(term) ||
        group.description?.toLowerCase().includes(term) ||
        group.leader?.firstName.toLowerCase().includes(term) ||
        group.leader?.lastName.toLowerCase().includes(term)
    );
    setFilteredGroups(filtered);
  };

  const handleDelete = (groupId: string) => {
    // Delete functionality to be implemented
    message.info("Delete functionality coming soon");
    console.log("Delete group:", groupId);
  };

  if (loading) {
    return (
      <DashboardLayout role={user?.role || UserRole.SUPERADMIN}>
        <CardSkeleton count={6} />
      </DashboardLayout>
    );
  }

  const canCreateGroup = user?.role === "SUPERADMIN" || user?.role === UserRole.SMALL_GROUP_LEADER;

  return (
    <DashboardLayout role={user?.role || UserRole.SUPERADMIN}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-ds-text-primary">
              Fellowship Groups
            </h2>
            <p className="text-ds-text-secondary mt-1">
              Manage church fellowship groups and their activities
            </p>
          </div>
          {canCreateGroup && (
            <Button
              icon={<PlusOutlined />}
              onClick={() => router.push("/superadmin/groups/new")}
            >
              Create Group
            </Button>
          )}
        </div>

        <FilterToolbar
          filters={groupFilters}
          values={{ search: searchTerm }}
          onChange={(key, value) => {
            if (key === "search") setSearchTerm(value as string);
          }}
          onReset={() => setSearchTerm("")}
        />

        <div className="text-sm text-ds-text-secondary">
          Showing {filteredGroups.length} of {groups.length} groups
        </div>

        {filteredGroups.length === 0 ? (
          <EmptyState
            icon={<SearchOutlined className="text-ds-text-subtle" />}
            title="No groups found"
            description={
              searchTerm
                ? "Try adjusting your search"
                : "No groups have been created yet"
            }
            action={
              canCreateGroup ? (
                <Button
                  icon={<PlusOutlined />}
                  onClick={() => router.push("/superadmin/groups/new")}
                >
                  Create First Group
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map((group) => (
              <GroupCard
                key={group.id}
                group={{
                  ...group,
                  leaderName: group.leader
                    ? `${group.leader.firstName} ${group.leader.lastName}`
                    : undefined,
                }}
                showActions={user?.role === "SUPERADMIN"}
                onEdit={(id) => router.push(`/superadmin/groups/${id}/edit`)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
