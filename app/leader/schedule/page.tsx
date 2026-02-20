"use client";

import { UserRole } from "@/lib/types";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/features/navigation/DashboardLayout";
import { useAuth } from "@/providers/AuthProvider";
import {
  Card,
  Button as AntButton,
  message,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  Calendar,
  Badge,
  Tag,
  Spin,
  Empty,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { TextArea } from "@/components/ui/Input";

interface Meeting {
  id: string;
  topic: string;
  date: string;
  summary: string;
  groupId: string;
  leaderId: string;
  status: "UPCOMING" | "COMPLETED" | "CANCELLED";
  attendees: string[];
}

interface MeetingFormValues {
  topic: string;
  date: Dayjs;
  summary: string;
}

interface BiweeklyGeneratorValues {
  startDate: Dayjs;
  numberOfWeeks: number;
  dayOfWeek: string;
  time: string;
  topicPrefix: string;
  summaryTemplate?: string;
}

export default function MeetingSchedulingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isGeneratorVisible, setIsGeneratorVisible] = useState(false);
  const [form] = Form.useForm();
  const [generatorForm] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const fetchMeetingsCallback = useCallback(async () => {
    try {
      const response = await fetch(`/api/meetings?groupId=${user?.groupId}`);
      if (response.ok) {
        const result = await response.json();
        // API returns data in result.data
        const meetingsData = result.data || [];
        setMeetings(Array.isArray(meetingsData) ? meetingsData : []);
      }
    } catch (err) {
      console.error("Failed to fetch meetings:", err);
      message.error("Failed to load meetings");
    } finally {
      setLoading(false);
    }
  }, [user?.groupId]);

  useEffect(() => {
    if (user?.groupId) {
      fetchMeetingsCallback();
    } else {
      setLoading(false);
    }
  }, [user?.groupId, fetchMeetingsCallback]);

  const handleCreateMeeting = async (values: MeetingFormValues) => {
    setSaving(true);
    try {
      const meetingDateTime = dayjs(values.date);
      const response = await fetch("/api/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId: user?.groupId,
          date: meetingDateTime.format("YYYY-MM-DD"),
          startTime: meetingDateTime.format("HH:mm"),
          endTime: meetingDateTime.add(2, "hours").format("HH:mm"),
          topic: values.topic,
          attendanceMethod: "count" as const,
          attendeeCount: 0,
          notes: values.summary,
        }),
      });

      if (response.ok) {
        message.success("Meeting created successfully");
        setIsModalVisible(false);
        form.resetFields();
        fetchMeetingsCallback();
      } else {
        const err = await response.json();
        message.error(err.error || "Failed to create meeting");
      }
    } catch {
      message.error("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateBiweeklySchedule = async (
    values: BiweeklyGeneratorValues
  ) => {
    setSaving(true);
    try {
      const {
        startDate,
        numberOfWeeks,
        dayOfWeek,
        time,
        topicPrefix,
        summaryTemplate,
      } = values;

      const meetings: Array<{
        topic: string;
        date: string;
        summary: string;
        groupId: string;
        status: string;
      }> = [];
      const start = dayjs(startDate);

      // Find the first occurrence of the selected day of week
      let currentDate = start;
      const targetDay = parseInt(dayOfWeek);
      while (currentDate.day() !== targetDay) {
        currentDate = currentDate.add(1, "day");
      }

      // Generate biweekly meetings
      for (let i = 0; i < numberOfWeeks; i++) {
        const meetingDate = currentDate.add(i * 2, "weeks");
        const [hours, minutes] = time.split(":");
        const meetingDateTime = meetingDate
          .hour(parseInt(hours))
          .minute(parseInt(minutes))
          .second(0);

        meetings.push({
          topic: `${topicPrefix} - Week ${i * 2 + 1}`,
          date: meetingDateTime.toISOString(),
          summary: summaryTemplate || "Biweekly fellowship meeting",
          groupId: user!.groupId!,
          status: "UPCOMING",
        });
      }

      // Create all meetings
      const createPromises = meetings.map((meeting) =>
        fetch("/api/meetings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            groupId: meeting.groupId,
            date: meeting.date,
            startTime: time,
            endTime: dayjs(time, "HH:mm").add(2, "hours").format("HH:mm"),
            topic: meeting.topic,
            attendanceMethod: "count",
            attendeeCount: 0,
            notes: meeting.summary,
          }),
        })
      );

      const results = await Promise.all(createPromises);
      const successCount = results.filter((r) => r.ok).length;

      if (successCount === meetings.length) {
        message.success(
          `Successfully created ${successCount} biweekly meetings`
        );
        setIsGeneratorVisible(false);
        generatorForm.resetFields();
        fetchMeetingsCallback();
      } else {
        message.warning(
          `Created ${successCount} of ${meetings.length} meetings`
        );
        fetchMeetingsCallback();
      }
    } catch {
      message.error("Failed to generate meetings");
    } finally {
      setSaving(false);
    }
  };

  const getMeetingsForDate = (date: Dayjs) => {
    return meetings?.filter((meeting) =>
      dayjs(meeting.date).isSame(date, "day")
    );
  };

  const dateCellRender = (date: Dayjs) => {
    const dayMeetings = getMeetingsForDate(date);

    if (dayMeetings.length === 0) return null;

    return (
      <ul className="space-y-0.5 sm:space-y-1">
        {dayMeetings.slice(0, 2).map((meeting) => (
          <li key={meeting.id}>
            <Tooltip title={meeting.topic || "Untitled Meeting"}>
              <Badge
                status={
                  meeting.status === "COMPLETED"
                    ? "success"
                    : meeting.status === "CANCELLED"
                      ? "error"
                      : "processing"
                }
                text={
                  <span className="text-[10px] sm:text-xs truncate block max-w-[50px] sm:max-w-[100px]">
                    <span className="hidden sm:inline">
                      {dayjs(meeting.date).format("HH:mm")} -{" "}
                    </span>
                    {meeting.topic?.substring(0, 12) || "Untitled"}
                  </span>
                }
              />
            </Tooltip>
          </li>
        ))}
        {dayMeetings.length > 2 && (
          <li className="text-[10px] sm:text-xs text-ds-text-subtle">
            +{dayMeetings.length - 2} more
          </li>
        )}
      </ul>
    );
  };

  const handleDateSelect = (date: Dayjs) => {
    setSelectedDate(date);
  };

  const selectedDateMeetings = getMeetingsForDate(selectedDate);

  if (!user?.groupId) {
    return (
      <DashboardLayout role={UserRole.SMALL_GROUP_LEADER}>
        <Card>
          <Empty
            description="You are not assigned to a group"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout role={UserRole.SMALL_GROUP_LEADER}>
        <div className="flex items-center justify-center h-96">
          <Spin size="large" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role={UserRole.SMALL_GROUP_LEADER}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-ds-text-primary">
              Meeting Schedule
            </h2>
            <p className="text-ds-text-secondary">
              Plan and manage your group meetings
            </p>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <AntButton
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsModalVisible(true)}
              className="flex-1 sm:flex-initial"
            >
              Create Meeting
            </AntButton>
            <AntButton
              icon={<ThunderboltOutlined />}
              onClick={() => setIsGeneratorVisible(true)}
              className="flex-1 sm:flex-initial"
            >
              Generate Schedule
            </AntButton>
          </div>
        </div>

        {/* Calendar View */}
        <Card className="overflow-x-auto">
          <Calendar
            value={selectedDate}
            onSelect={handleDateSelect}
            cellRender={dateCellRender}
            className="[&_.ant-picker-calendar-date-content]:h-auto [&_.ant-picker-cell]:p-1 sm:[&_.ant-picker-cell]:p-2"
            headerRender={({ value, onChange }) => (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 px-2 sm:px-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
                  <h3 className="text-lg font-semibold">
                    {value.format("MMMM YYYY")}
                  </h3>
                  <div className="flex gap-2 flex-wrap">
                    <AntButton
                      size="small"
                      onClick={() => onChange(value.subtract(1, "month"))}
                    >
                      Previous
                    </AntButton>
                    <AntButton size="small" onClick={() => onChange(dayjs())}>
                      Today
                    </AntButton>
                    <AntButton
                      size="small"
                      onClick={() => onChange(value.add(1, "month"))}
                    >
                      Next
                    </AntButton>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-2 flex-wrap">
                  <Badge status="processing" text="Upcoming" />
                  <Badge status="success" text="Completed" />
                  <Badge status="error" text="Cancelled" />
                </div>
              </div>
            )}
          />
        </Card>

        {/* Selected Date Meetings */}
        <Card
          title={`Meetings on ${selectedDate.format("D MMM YYYY")}`}
          extra={
            <Tag color="blue" icon={<CalendarOutlined />}>
              {selectedDateMeetings.length} meeting
              {selectedDateMeetings.length !== 1 ? "s" : ""}
            </Tag>
          }
        >
          {selectedDateMeetings.length === 0 ? (
            <Empty
              description="No meetings scheduled for this date"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <AntButton
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  form.setFieldsValue({ date: selectedDate });
                  setIsModalVisible(true);
                }}
              >
                Create Meeting
              </AntButton>
            </Empty>
          ) : (
            <div className="space-y-4">
              {selectedDateMeetings.map((meeting) => (
                <Card
                  key={meeting.id}
                  size="small"
                  className="bg-ds-surface-sunken"
                  extra={
                    <Tag
                      color={
                        meeting.status === "COMPLETED"
                          ? "green"
                          : meeting.status === "CANCELLED"
                            ? "red"
                            : "blue"
                      }
                      icon={
                        meeting.status === "COMPLETED" ? (
                          <CheckCircleOutlined />
                        ) : meeting.status === "CANCELLED" ? (
                          <ClockCircleOutlined />
                        ) : (
                          <CalendarOutlined />
                        )
                      }
                      className="hidden sm:inline-flex"
                    >
                      {meeting.status}
                    </Tag>
                  }
                >
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                    <div className="flex-1 w-full">
                      <h4 className="font-semibold text-base mb-2 break-words">
                        {meeting.topic}
                      </h4>
                      <div className="text-sm text-ds-text-secondary mb-2">
                        <ClockCircleOutlined className="mr-2" />
                        {dayjs(meeting.date).format("h:mm A")}
                      </div>
                      <p className="text-sm text-ds-text-secondary break-words">
                        {meeting.summary}
                      </p>
                      <Tag
                        color={
                          meeting.status === "COMPLETED"
                            ? "green"
                            : meeting.status === "CANCELLED"
                              ? "red"
                              : "blue"
                        }
                        className="mt-2 sm:hidden"
                      >
                        {meeting.status}
                      </Tag>
                    </div>
                    <AntButton
                      type="link"
                      className="w-full sm:w-auto"
                      onClick={() =>
                        router.push(`/leader/meetings/${meeting.id}`)
                      }
                    >
                      View Details
                    </AntButton>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Create Meeting Modal */}
      <Modal
        title="Create New Meeting"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateMeeting}
          disabled={saving}
        >
          <Form.Item
            label="Meeting Topic"
            name="topic"
            rules={[
              { required: true, message: "Please enter a meeting topic" },
            ]}
          >
            <Input placeholder="e.g., Weekly Fellowship Meeting" />
          </Form.Item>

          <Form.Item
            label="Date & Time"
            name="date"
            rules={[
              { required: true, message: "Please select a date and time" },
            ]}
          >
            <DatePicker
              showTime
              format="D MMM YYYY HH:mm"
              className="w-full"
              disabledDate={(current) =>
                current && current < dayjs().startOf("day")
              }
            />
          </Form.Item>

          <Form.Item
            label="Summary"
            name="summary"
            rules={[
              { required: true, message: "Please enter a meeting summary" },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Brief description of the meeting agenda or topics to be discussed"
            />
          </Form.Item>

          <Form.Item className="mb-0 flex justify-end gap-2">
            <AntButton
              onClick={() => {
                setIsModalVisible(false);
                form.resetFields();
              }}
            >
              Cancel
            </AntButton>
            <AntButton type="primary" htmlType="submit" loading={saving}>
              Create Meeting
            </AntButton>
          </Form.Item>
        </Form>
      </Modal>

      {/* Biweekly Schedule Generator Modal */}
      <Modal
        title="Generate Biweekly Schedule"
        open={isGeneratorVisible}
        onCancel={() => {
          setIsGeneratorVisible(false);
          generatorForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={generatorForm}
          layout="vertical"
          onFinish={handleGenerateBiweeklySchedule}
          disabled={saving}
          initialValues={{
            numberOfWeeks: 6,
            dayOfWeek: "0",
            time: "18:00",
          }}
        >
          <Form.Item
            label="Start Date"
            name="startDate"
            rules={[{ required: true, message: "Please select a start date" }]}
          >
            <DatePicker
              className="w-full"
              disabledDate={(current) =>
                current && current < dayjs().startOf("day")
              }
            />
          </Form.Item>

          <Form.Item
            label="Number of Meetings"
            name="numberOfWeeks"
            rules={[
              {
                required: true,
                message: "Please enter the number of meetings",
              },
            ]}
          >
            <Select>
              <Select.Option value={4}>4 meetings (8 weeks)</Select.Option>
              <Select.Option value={6}>6 meetings (12 weeks)</Select.Option>
              <Select.Option value={8}>8 meetings (16 weeks)</Select.Option>
              <Select.Option value={12}>12 meetings (24 weeks)</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Day of Week"
            name="dayOfWeek"
            rules={[
              { required: true, message: "Please select a day of the week" },
            ]}
          >
            <Select>
              <Select.Option value="0">Sunday</Select.Option>
              <Select.Option value="1">Monday</Select.Option>
              <Select.Option value="2">Tuesday</Select.Option>
              <Select.Option value="3">Wednesday</Select.Option>
              <Select.Option value="4">Thursday</Select.Option>
              <Select.Option value="5">Friday</Select.Option>
              <Select.Option value="6">Saturday</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Time"
            name="time"
            rules={[{ required: true, message: "Please select a time" }]}
          >
            <Select>
              <Select.Option value="09:00">9:00 AM</Select.Option>
              <Select.Option value="10:00">10:00 AM</Select.Option>
              <Select.Option value="11:00">11:00 AM</Select.Option>
              <Select.Option value="14:00">2:00 PM</Select.Option>
              <Select.Option value="16:00">4:00 PM</Select.Option>
              <Select.Option value="18:00">6:00 PM</Select.Option>
              <Select.Option value="19:00">7:00 PM</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Topic Prefix"
            name="topicPrefix"
            rules={[{ required: true, message: "Please enter a topic prefix" }]}
            initialValue="Fellowship Meeting"
          >
            <Input placeholder="e.g., Fellowship Meeting" />
          </Form.Item>

          <Form.Item
            label="Summary Template"
            name="summaryTemplate"
            initialValue="Biweekly fellowship meeting for spiritual growth and community building"
          >
            <TextArea
              rows={3}
              placeholder="Default summary for all generated meetings"
            />
          </Form.Item>

          <Form.Item className="mb-0 flex justify-end gap-2">
            <AntButton
              onClick={() => {
                setIsGeneratorVisible(false);
                generatorForm.resetFields();
              }}
            >
              Cancel
            </AntButton>
            <AntButton type="primary" htmlType="submit" loading={saving}>
              Generate Schedule
            </AntButton>
          </Form.Item>
        </Form>
      </Modal>
    </DashboardLayout>
  );
}
