"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import DashboardLayout from "@/components/features/navigation/DashboardLayout";
import {
  Button as AntButton,
  message,
  Select,
  Input,
  Card,
  Space,
  Popconfirm,
} from "antd";
import StatusBadge from "@/components/ui/StatusBadge";
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

const { Search } = Input;

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
            <AntButton
              type="primary"
              onClick={() => router.push("/leader/dashboard")}
            >
              Back to Dashboard
            </AntButton>
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
            <AntButton
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => router.push("/leader/interactions/new")}
            >
              Log Interaction
            </AntButton>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <Search
            placeholder="Search by member name or notes..."
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            style={{ maxWidth: 400 }}
            onChange={(e) => setSearchQuery(e.target.value)}
            value={searchQuery}
          />
          <Select
            value={typeFilter}
            onChange={setTypeFilter}
            size="large"
            style={{ width: 200 }}
          >
            <Select.Option value="ALL">All Types</Select.Option>
            <Select.Option value="CALL">Phone Call</Select.Option>
            <Select.Option value="FOLLOW_UP">Follow-up</Select.Option>
            <Select.Option value="CHECK_IN">Check-in</Select.Option>
          </Select>
        </div>

        {/* Interactions List */}
        {filteredInteractions.length === 0 ? (
          interactions.length === 0 ? (
            <EmptyState
              icon={<SearchOutlined />}
              title="No Interactions Yet"
              description="Start logging calls, follow-ups, and check-ins with your group members"
              action={
                user.groupId ? (
                  <AntButton
                    type="primary"
                    onClick={() => router.push("/leader/interactions/new")}
                  >
                    Log Interaction
                  </AntButton>
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
                        <StatusBadge status={interaction.type} category="interaction" />
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
                        <AntButton
                          type="text"
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
                          <AntButton
                            type="text"
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
