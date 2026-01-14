"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import {
  Form,
  Input,
  DatePicker,
  TimePicker,
  InputNumber,
  Button,
  Card,
  message,
  Spin,
} from "antd";
import { SaveOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { TextArea } = Input;

export default function EditMeetingPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [meeting, setMeeting] = useState<MeetingWithDetails | null>(null);

  useEffect(() => {
    fetchMeetingDetails();
  }, [params.id]);

  const fetchMeetingDetails = async () => {
    try {
      const res = await fetch(`/api/meetings/${params.id}`);
      if (!res.ok) throw new Error("Failed to fetch meeting");
      const data = await res.json();
      setMeeting(data);

      // Pre-fill form with existing data
      form.setFieldsValue({
        date: dayjs(data.date),
        startTime: dayjs(`2000-01-01T${data.startTime}`),
        endTime: dayjs(`2000-01-01T${data.endTime}`),
        attendeeCount: data.attendeeCount,
        notes: data.notes,
      });
    } catch (error) {
      message.error("Failed to load meeting details");
      console.error(error);
      router.push("/meetings");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    if (!meeting) return;

    // Check if user can edit this meeting
    const canEdit =
      user?.role === "SUPERADMIN" ||
      (user?.role === "LEADER" && meeting.group.leaderId === user.id);

    if (!canEdit) {
      message.error("You don't have permission to edit this meeting");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        date: values.date.toISOString(),
        startTime: values.startTime.format("HH:mm"),
        endTime: values.endTime.format("HH:mm"),
        attendeeCount: values.attendeeCount,
        notes: values.notes || "",
      };

      const res = await fetch(`/api/meetings/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update meeting");
      }

      message.success("Meeting updated successfully");
      router.push(`/meetings/${params.id}`);
    } catch (error: any) {
      message.error(error.message || "Failed to update meeting");
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

  if (!meeting) {
    return null;
  }

  const canEdit =
    user?.role === "SUPERADMIN" ||
    (user?.role === "LEADER" && meeting.group.leaderId === user.id);

  if (!canEdit) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <p className="text-gray-500">
            You don't have permission to edit this meeting
          </p>
          <Button
            type="primary"
            onClick={() => router.push(`/meetings/${params.id}`)}
          >
            Back to Meeting
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Meeting</h1>
        <p className="text-gray-500 mt-1">
          Update meeting details for {meeting.group.name}
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
            label="Meeting Date"
            name="date"
            rules={[{ required: true, message: "Please select meeting date" }]}
          >
            <DatePicker
              className="w-full"
              format="MMMM D, YYYY"
              placeholder="Select meeting date"
            />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label="Start Time"
              name="startTime"
              rules={[{ required: true, message: "Please select start time" }]}
            >
              <TimePicker
                className="w-full"
                format="h:mm A"
                use12Hours
                placeholder="Select start time"
              />
            </Form.Item>

            <Form.Item
              label="End Time"
              name="endTime"
              rules={[{ required: true, message: "Please select end time" }]}
            >
              <TimePicker
                className="w-full"
                format="h:mm A"
                use12Hours
                placeholder="Select end time"
              />
            </Form.Item>
          </div>

          <Form.Item
            label="Number of Attendees"
            name="attendeeCount"
            rules={[
              { required: true, message: "Please enter attendee count" },
              { type: "number", min: 1, message: "Must be at least 1" },
            ]}
          >
            <InputNumber
              className="w-full"
              min={1}
              placeholder="Enter total number of attendees"
            />
          </Form.Item>

          <Form.Item
            label="Meeting Notes"
            name="notes"
            extra={`${form.getFieldValue("notes")?.length || 0}/1000 characters`}
          >
            <TextArea
              rows={6}
              maxLength={1000}
              placeholder="Enter meeting notes, discussion points, prayer requests, etc."
            />
          </Form.Item>

          <div className="flex gap-2 justify-end">
            <Button
              onClick={() => router.push(`/leader/meetings/${params.id}`)}
            >
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
