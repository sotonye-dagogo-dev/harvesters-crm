"use client";

import { UserRole } from "@/lib/types";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import {
  Form,
  Select,
  DatePicker,
  TimePicker,
  Button,
  Card,
  message,
  Spin,
} from "antd";
import { SaveOutlined, PhoneOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import { TextArea } from "@/components/ui/Input";

interface InteractionFormValues {
  date: Dayjs;
  time: Dayjs;
  type: string;
  memberId: string;
  notes?: string;
}

export default function EditInteractionPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [interaction, setInteraction] = useState<InteractionWithDetails | null>(
    null
  );
  const [groupMembers, setGroupMembers] = useState<User[]>([]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const fetchData = async () => {
    try {
      // Fetch interaction details
      const interactionRes = await fetch(`/api/interactions/${params.id}`);
      if (!interactionRes.ok) throw new Error("Failed to fetch interaction");
      const interactionData: InteractionWithDetails =
        await interactionRes.json();
      setInteraction(interactionData);

      // Fetch group members
      if (user?.groupId) {
        const membersRes = await fetch(`/api/groups/${user.groupId}/members`);
        if (membersRes.ok) {
          const membersData = await membersRes.json();
          setGroupMembers(membersData);
        }
      }

      // Pre-fill form
      const timestamp = dayjs(interactionData.timestamp);
      form.setFieldsValue({
        type: interactionData.type,
        memberId: interactionData.memberId,
        date: timestamp,
        time: timestamp,
        notes: interactionData.notes,
      });
    } catch (error) {
      message.error("Failed to load interaction details");
      console.error(error);
      router.push("/leader/interactions");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: InteractionFormValues) => {
    if (!interaction) return;

    // Check if user can edit this interaction
    const canEdit =
      user?.role === UserRole.SUPERADMIN ||
      (user?.role === UserRole.SMALL_GROUP_LEADER &&
        interaction.leaderId === user.id);

    if (!canEdit) {
      message.error("You don't have permission to edit this interaction");
      return;
    }

    setSaving(true);

    try {
      const timestamp = dayjs(values.date)
        .hour(values.time.hour())
        .minute(values.time.minute())
        .toISOString();

      const payload = {
        type: values.type,
        memberId: values.memberId,
        notes: values.notes || "",
        timestamp,
      };

      const res = await fetch(`/api/interactions/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update interaction");
      }

      message.success("Interaction updated successfully");
      router.push("/leader/interactions");
    } catch (error: unknown) {
      message.error(error instanceof Error ? error.message : "Failed to update interaction");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!interaction) {
    return null;
  }

  const canEdit =
    user?.role === UserRole.SUPERADMIN ||
    (user?.role === UserRole.SMALL_GROUP_LEADER &&
      interaction.leaderId === user.id);

  if (!canEdit) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <p className="text-ds-text-subtle">
            You don&apos;t have permission to edit this interaction
          </p>
          <Button
            type="primary"
            onClick={() => router.push("/leader/interactions")}
          >
            Back to Interactions
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ds-text-primary">Edit Interaction</h1>
        <p className="text-ds-text-subtle mt-1">Update interaction details</p>
      </div>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          disabled={saving}
        >
          <Form.Item
            label="Interaction Type"
            name="type"
            rules={[
              { required: true, message: "Please select interaction type" },
            ]}
          >
            <Select placeholder="Select interaction type" size="large">
              <Select.Option value="CALL">
                <PhoneOutlined className="mr-2" />
                Phone Call
              </Select.Option>
              <Select.Option value="FOLLOW_UP">Follow-up</Select.Option>
              <Select.Option value="CHECK_IN">Check-in</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Member"
            name="memberId"
            rules={[{ required: true, message: "Please select a member" }]}
          >
            <Select
              placeholder="Select member"
              size="large"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toString()
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={groupMembers
                .filter((m) => m.id !== user?.id)
                .map((member) => ({
                  value: member.id,
                  label: `${member.firstName} ${member.lastName}`,
                }))}
            />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label="Date"
              name="date"
              rules={[{ required: true, message: "Please select date" }]}
            >
              <DatePicker
                className="w-full"
                format="D MMM YYYY"
                placeholder="Select date"
                size="large"
              />
            </Form.Item>

            <Form.Item
              label="Time"
              name="time"
              rules={[{ required: true, message: "Please select time" }]}
            >
              <TimePicker
                className="w-full"
                format="h:mm A"
                use12Hours
                placeholder="Select time"
                size="large"
              />
            </Form.Item>
          </div>

          <Form.Item
            label="Notes"
            name="notes"
            rules={[{ required: true, message: "Please enter notes" }]}
            extra={`${
              form.getFieldValue("notes")?.length || 0
            }/1000 characters`}
          >
            <TextArea
              rows={6}
              maxLength={1000}
              placeholder="Enter details about the interaction, discussion points, prayer requests, concerns, etc."
            />
          </Form.Item>

          <div className="flex gap-3 justify-end">
            <Button onClick={() => router.push("/leader/interactions")}>
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={saving}
            >
              Save Changes
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}
