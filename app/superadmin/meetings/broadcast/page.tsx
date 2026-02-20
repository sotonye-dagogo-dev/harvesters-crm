"use client";

import { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Select,
  DatePicker,
  TimePicker,
  message,
  Typography,
  Divider,
  Tag,
  Alert,
} from "antd";
import {
  CalendarOutlined,
  TeamOutlined,
  BellOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/features/navigation/DashboardLayout";
import { Dayjs } from "dayjs";
import { UserRole } from "@/lib/types";
import { TextArea } from "@/components/ui/Input";

const { Title, Text } = Typography;

interface Group {
  id: string;
  name: string;
  memberCount: number;
  leader: {
    id: string;
    name: string;
  };
}

interface BroadcastFormValues {
  groupIds: string[];
  date: Dayjs;
  startTime: Dayjs;
  endTime: Dayjs;
  topic: string;
  notes?: string;
}

export default function CreateBroadcastMeetingPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(true);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const res = await fetch("/api/groups");
      const result = await res.json();

      if (result.success) {
        const groupsData = (result.data || []).map((group: Group) => ({
          id: group.id,
          name: group.name,
          memberCount: group.memberCount,
          leader: group.leader,
        }));
        setGroups(groupsData);
      }
    } catch (error) {
      message.error("Failed to load groups");
      console.error(error);
    } finally {
      setLoadingGroups(false);
    }
  };

  const onFinish = async (values: BroadcastFormValues) => {
    setLoading(true);

    try {
      const payload = {
        groupIds: values.groupIds,
        date: values.date.format("YYYY-MM-DD"),
        startTime: values.startTime.format("HH:mm"),
        endTime: values.endTime.format("HH:mm"),
        topic: values.topic,
        notes: values.notes || "",
      };

      const res = await fetch("/api/meetings/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to create broadcast meeting");
      }

      message.success(
        `Broadcast meeting created for ${result.data.count} group(s)!`
      );

      // Reset form
      form.resetFields();
      setSelectedGroups([]);

      // Optionally navigate back
      setTimeout(() => {
        router.push("/superadmin/dashboard");
      }, 1500);
    } catch (error) {
      message.error(
        error instanceof Error
          ? error.message
          : "Failed to create broadcast meeting"
      );
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGroupSelection = (groupIds: string[]) => {
    setSelectedGroups(groupIds);
    form.setFieldValue("groupIds", groupIds);
  };

  const selectAllGroups = () => {
    const allGroupIds = groups.map((g) => g.id);
    handleGroupSelection(allGroupIds);
  };

  const clearSelection = () => {
    handleGroupSelection([]);
  };

  const selectedGroupCount = selectedGroups.length;
  const totalGroupCount = groups.length;

  return (
    <DashboardLayout role={UserRole.SUPERADMIN}>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <Button onClick={() => router.back()} className="mb-4">
            ← Back
          </Button>

          <div className="flex items-center gap-3 mb-2">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-ds-brand-accent-subtle rounded-lg">
              <BellOutlined className="text-2xl text-ds-brand-accent" />
            </div>
            <Title level={2} className="!mb-0">
              Create Broadcast Meeting
            </Title>
          </div>
          <Text type="secondary">
            Create a meeting template for multiple groups at once. Leaders will
            use these templates when logging their meetings.
          </Text>
        </div>

        <Alert
          message="How Broadcast Meetings Work"
          description="When you create a broadcast meeting, a template is created for each selected group. Group leaders will see these templates when logging meetings and can use them with pre-filled information. They'll only need to add notes, upload screenshots, and mark attendance."
          type="info"
          showIcon
          className="mb-6"
        />

        <Card>
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            size="large"
            autoComplete="off"
          >
            {/* Group Selection */}
            <div className="bg-ds-surface-sunken p-4 rounded-lg mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TeamOutlined className="text-lg text-ds-brand-accent" />
                  <Text strong>Select Target Groups</Text>
                </div>
                <div className="flex gap-2">
                  <Button size="small" onClick={selectAllGroups} type="link">
                    Select All
                  </Button>
                  <Button
                    size="small"
                    onClick={clearSelection}
                    type="link"
                    danger
                  >
                    Clear
                  </Button>
                </div>
              </div>

              <Form.Item
                name="groupIds"
                rules={[
                  {
                    required: true,
                    message: "Please select at least one group",
                  },
                ]}
              >
                <Select
                  mode="multiple"
                  placeholder="Select groups to create meetings for"
                  loading={loadingGroups}
                  maxTagCount="responsive"
                  onChange={handleGroupSelection}
                  filterOption={(input, option) =>
                    (option?.label?.toString().toLowerCase() ?? "").includes(
                      input.toLowerCase()
                    )
                  }
                  options={groups.map((group) => ({
                    label: `${group.name} (${group.memberCount} members)`,
                    value: group.id,
                  }))}
                />
              </Form.Item>

              {selectedGroupCount > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <Tag color="blue" className="px-3 py-1">
                    {selectedGroupCount} of {totalGroupCount} groups selected
                  </Tag>
                  {selectedGroupCount === totalGroupCount && (
                    <Tag color="success" icon={<TeamOutlined />}>
                      All groups
                    </Tag>
                  )}
                </div>
              )}
            </div>

            <Divider />

            {/* Meeting Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <CalendarOutlined className="text-lg text-ds-brand-accent" />
                <Text strong>Meeting Details</Text>
              </div>

              <Form.Item
                label="Meeting Topic/Title"
                name="topic"
                rules={[
                  {
                    required: true,
                    message: "Please enter a meeting topic",
                  },
                ]}
              >
                <Input
                  placeholder="e.g., Weekly Bible Study, Prayer Meeting, Fellowship"
                  maxLength={100}
                  showCount
                />
              </Form.Item>

              <Form.Item
                label="Meeting Date"
                name="date"
                rules={[
                  {
                    required: true,
                    message: "Please select a meeting date",
                  },
                ]}
              >
                <DatePicker className="w-full" format="D MMM YYYY" />
              </Form.Item>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item
                  label="Start Time"
                  name="startTime"
                  rules={[
                    {
                      required: true,
                      message: "Please select start time",
                    },
                  ]}
                >
                  <TimePicker
                    className="w-full"
                    format="HH:mm"
                    minuteStep={15}
                  />
                </Form.Item>

                <Form.Item
                  label="End Time"
                  name="endTime"
                  rules={[
                    {
                      required: true,
                      message: "Please select end time",
                    },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        const startTime = getFieldValue("startTime");
                        if (!value || !startTime) {
                          return Promise.resolve();
                        }
                        if (value.isAfter(startTime)) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error("End time must be after start time")
                        );
                      },
                    }),
                  ]}
                >
                  <TimePicker
                    className="w-full"
                    format="HH:mm"
                    minuteStep={15}
                  />
                </Form.Item>
              </div>

              <Form.Item
                label="Meeting Notes (Optional)"
                name="notes"
                extra="Leaders can add additional notes when logging the meeting"
              >
                <TextArea
                  rows={4}
                  placeholder="Add any general notes or instructions for this meeting..."
                  maxLength={500}
                  showCount
                />
              </Form.Item>
            </div>

            <Divider />

            {/* Submit Buttons */}
            <div className="flex justify-end gap-3">
              <Button size="large" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button
                type="primary"
                size="large"
                htmlType="submit"
                loading={loading}
                icon={<SendOutlined />}
                disabled={selectedGroupCount === 0}
              >
                Create Broadcast Meeting
                {selectedGroupCount > 0 &&
                  ` for ${selectedGroupCount} Group(s)`}
              </Button>
            </div>
          </Form>
        </Card>
      </div>
    </DashboardLayout>
  );
}
