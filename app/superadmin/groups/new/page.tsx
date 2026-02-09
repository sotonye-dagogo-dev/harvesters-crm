"use client";

import { useState } from "react";
import DashboardLayout from "@/components/features/navigation/DashboardLayout";
import { useAuth } from "@/providers/AuthProvider";
import {
  Form,
  Input as AntInput,
  Select,
  Button as AntButton,
  Card,
  message,
} from "antd";
import { SaveOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { UserRole } from "@/lib/types";

const { TextArea } = AntInput;

export default function CreateGroupPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (values: {
    name: string;
    description: string;
    meetingFrequency: string;
    leaderId: string;
  }) => {
    setSaving(true);
    try {
      const response = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        const data = await response.json();
        message.success("Group created successfully");
        router.push(`/superadmin/groups/${data.data.id}`);
      } else {
        const error = await response.json();
        message.error(error.error || "Failed to create group");
      }
    } catch (error) {
      message.error("An error occurred while creating group");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout role={user?.role || UserRole.SUPERADMIN}>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Create New Group</h2>
          <p className="text-gray-600 mt-1">
            Set up a new fellowship group for your church
          </p>
        </div>

        <Card className="max-w-2xl">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            disabled={saving}
          >
            <Form.Item
              label="Group Name"
              name="name"
              rules={[
                { required: true, message: "Please enter a group name" },
                { min: 3, message: "Name must be at least 3 characters" },
              ]}
            >
              <AntInput placeholder="e.g., Young Adults Fellowship" />
            </Form.Item>

            <Form.Item
              label="Description"
              name="description"
              rules={[
                { required: true, message: "Please enter a description" },
              ]}
            >
              <TextArea
                rows={4}
                placeholder="Describe the purpose and focus of this group..."
                maxLength={500}
                showCount
              />
            </Form.Item>

            <Form.Item
              label="Meeting Frequency"
              name="meetingFrequency"
              rules={[
                { required: true, message: "Please select meeting frequency" },
              ]}
            >
              <Select placeholder="Select frequency">
                <Select.Option value="WEEKLY">Weekly</Select.Option>
                <Select.Option value="BIWEEKLY">Biweekly</Select.Option>
                <Select.Option value="MONTHLY">Monthly</Select.Option>
              </Select>
            </Form.Item>

            <div className="flex gap-3 justify-end">
              <AntButton onClick={() => router.push("/superadmin/groups")}>
                Cancel
              </AntButton>
              <AntButton
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={saving}
              >
                Create Group
              </AntButton>
            </div>
          </Form>
        </Card>
      </div>
    </DashboardLayout>
  );
}
