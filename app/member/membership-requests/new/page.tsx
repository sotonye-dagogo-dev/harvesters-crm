"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import {
  Card,
  Form,
  Select,
  Input,
  Button as AntButton,
  message,
  Alert,
  Empty,
  Radio,
  Descriptions,
  Tag,
} from "antd";
import {
  ArrowLeftOutlined,
  SendOutlined,
  TeamOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";

const { TextArea } = Input;

export default function NewMembershipRequestPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<GroupWithDetails[]>([]);
  const [currentGroup, setCurrentGroup] = useState<GroupWithDetails | null>(
    null
  );
  const [selectedGroup, setSelectedGroup] = useState<GroupWithDetails | null>(
    null
  );
  const [requestType, setRequestType] = useState<"JOIN" | "TRANSFER">("JOIN");

  useEffect(() => {
    fetchGroups();
    if (user?.groupId) {
      fetchCurrentGroup();
    }
  }, [user]);

  const fetchGroups = async () => {
    try {
      const response = await fetch("/api/groups");
      if (response.ok) {
        const data = await response.json();
        setGroups(data);
      }
    } catch (error) {
      console.error("Failed to load groups");
    }
  };

  const fetchCurrentGroup = async () => {
    if (!user?.groupId) return;
    try {
      const response = await fetch(`/api/groups/${user.groupId}`);
      if (response.ok) {
        const data = await response.json();
        setCurrentGroup(data);
      }
    } catch (error) {
      console.error("Failed to load current group");
    }
  };

  const handleGroupSelect = async (groupId: string) => {
    const group = groups.find((g) => g.id === groupId);
    setSelectedGroup(group || null);
  };

  const handleSubmit = async (values: {
    toGroupId: string;
    requestType: "JOIN" | "TRANSFER";
    message?: string;
  }) => {
    if (!user) return;

    setLoading(true);
    try {
      const payload = {
        memberId: user.id,
        fromGroupId: requestType === "TRANSFER" ? user.groupId : null,
        toGroupId: values.toGroupId,
        type: values.requestType,
        message: values.message || "",
      };

      const response = await fetch("/api/membership-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        message.success("Membership request submitted successfully");
        router.push("/member/membership-requests");
      } else {
        const error = await response.json();
        message.error(error.error || "Failed to submit request");
      }
    } catch (error) {
      message.error("An error occurred");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Check if user is a member
  if (!user || user.role !== "MEMBER") {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <Card>
          <Empty description="Only members can submit membership requests" />
          <div className="text-center mt-4">
            <AntButton onClick={() => router.push("/member/dashboard")}>
              Go to Dashboard
            </AntButton>
          </div>
        </Card>
      </div>
    );
  }

  // Determine if user has a group
  const hasGroup = !!user.groupId;
  const defaultRequestType = hasGroup ? "TRANSFER" : "JOIN";

  // Filter available groups
  const availableGroups = groups.filter((g) => g.id !== user.groupId);

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      <AntButton
        icon={<ArrowLeftOutlined />}
        onClick={() => router.push("/member/membership-requests")}
        className="mb-4"
      >
        Back
      </AntButton>

      <Card>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Request Group Membership
          </h1>
          <p className="text-gray-600">
            {hasGroup
              ? "Request to transfer to a different group or stay in your current group"
              : "Submit a request to join a fellowship group"}
          </p>
        </div>

        {hasGroup && currentGroup && (
          <Alert
            title="Current Group"
            description={
              <div>
                <p className="font-medium">{currentGroup.name}</p>
                <p className="text-sm text-gray-600">
                  {currentGroup.description}
                </p>
              </div>
            }
            type="info"
            icon={<TeamOutlined />}
            className="mb-6"
          />
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            requestType: defaultRequestType,
          }}
        >
          {hasGroup && (
            <Form.Item
              label="Request Type"
              name="requestType"
              rules={[
                { required: true, message: "Please select request type" },
              ]}
            >
              <Radio.Group
                onChange={(e) => setRequestType(e.target.value)}
                value={requestType}
              >
                <Radio value="TRANSFER">Transfer to Another Group</Radio>
                <Radio value="JOIN" disabled={!hasGroup}>
                  Join Additional Group
                </Radio>
              </Radio.Group>
            </Form.Item>
          )}

          <Form.Item
            label="Select Group"
            name="toGroupId"
            rules={[{ required: true, message: "Please select a group" }]}
          >
            <Select
              placeholder="Choose a fellowship group"
              size="large"
              onChange={handleGroupSelect}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={availableGroups.map((group) => ({
                value: group.id,
                label: group.name,
              }))}
            />
          </Form.Item>

          {selectedGroup && (
            <Card className="mb-4 bg-gray-50" size="small">
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Group Name">
                  {selectedGroup.name}
                </Descriptions.Item>
                <Descriptions.Item label="Description">
                  {selectedGroup.description}
                </Descriptions.Item>
                <Descriptions.Item label="Meeting Frequency">
                  <Tag color="blue">{selectedGroup.meetingFrequency}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Leader">
                  {selectedGroup.leader ? (
                    <span>
                      {selectedGroup.leader.firstName}{" "}
                      {selectedGroup.leader.lastName}
                    </span>
                  ) : (
                    <span className="text-gray-400">No leader assigned</span>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Members">
                  <Tag>{selectedGroup.memberCount || 0} members</Tag>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          )}

          <Form.Item
            label="Message to Leader (Optional)"
            name="message"
            extra="Include any relevant information for the group leader"
          >
            <TextArea
              rows={4}
              placeholder="Why would you like to join this group?"
              maxLength={500}
              showCount
            />
          </Form.Item>

          <Alert
            title="Please Note"
            description={
              requestType === "TRANSFER"
                ? "If your transfer request is approved, you will be moved from your current group to the selected group."
                : "Your request will be reviewed by the group leader. You'll be notified once a decision is made."
            }
            type="info"
            icon={<InfoCircleOutlined />}
            className="mb-6"
          />

          <Form.Item>
            <div className="flex gap-4">
              <AntButton
                type="primary"
                htmlType="submit"
                icon={<SendOutlined />}
                loading={loading}
                size="large"
              >
                Submit Request
              </AntButton>
              <AntButton
                size="large"
                onClick={() => router.push("/member/membership-requests")}
              >
                Cancel
              </AntButton>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
