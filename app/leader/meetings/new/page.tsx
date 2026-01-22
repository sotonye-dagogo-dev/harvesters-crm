"use client";

import { useState } from "react";
import DashboardLayout from "@/components/features/navigation/DashboardLayout";
import { useAuth } from "@/providers/AuthProvider";
import {
  Form,
  Input as AntInput,
  DatePicker,
  Button as AntButton,
  Card,
  message,
  TimePicker,
  InputNumber,
} from "antd";
import { SaveOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import MockFileUpload from "@/components/ui/MockFileUpload";

const { TextArea } = AntInput;

export default function CreateMeetingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (values: {
    date: dayjs.Dayjs;
    startTime: dayjs.Dayjs;
    endTime: dayjs.Dayjs;
    topic?: string;
    attendeeCount: number;
    notes?: string;
    screenshot?: string;
  }) => {
    if (!user?.groupId) {
      message.error("You must be assigned to a group to create meetings");
      return;
    }

    setSaving(true);
    try {
      const meetingData = {
        groupId: user.groupId,
        date: values.date.toISOString(),
        startTime: values.startTime.format("HH:mm"),
        endTime: values.endTime.format("HH:mm"),
        topic: values.topic,
        attendanceMethod: "count" as const,
        attendeeCount: values.attendeeCount,
        notes: values.notes,
        screenshotUrl: values.screenshot,
      };

      const response = await fetch("/api/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(meetingData),
      });

      if (response.ok) {
        const data = await response.json();
        message.success("Meeting created successfully");
        router.push(`/leader/meetings/${data.data.id}`);
      } else {
        const error = await response.json();
        message.error(error.error || "Failed to create meeting");
      }
    } catch (error) {
      message.error("An error occurred while creating meeting");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout role={user?.role || "LEADER"}>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Create New Meeting
          </h2>
          <p className="text-gray-600 mt-1">
            Log a fellowship meeting for your group
          </p>
        </div>

        <Card className="max-w-2xl">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            disabled={saving}
            initialValues={{
              date: dayjs(),
              startTime: dayjs().hour(18).minute(0),
              endTime: dayjs().hour(20).minute(0),
            }}
          >
            <Form.Item
              label="Meeting Date"
              name="date"
              rules={[{ required: true, message: "Please select a date" }]}
            >
              <DatePicker style={{ width: "100%" }} format="MMMM D, YYYY" />
            </Form.Item>

            <Form.Item label="Meeting Topic (Optional)" name="topic">
              <AntInput placeholder="e.g., Prayer and Worship Night" />
            </Form.Item>

            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                label="Start Time"
                name="startTime"
                rules={[
                  { required: true, message: "Please select start time" },
                ]}
              >
                <TimePicker
                  style={{ width: "100%" }}
                  format="h:mm A"
                  use12Hours
                />
              </Form.Item>

              <Form.Item
                label="End Time"
                name="endTime"
                rules={[{ required: true, message: "Please select end time" }]}
              >
                <TimePicker
                  style={{ width: "100%" }}
                  format="h:mm A"
                  use12Hours
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
                style={{ width: "100%" }}
                min={1}
                placeholder="Enter total attendees"
              />
            </Form.Item>

            <Form.Item label="Meeting Notes" name="notes">
              <TextArea
                rows={4}
                placeholder="Key discussion points, prayer requests, announcements..."
                maxLength={1000}
                showCount
              />
            </Form.Item>

            <Form.Item
              label="Meeting Screenshot (Optional)"
              name="screenshot"
              tooltip="Upload a screenshot of your WhatsApp call or group photo"
            >
              <MockFileUpload
                accept="image/*"
                maxSize={5}
                uploadText="Upload Meeting Screenshot"
              />
            </Form.Item>

            <div className="flex gap-3 justify-end">
              <AntButton onClick={() => router.push("/leader/meetings")}>
                Cancel
              </AntButton>
              <AntButton
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={saving}
              >
                Create Meeting
              </AntButton>
            </div>
          </Form>
        </Card>
      </div>
    </DashboardLayout>
  );
}
