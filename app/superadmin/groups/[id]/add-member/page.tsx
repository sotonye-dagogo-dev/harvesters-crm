"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { Card, Select, Button, message, Spin, Empty, Avatar } from "antd";
import { UserAddOutlined, UserOutlined } from "@ant-design/icons";

export default function AddMemberPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [group, setGroup] = useState<GroupWithDetails | null>(null);
  const [availableMembers, setAvailableMembers] = useState<User[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string>("");

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

      // Fetch all users to find members without a group
      const usersRes = await fetch("/api/users");
      if (!usersRes.ok) throw new Error("Failed to fetch users");
      const usersData = await usersRes.json();

      // Filter users who don't have a group or have MEMBER role
      const available = usersData.filter(
        (u: User) =>
          !u.groupId && u.role === "MEMBER" && u.isActive && u.id !== user?.id
      );
      setAvailableMembers(available);
    } catch (error) {
      message.error("Failed to load data");
      console.error(error);
      router.push(`/groups/${params.id}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!selectedMemberId) {
      message.error("Please select a member to add");
      return;
    }

    if (!group) return;

    // Check if user can add members to this group
    const canAdd =
      user?.role === "SUPERADMIN" ||
      (user?.role === "LEADER" && group.leaderId === user.id);

    if (!canAdd) {
      message.error("You don't have permission to add members to this group");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`/api/groups/${params.id}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId: selectedMemberId }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to add member");
      }

      message.success("Member added successfully");
      router.push(`/groups/${params.id}`);
    } catch (error: any) {
      message.error(error.message || "Failed to add member");
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

  const canAdd =
    user?.role === "SUPERADMIN" ||
    (user?.role === "LEADER" && group.leaderId === user.id);

  if (!canAdd) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <p className="text-gray-500">
            You don't have permission to add members to this group
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
        <h1 className="text-2xl font-bold text-gray-900">Add Member</h1>
        <p className="text-gray-500 mt-1">Add a member to {group.name}</p>
      </div>

      <Card>
        {availableMembers.length === 0 ? (
          <Empty
            description="No available members without a group"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button
              type="primary"
              onClick={() => router.push(`/groups/${params.id}`)}
            >
              Back to Group
            </Button>
          </Empty>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Member
              </label>
              <Select
                size="large"
                placeholder="Choose a member to add"
                className="w-full"
                value={selectedMemberId || undefined}
                onChange={(value) => setSelectedMemberId(value)}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toString()
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={availableMembers.map((member) => ({
                  value: member.id,
                  label: `${member.firstName} ${member.lastName} (${member.email})`,
                  member: member,
                }))}
                optionRender={(option) => {
                  const member = option.data.member as User;
                  return (
                    <div className="flex items-center gap-3 py-1">
                      <Avatar
                        size={32}
                        icon={<UserOutlined />}
                        src={member.avatar}
                      >
                        {member.firstName[0]}
                        {member.lastName[0]}
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {member.firstName} {member.lastName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {member.email}
                        </div>
                      </div>
                    </div>
                  );
                }}
              />
              <p className="text-sm text-gray-500 mt-2">
                Showing {availableMembers.length} member(s) without a group
              </p>
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button onClick={() => router.push(`/groups/${params.id}`)}>
                Cancel
              </Button>
              <Button
                type="primary"
                icon={<UserAddOutlined />}
                onClick={handleAddMember}
                loading={submitting}
                disabled={!selectedMemberId}
              >
                Add Member
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
