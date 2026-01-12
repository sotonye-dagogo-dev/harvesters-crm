"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { Form, Input, Select, Button, Card, message, Spin } from "antd";
import { SaveOutlined } from "@ant-design/icons";

const { TextArea } = Input;

export default function EditGroupPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [group, setGroup] = useState<GroupWithDetails | null>(null);

  useEffect(() => {
    fetchGroupDetails();
  }, [params.id]);

  const fetchGroupDetails = async () => {
    try {
      const res = await fetch(`/api/groups/${params.id}`);
      if (!res.ok) throw new Error("Failed to fetch group");
      const data = await res.json();
      setGroup(data);

      // Pre-fill form with existing data
      form.setFieldsValue({
        name: data.name,
        description: data.description,
        meetingFrequency: data.meetingFrequency,
      });
    } catch (error) {
      message.error("Failed to load group details");
      console.error(error);
      router.push("/groups");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    if (!group) return;

    // Check if user can edit this group
    const canEdit =
      user?.role === "SUPERADMIN" ||
      (user?.role === "LEADER" && group.leaderId === user.id);

    if (!canEdit) {
      message.error("You don't have permission to edit this group");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`/api/groups/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update group");
      }

      message.success("Group updated successfully");
      router.push(`/groups/${params.id}`);
    } catch (error: any) {
      message.error(error.message || "Failed to update group");
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

  const canEdit =
    user?.role === "SUPERADMIN" ||
    (user?.role === "LEADER" && group.leaderId === user.id);

  if (!canEdit) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <p className="text-gray-500">
            You don't have permission to edit this group
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
        <h1 className="text-2xl font-bold text-gray-900">Edit Group</h1>
        <p className="text-gray-500 mt-1">
          Update fellowship group information
        </p>
      </div>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          disabled={submitting}
        >
          <Form.Item
            label="Group Name"
            name="name"
            rules={[
              { required: true, message: "Please enter group name" },
              { min: 3, message: "Name must be at least 3 characters" },
            ]}
          >
            <Input placeholder="e.g., Young Adults Fellowship" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: "Please enter description" }]}
            extra={`${form.getFieldValue("description")?.length || 0}/500 characters`}
          >
            <TextArea
              rows={4}
              maxLength={500}
              placeholder="Describe the fellowship group, its purpose, and target members"
            />
          </Form.Item>

          <Form.Item
            label="Meeting Frequency"
            name="meetingFrequency"
            rules={[
              { required: true, message: "Please select meeting frequency" },
            ]}
          >
            <Select placeholder="Select meeting frequency">
              <Select.Option value="WEEKLY">Weekly</Select.Option>
              <Select.Option value="BIWEEKLY">
                Biweekly (Every 2 weeks)
              </Select.Option>
              <Select.Option value="MONTHLY">Monthly</Select.Option>
            </Select>
          </Form.Item>

          <div className="flex gap-2 justify-end">
            <Button onClick={() => router.push(`/groups/${params.id}`)}>
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={submitting}
            >
              Save Changes
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}
