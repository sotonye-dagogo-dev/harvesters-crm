"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import {
  Card,
  Descriptions,
  Button,
  Spin,
  Tag,
  Modal,
  message,
  Image,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  TeamOutlined,
  FileTextOutlined,
  CheckSquareOutlined,
} from "@ant-design/icons";
import { format } from "date-fns";

export default function MeetingDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const [meeting, setMeeting] = useState<MeetingWithDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMeetingDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchMeetingDetails = async () => {
    try {
      const res = await fetch(`/api/meetings/${id}`);
      if (!res.ok) throw new Error("Failed to fetch meeting");
      const result = await res.json();
      // Handle successResponse wrapper
      const data = result.data || result;
      setMeeting(data);
    } catch (error) {
      message.error("Failed to load meeting details");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Modal.confirm({
      title: "Delete Meeting",
      content:
        "Are you sure you want to delete this meeting? This action cannot be undone.",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const res = await fetch(`/api/meetings/${id}`, {
            method: "DELETE",
          });

          if (!res.ok) throw new Error("Failed to delete meeting");

          message.success("Meeting deleted successfully");
          router.push("/leader/meetings");
        } catch (error) {
          message.error("Failed to delete meeting");
          console.error(error);
        }
      },
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <p className="text-gray-500">Meeting not found</p>
          <Button
            type="primary"
            onClick={() => router.push("/leader/meetings")}
          >
            Back to Meetings
          </Button>
        </Card>
      </div>
    );
  }

  const canEdit =
    user?.role === "SUPERADMIN" ||
    (user?.role === "LEADER" && meeting.group?.leaderId === user.id);

  const duration =
    new Date(`1970-01-01T${meeting.endTime}`).getTime() -
    new Date(`1970-01-01T${meeting.startTime}`).getTime();
  const durationHours = Math.floor(duration / (1000 * 60 * 60));
  const durationMinutes = Math.floor(
    (duration % (1000 * 60 * 60)) / (1000 * 60)
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meeting Details</h1>
          <p className="text-gray-500 mt-1">
            {meeting.group.name} •{" "}
            {format(new Date(meeting.date), "MMMM d, yyyy")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => router.push("/leader/meetings")}>Back</Button>
          {canEdit && (
            <>
              <Button
                icon={<CheckSquareOutlined />}
                onClick={async () =>
                  router.push(
                    `/leader/meetings/${(await params).id}/attendance`
                  )
                }
              >
                Manage Attendance
              </Button>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={async () =>
                  router.push(`/leader/meetings/${(await params).id}/edit`)
                }
              >
                Edit
              </Button>
              <Button danger icon={<DeleteOutlined />} onClick={handleDelete}>
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* Meeting Information */}
        <Card title="Meeting Information">
          <Descriptions column={2} bordered>
            <Descriptions.Item
              label={
                <span>
                  <CalendarOutlined className="mr-2" />
                  Date
                </span>
              }
            >
              {format(new Date(meeting.date), "EEEE, MMMM d, yyyy")}
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <span>
                  <ClockCircleOutlined className="mr-2" />
                  Time
                </span>
              }
            >
              {format(
                new Date(`2000-01-01T${meeting.startTime}`),
                "h:mm a"
              )} - {format(new Date(`2000-01-01T${meeting.endTime}`), "h:mm a")}
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <span>
                  <ClockCircleOutlined className="mr-2" />
                  Duration
                </span>
              }
            >
              {durationHours > 0 && `${durationHours}h `}
              {durationMinutes}m
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <span>
                  <TeamOutlined className="mr-2" />
                  Attendees
                </span>
              }
            >
              <Tag color="blue">{meeting.attendeeCount} members</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Group" span={2}>
              {meeting.group?.name || "Unknown Group"}
            </Descriptions.Item>
            <Descriptions.Item label="Created By" span={2}>
              {meeting.createdBy
                ? `${meeting.createdBy.firstName} ${meeting.createdBy.lastName}`
                : "Unknown"}
            </Descriptions.Item>
            <Descriptions.Item label="Created At" span={2}>
              {format(new Date(meeting.createdAt), "MMMM d, yyyy 'at' h:mm a")}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Meeting Notes */}
        {meeting.notes && (
          <Card
            title={
              <span>
                <FileTextOutlined className="mr-2" />
                Meeting Notes
              </span>
            }
          >
            <p className="text-gray-700 whitespace-pre-wrap">{meeting.notes}</p>
          </Card>
        )}

        {/* Meeting Screenshot */}
        {meeting.screenshotUrl && (
          <Card title="Meeting Screenshot">
            <Image
              src={meeting.screenshotUrl}
              alt="Meeting screenshot"
              className="rounded-lg"
              preview={{
                mask: "Click to view full size",
              }}
            />
          </Card>
        )}
      </div>
    </div>
  );
}
