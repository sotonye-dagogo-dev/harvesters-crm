"use client";

import { UserRole } from "@/lib/types";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import {
  Form,
  Select,
  Input,
  DatePicker,
  TimePicker,
  Button,
  Card,
  message,
  Alert,
} from "antd";
import { SaveOutlined, PhoneOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { TextArea } = Input;

export default function LogInteractionPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [groupMembers, setGroupMembers] = useState<User[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  // Fetch group members when leader is authenticated
  const fetchGroupMembers = async () => {
    if (!user?.groupId) return;

    setLoadingMembers(true);
    try {
      const res = await fetch(`/api/groups/${user.groupId}/members`);
      if (!res.ok) throw new Error("Failed to fetch members");
      const data = await res.json();
      setGroupMembers(data);
    } catch (error) {
      message.error("Failed to load group members");
      console.error(error);
    } finally {
      setLoadingMembers(false);
    }
  };

  // Fetch members when component mounts
  useState(() => {
    if (user?.role === UserRole.SMALL_GROUP_LEADER && user.groupId) {
      fetchGroupMembers();
    }
  });

  const handleSubmit = async (values: any) => {
    if (!user?.groupId) {
      message.error("You must be assigned to a group to log interactions");
      return;
    }

    setLoading(true);

    try {
      const timestamp = dayjs(values.date)
        .hour(values.time.hour())
        .minute(values.time.minute())
        .toISOString();

      const payload = {
        leaderId: user.id,
        memberId: values.memberId,
        type: values.type,
        notes: values.notes || "",
        timestamp,
      };

      const res = await fetch("/api/interactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to log interaction");
      }

      message.success("Interaction logged successfully");
      router.push("/leader/interactions");
    } catch (error: any) {
      message.error(error.message || "Failed to log interaction");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Check if user is a leader
  if (user?.role !== UserRole.SMALL_GROUP_LEADER && user?.role !== "SUPERADMIN") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <p className="text-gray-500">
            Only group leaders can log interactions
          </p>
          <Button
            type="primary"
            onClick={() => router.push("/leader/dashboard")}
          >
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  if (!user?.groupId) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <Alert
          title="No Group Assigned"
          description="You need to be assigned to a group before you can log interactions. Please contact your administrator."
          type="warning"
          showIcon
        />
        <Button
          type="primary"
          className="mt-4"
          onClick={() => router.push("/leader/dashboard")}
        >
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Log Interaction</h1>
        <p className="text-gray-500 mt-1">
          Record calls, follow-ups, and check-ins with members
        </p>
      </div>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          disabled={loading}
          initialValues={{
            date: dayjs(),
            time: dayjs(),
          }}
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
              loading={loadingMembers}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toString()
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={groupMembers
                .filter((m) => m.id !== user.id) // Exclude self
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
                format="MMMM D, YYYY"
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
              loading={loading}
            >
              Log Interaction
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}