"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import {
  Button as AntButton,
  message,
  Select,
  Input,
  Card,
  Tag,
  Space,
  Popconfirm,
} from "antd";
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

const { Search } = Input;

const getInteractionIcon = (type: string) => {
  switch (type) {
    case "CALL":
      return <PhoneOutlined className="text-blue-600" />;
    case "FOLLOW_UP":
      return <MessageOutlined className="text-green-600" />;
    case "CHECK_IN":
      return <CheckCircleOutlined className="text-purple-600" />;
    default:
      return <MessageOutlined />;
  }
};

const getInteractionColor = (type: string) => {
  switch (type) {
    case "CALL":
      return "blue";
    case "FOLLOW_UP":
      return "green";
    case "CHECK_IN":
      return "purple";
    default:
      return "default";
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

  if (user?.role !== "LEADER" && user?.role !== "SUPERADMIN") {
    return (
      <div className="p-6">
        <EmptyState
          icon={<SearchOutlined />}
          title="Access Denied"
          description="Only group leaders can view and manage interactions"
          action={
            <AntButton type="primary" onClick={() => router.push("/dashboard")}>
              Back to Dashboard
            </AntButton>
          }
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Interactions</h2>
          <p className="text-gray-600 mt-1">Loading interactions...</p>
        </div>
        <div className="grid grid-cols-1 gap-6">
          <CardSkeleton count={3} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Interactions</h2>
          <p className="text-gray-600 mt-1">
            Showing {filteredInteractions.length} of {interactions.length}{" "}
            interaction(s)
          </p>
        </div>
        {user.groupId && (
          <AntButton
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => router.push(\"/leader/interactions/new\")}
          >
            Log Interaction
          </AntButton>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
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
                  onClick={() => router.push(\"/leader/interactions/new\")}
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
              (user?.role === "LEADER" && interaction.leaderId === user.id);

            return (
              <Card
                key={interaction.id}
                className="hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getInteractionIcon(interaction.type)}
                      <Tag color={getInteractionColor(interaction.type)}>
                        {interaction.type.replace("_", " ")}
                      </Tag>
                      <span className="text-gray-500 text-sm">
                        with{" "}
                        <span className="font-medium">
                          {interaction.member.firstName}{" "}
                          {interaction.member.lastName}
                        </span>
                      </span>
                    </div>
                    <p className="text-gray-700 mb-2">{interaction.notes}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>
                        By: {interaction.leader.firstName}{" "}
                        {interaction.leader.lastName}
                      </span>
                      <span>
                        {format(
                          new Date(interaction.timestamp),
                          "MMM dd, yyyy 'at' h:mm a"
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
                          router.push(`/interactions/${interaction.id}/edit`)
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
  );
}
