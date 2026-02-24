"use client";

import { UserRole } from "@/lib/types";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import DashboardLayout from "@/components/features/navigation/DashboardLayout";
import { Form, Select, message, Spin } from "antd";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input, { TextArea } from "@/components/ui/Input";
import { SaveOutlined } from "@ant-design/icons";

export default function EditGroupPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [group, setGroup] = useState<GroupWithDetails | null>(null);

  useEffect(() => {
    fetchGroupDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      router.push("/superadmin/groups");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: {
    name: string;
    description: string;
    meetingFrequency: string;
  }) => {
    if (!group) return;

    // Check if user can edit this group
    const canEdit =
      user?.role === UserRole.SUPERADMIN ||
      (user?.role === UserRole.SMALL_GROUP_LEADER &&
        group.leaderId === user.id);

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
      router.push(`/superadmin/groups/${params.id}`);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update group";
      message.error(errorMessage);
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role={UserRole.SUPERADMIN}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Spin size="large" />
        </div>
      </DashboardLayout>
    );
  }

  if (!group) {
    return null;
  }

  const canEdit =
    user?.role === UserRole.SUPERADMIN ||
    (user?.role === UserRole.SMALL_GROUP_LEADER && group.leaderId === user.id);

  if (!canEdit) {
    return (
      <DashboardLayout role={UserRole.SUPERADMIN}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card>
            <p className="text-ds-text-subtle">
              You don&apos;t have permission to edit this group
            </p>
            <Button
              onClick={() => router.push(`/superadmin/groups/${params.id}`)}
            >
              Back to Group
            </Button>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role={UserRole.SUPERADMIN}>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-ds-text-primary">Edit Group</h1>
          <p className="text-ds-text-subtle mt-1">
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
              <Button
                variant="secondary"
                onClick={() => router.push(`/superadmin/groups/${params.id}`)}
              >
                Cancel
              </Button>
              <Button
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
    </DashboardLayout>
  );
}
