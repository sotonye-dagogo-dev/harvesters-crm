"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import DashboardLayout from "@/components/features/navigation/DashboardLayout";
import { message, Card, Space, Popconfirm } from "antd";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";
import FilterToolbar, {
  type FilterConfig,
} from "@/components/ui/FilterToolbar";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  PhoneOutlined,
  MessageOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { format } from "date-fns";
import EmptyState from "@/components/ui/EmptyState";
import { CardSkeleton } from "@/components/ui/LoadingSkeleton";
import { UserRole } from "@/lib/types";

const interactionFilters: FilterConfig[] = [
  {
    key: "search",
    type: "search",
    label: "Interactions",
    placeholder: "Search by member name or notes...",
    width: 400,
  },
  {
    key: "type",
    type: "select",
    label: "Type",
    placeholder: "All Types",
    allowClear: false,
    options: [
      { label: "All Types", value: "ALL" },
      { label: "Phone Call", value: "CALL" },
      { label: "Follow-up", value: "FOLLOW_UP" },
      { label: "Check-in", value: "CHECK_IN" },
    ],
    width: 200,
  },
];

const getInteractionIcon = (type: string) => {
  switch (type) {
    case "CALL":
      return <PhoneOutlined className="text-ds-chart-1" />;
    case "FOLLOW_UP":
      return <MessageOutlined className="text-ds-status-success" />;
    case "CHECK_IN":
      return <CheckCircleOutlined className="text-ds-chart-3" />;
    default:
      return <MessageOutlined />;
  }
};

export default function InteractionsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [interactions, setInteractions] = useState<InteractionWithDetails[]>(
    []
  );
  const [filteredInteractions, setFilteredInteractions] = useState<
    InteractionWithDetails[]
  >([]);
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchInteractions();
  }, []);

  useEffect(() => {
    filterInteractions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interactions, typeFilter, searchQuery]);

  const fetchInteractions = async () => {
    try {
      const response = await fetch("/api/interactions");
      if (response.ok) {
        const data = await response.json();
        setInteractions(data);
      } else {
        message.error("Failed to load interactions");
      }
    } catch (error) {
      message.error("An error occurred");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filterInteractions = () => {
    let filtered = [...interactions];

    // Filter by type
    if (typeFilter !== "ALL") {
      filtered = filtered.filter((i) => i.type === typeFilter);
    }

    // Filter by search query (member name or notes)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (i) =>
          `${i.member.firstName} ${i.member.lastName}`
            .toLowerCase()
            .includes(query) ||
          (i.notes && i.notes.toLowerCase().includes(query))
      );
    }

    // Sort by timestamp (most recent first)
    filtered.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    setFilteredInteractions(filtered);
  };

  const handleDelete = async (interactionId: string) => {
    try {
      const response = await fetch(`/api/interactions/${interactionId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        message.success("Interaction deleted successfully");
        fetchInteractions();
      } else {
        message.error("Failed to delete interaction");
      }
    } catch (error) {
      message.error("An error occurred");
      console.error(error);
    }
  };

  if (
    user?.role !== UserRole.SMALL_GROUP_LEADER &&
    user?.role !== "SUPERADMIN"
  ) {
    return (
      <DashboardLayout role={user?.role || UserRole.SMALL_GROUP_LEADER}>
        <EmptyState
          icon={<SearchOutlined />}
          title="Access Denied"
          description="Only group leaders can view and manage interactions"
          action={
            <Button onClick={() => router.push("/leader/dashboard")}>
              Back to Dashboard
            </Button>
          }
        />
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout role={UserRole.SMALL_GROUP_LEADER}>
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-ds-text-primary">
              Interactions
            </h2>
            <p className="text-ds-text-secondary mt-1">
              Loading interactions...
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6">
            <CardSkeleton count={3} />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role={UserRole.SMALL_GROUP_LEADER}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-ds-text-primary">
              Interactions
            </h2>
            <p className="text-ds-text-secondary mt-1">
              Showing {filteredInteractions.length} of {interactions.length}{" "}
              interaction(s)
            </p>
          </div>
          {user.groupId && (
            <Button
              icon={<PlusOutlined />}
              onClick={() => router.push("/leader/interactions/new")}
            >
              Log Interaction
            </Button>
          )}
        </div>

        {/* Filters */}
        <FilterToolbar
          filters={interactionFilters}
          values={{ search: searchQuery, type: typeFilter }}
          onChange={(key, value) => {
            if (key === "search") setSearchQuery(value as string);
            if (key === "type") setTypeFilter(value as string);
          }}
          onReset={() => {
            setSearchQuery("");
            setTypeFilter("ALL");
          }}
        />

        {/* Interactions List */}
        {filteredInteractions.length === 0 ? (
          interactions.length === 0 ? (
            <EmptyState
              icon={<SearchOutlined />}
              title="No Interactions Yet"
              description="Start logging calls, follow-ups, and check-ins with your group members"
              action={
                user.groupId ? (
                  <Button
                    onClick={() => router.push("/leader/interactions/new")}
                  >
                    Log Interaction
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <EmptyState
              icon={<SearchOutlined />}
              title="No Matching Interactions"
              description="Try adjusting your search or filter criteria"
            />
          )
        ) : (
          <div className="space-y-4">
            {filteredInteractions.map((interaction) => {
              const canEdit =
                user?.role === "SUPERADMIN" ||
                (user?.role === UserRole.SMALL_GROUP_LEADER &&
                  interaction.leaderId === user.id);

              return (
                <Card
                  key={interaction.id}
                  className="hover:shadow-md transition-shadow dark:bg-ds-surface-elevated dark:border-ds-border-base"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getInteractionIcon(interaction.type)}
                        <StatusBadge
                          status={interaction.type}
                          category="interaction"
                        />
                        <span className="text-ds-text-subtle text-sm">
                          with{" "}
                          <span className="font-medium dark:text-ds-text-primary">
                            {interaction.member.firstName}{" "}
                            {interaction.member.lastName}
                          </span>
                        </span>
                      </div>
                      <p className="text-ds-text-secondary mb-2">
                        {interaction.notes}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-ds-text-subtle">
                        <span>
                          By: {interaction.leader.firstName}{" "}
                          {interaction.leader.lastName}
                        </span>
                        <span>
                          {format(
                            new Date(interaction.timestamp),
                            "d MMM yyyy 'at' h:mm a"
                          )}
                        </span>
                      </div>
                    </div>
                    {canEdit && (
                      <Space>
                        <Button
                          variant="text"
                          icon={<EditOutlined />}
                          onClick={() =>
                            router.push(
                              `/leader/interactions/${interaction.id}/edit`
                            )
                          }
                        />
                        <Popconfirm
                          title="Delete interaction?"
                          description="This action cannot be undone"
                          onConfirm={() => handleDelete(interaction.id)}
                          okText="Yes"
                          cancelText="No"
                        >
                          <Button
                            variant="text"
                            danger
                            icon={<DeleteOutlined />}
                          />
                        </Popconfirm>
                      </Space>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
