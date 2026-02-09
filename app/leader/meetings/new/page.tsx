"use client";

import { UserRole } from "@/lib/types";
import { useState, useEffect } from "react";
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
  Checkbox,
  Alert,
  Spin,
} from "antd";
import {
  SaveOutlined,
  CheckOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import MockFileUpload from "@/components/ui/MockFileUpload";

const { TextArea } = AntInput;

export default function CreateMeetingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [members, setMembers] = useState<AuthUser[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [templates, setTemplates] = useState<Meeting[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Meeting | null>(
    null
  );
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.groupId) return;

      try {
        // Fetch group members
        const membersRes = await fetch(`/api/groups/${user.groupId}/members`);
        if (membersRes.ok) {
          const membersData = await membersRes.json();
          setMembers(membersData.data || []);
        }

        // Fetch broadcast templates if any
        const templatesRes = await fetch(
          `/api/meetings/broadcast?groupId=${user.groupId}`
        );
        if (templatesRes.ok) {
          const templatesData = await templatesRes.json();
          setTemplates(templatesData.data || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [user?.groupId]);

  const handleTemplateSelect = (template: Meeting) => {
    setSelectedTemplate(template);
    form.setFieldsValue({
      topic: template.topic,
      date: dayjs(template.date),
      startTime: dayjs(template.startTime, "HH:mm"),
      endTime: dayjs(template.endTime, "HH:mm"),
      notes: template.notes || "",
    });
  };

  const handleCheckAll = (checked: boolean) => {
    if (checked) {
      setSelectedMembers(members.map((m) => m.id));
    } else {
      setSelectedMembers([]);
    }
  };

  const handleMemberToggle = (memberId: string, checked: boolean) => {
    if (checked) {
      setSelectedMembers([...selectedMembers, memberId]);
    } else {
      setSelectedMembers(selectedMembers.filter((id) => id !== memberId));
    }
  };

  const handleSubmit = async (values: {
    date: dayjs.Dayjs;
    startTime: dayjs.Dayjs;
    endTime: dayjs.Dayjs;
    topic?: string;
    notes?: string;
    screenshot?: string;
  }) => {
    if (!user?.groupId) {
      message.error("You must be assigned to a group to create meetings");
      return;
    }

    if (selectedMembers.length === 0) {
      message.error("Please select at least one attendee");
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
        attendanceMethod: "members" as const,
        attendeeCount: selectedMembers.length,
        attendeeIds: selectedMembers,
        notes: values.notes,
        screenshotUrl: values.screenshot,
        templateId: selectedTemplate?.id, // Link to template if used
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
    <DashboardLayout role={user?.role || UserRole.SMALL_GROUP_LEADER}>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Create New Meeting
          </h2>
          <p className="text-gray-600 mt-1">
            Log a fellowship meeting for your group
          </p>
        </div>

        {loadingData ? (
          <Card className="max-w-2xl">
            <div className="flex justify-center items-center py-12">
              <Spin size="large" />
            </div>
          </Card>
        ) : (
          <>
            {/* Broadcast Templates Section */}
            {templates.length > 0 && (
              <Card
                className="max-w-2xl"
                title={
                  <div className="flex items-center gap-2">
                    <ClockCircleOutlined />
                    <span>Available Meeting Templates</span>
                  </div>
                }
              >
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 mb-4">
                    Select a template to pre-fill meeting details, or create a
                    new meeting from scratch below.
                  </p>
                  {templates.map((template) => (
                    <Card
                      key={template.id}
                      size="small"
                      hoverable
                      className={`cursor-pointer transition-all ${
                        selectedTemplate?.id === template.id
                          ? "border-2 border-purple-500 bg-purple-50"
                          : "border border-gray-200"
                      }`}
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">
                            {template.topic || "Fellowship Meeting"}
                          </h4>
                          <div className="flex gap-4 mt-2 text-sm text-gray-600">
                            <span>
                              📅 {dayjs(template.date).format("MMM D, YYYY")}
                            </span>
                            <span>
                              🕐 {template.startTime} - {template.endTime}
                            </span>
                          </div>
                          {template.notes && (
                            <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                              {template.notes}
                            </p>
                          )}
                        </div>
                        {selectedTemplate?.id === template.id && (
                          <CheckOutlined className="text-purple-600 text-lg" />
                        )}
                      </div>
                    </Card>
                  ))}
                  {selectedTemplate && (
                    <Alert
                      message="Template Selected"
                      description="Meeting details have been pre-filled. You can still edit them below."
                      type="success"
                      showIcon
                      closable
                      onClose={() => setSelectedTemplate(null)}
                    />
                  )}
                </div>
              </Card>
            )}

            {/* Meeting Form */}
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
                    rules={[
                      { required: true, message: "Please select end time" },
                    ]}
                  >
                    <TimePicker
                      style={{ width: "100%" }}
                      format="h:mm A"
                      use12Hours
                    />
                  </Form.Item>
                </div>

                {/* Attendance Section with Checkboxes */}
                <Form.Item
                  label={
                    <div className="flex items-center justify-between w-full">
                      <span>Meeting Attendees</span>
                      <Checkbox
                        checked={selectedMembers.length === members.length}
                        indeterminate={
                          selectedMembers.length > 0 &&
                          selectedMembers.length < members.length
                        }
                        onChange={(e) => handleCheckAll(e.target.checked)}
                      >
                        <span className="text-sm font-normal">Check All</span>
                      </Checkbox>
                    </div>
                  }
                  required
                  tooltip="Select all members who attended this meeting"
                >
                  <Card
                    size="small"
                    className="bg-gray-50 max-h-64 overflow-y-auto"
                  >
                    {members.length === 0 ? (
                      <p className="text-center text-gray-500 py-4">
                        No members in your group yet
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {members.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center p-2 hover:bg-white rounded transition-colors"
                          >
                            <Checkbox
                              checked={selectedMembers.includes(member.id)}
                              onChange={(e) =>
                                handleMemberToggle(member.id, e.target.checked)
                              }
                            >
                              <div className="ml-2">
                                <p className="font-medium text-gray-900">
                                  {member.firstName} {member.lastName}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {member.email}
                                </p>
                              </div>
                            </Checkbox>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                  {selectedMembers.length > 0 && (
                    <p className="text-sm text-gray-600 mt-2">
                      {selectedMembers.length} member
                      {selectedMembers.length !== 1 ? "s" : ""} selected
                    </p>
                  )}
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
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
