"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { Card, Select, Button, message, Spin, Alert, Avatar, Tag } from "antd";
import { UserSwitchOutlined, UserOutlined } from "@ant-design/icons";

export default function AssignLeaderPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [group, setGroup] = useState<GroupWithDetails | null>(null);
  const [potentialLeaders, setPotentialLeaders] = useState<User[]>([]);
  const [selectedLeaderId, setSelectedLeaderId] = useState<string>("");

  useEffect(() => {
    fetchData();
  }, [params.id]);

  const fetchData = async () => {
    try {
      // Fetch group details
      const groupRes = await fetch(`/api/groups/${params.id}`);
      if (!groupRes.ok) throw new Error("Failed to fetch group");
      const groupData = await groupRes.json();
      setGroup(groupData);

      // Fetch all users with LEADER or SUPERADMIN role, or members in this group
      const usersRes = await fetch("/api/users");
      if (!usersRes.ok) throw new Error("Failed to fetch users");
      const usersData = await usersRes.json();

      // Filter: active users who are leaders/superadmins or members of this group
      const potential = usersData.filter(
        (u: User) =>
          u.isActive &&
          (u.role === "LEADER" ||
            u.role === "SUPERADMIN" ||
            u.groupId === params.id)
      );
      setPotentialLeaders(potential);

      // Set current leader as selected
      if (groupData.leaderId) {
        setSelectedLeaderId(groupData.leaderId);
      }
    } catch (error) {
      message.error("Failed to load data");
      console.error(error);
      router.push(`/groups/${params.id}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignLeader = async () => {
    if (!selectedLeaderId) {
      message.error("Please select a leader");
      return;
    }

    if (!group) return;

    // Only superadmin can assign leaders
    if (user?.role !== "SUPERADMIN") {
      message.error("You don't have permission to assign group leaders");
      return;
    }

    setSubmitting(true);

    try {
      // Update group with new leader
      const res = await fetch(`/api/groups/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: group.name,
          description: group.description,
          meetingFrequency: group.meetingFrequency,
          leaderId: selectedLeaderId,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to assign leader");
      }

      await res.json(); // Consume response

      // Update the selected user's role to LEADER if they're a MEMBER
      const selectedUser = potentialLeaders.find(
        (u) => u.id === selectedLeaderId
      );
      if (selectedUser && selectedUser.role === "MEMBER") {
        const userRes = await fetch(`/api/users/${selectedLeaderId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...selectedUser,
            role: "LEADER",
          }),
        });

        if (!userRes.ok) {
          console.error("Failed to update user role");
        }
      }

      message.success("Leader assigned successfully");
      router.push(`/groups/${params.id}`);
    } catch (error: any) {
      message.error(error.message || "Failed to assign leader");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!group) {
    return null;
  }

  if (user?.role !== "SUPERADMIN") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <p className="text-gray-500">
            You don't have permission to assign group leaders
          </p>
          <Button
            type="primary"
            onClick={() => router.push(`/groups/${params.id}`)}
          >
            Back to Group
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Assign Group Leader
        </h1>
        <p className="text-gray-500 mt-1">
          Assign or change the leader for {group.name}
        </p>
      </div>

      <Card>
        <Alert
          title="Leader Assignment"
          description="Select a user to be the leader of this group. Leaders can manage meetings, log interactions, and approve membership requests for their group. If you select a member, they will automatically be promoted to the Leader role."
          type="info"
          showIcon
          className="mb-6"
        />

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Leader
            </label>
            {group.leader ? (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Avatar
                  size={40}
                  icon={<UserOutlined />}
                  src={group.leader.avatar}
                >
                  {group.leader.firstName[0]}
                  {group.leader.lastName[0]}
                </Avatar>
                <div>
                  <div className="font-medium">
                    {group.leader.firstName} {group.leader.lastName}
                  </div>
                  <div className="text-sm text-gray-500">
                    {group.leader.email}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 italic">No leader assigned</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select New Leader
            </label>
            <Select
              size="large"
              placeholder="Choose a leader for this group"
              className="w-full"
              value={selectedLeaderId || undefined}
              onChange={(value) => setSelectedLeaderId(value)}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toString()
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={potentialLeaders.map((leader) => ({
                value: leader.id,
                label: `${leader.firstName} ${leader.lastName} (${leader.role})`,
                leader: leader,
              }))}
              optionRender={(option) => {
                const leader = option.data.leader as User;
                return (
                  <div className="flex items-center gap-3 py-1">
                    <Avatar
                      size={32}
                      icon={<UserOutlined />}
                      src={leader.avatar}
                    >
                      {leader.firstName[0]}
                      {leader.lastName[0]}
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-medium">
                        {leader.firstName} {leader.lastName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {leader.email}
                      </div>
                    </div>
                    <Tag
                      color={
                        leader.role === "SUPERADMIN"
                          ? "red"
                          : leader.role === "LEADER"
                            ? "blue"
                            : "green"
                      }
                    >
                      {leader.role}
                    </Tag>
                  </div>
                );
              }}
            />
            <p className="text-sm text-gray-500 mt-2">
              Showing {potentialLeaders.length} potential leader(s)
            </p>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button onClick={() => router.push(`/groups/${params.id}`)}>
              Cancel
            </Button>
            <Button
              type="primary"
              icon={<UserSwitchOutlined />}
              onClick={handleAssignLeader}
              loading={submitting}
              disabled={!selectedLeaderId}
            >
              Assign Leader
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
