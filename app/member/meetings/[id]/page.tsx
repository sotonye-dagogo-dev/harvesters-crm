"use client";

import { UserRole } from "@/lib/types";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import DashboardLayout from "@/components/features/navigation/DashboardLayout";
import { Card, Descriptions, Button, Spin, Tag, message, Image } from "antd";
import {
  ClockCircleOutlined,
  CalendarOutlined,
  TeamOutlined,
  FileTextOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { format } from "date-fns";

export default function MemberMeetingDetailsPage({
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
      const data = result.data || result;
      setMeeting(data);
    } catch (error) {
      message.error("Failed to load meeting details");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role={user?.role || UserRole.MEMBER}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Spin size="large" />
        </div>
      </DashboardLayout>
    );
  }

  if (!meeting) {
    return (
      <DashboardLayout role={user?.role || UserRole.MEMBER}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card>
            <p className="text-gray-500">Meeting not found</p>
            <Button
              type="primary"
              onClick={() => router.push("/member/my-group")}
            >
              Back to My Group
            </Button>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const duration =
    new Date(`1970-01-01T${meeting.endTime}`).getTime() -
    new Date(`1970-01-01T${meeting.startTime}`).getTime();
  const durationHours = Math.floor(duration / (1000 * 60 * 60));
  const durationMinutes = Math.floor(
    (duration % (1000 * 60 * 60)) / (1000 * 60)
  );

  return (
    <DashboardLayout role={user?.role || UserRole.MEMBER}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Meeting Details
            </h1>
            <p className="text-gray-500 mt-1">
              {meeting.group?.name || "Unknown Group"} •{" "}
              {format(new Date(meeting.date), "MMMM d, yyyy")}
            </p>
          </div>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => router.push("/member/my-group")}
          >
            Back to My Group
          </Button>
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
                )}{" "}
                -{" "}
                {format(new Date(`2000-01-01T${meeting.endTime}`), "h:mm a")}
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
                {format(
                  new Date(meeting.createdAt),
                  "MMMM d, yyyy 'at' h:mm a"
                )}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Meeting Notes (read-only) */}
          {meeting.notes && (
            <Card
              title={
                <span>
                  <FileTextOutlined className="mr-2" />
                  Meeting Notes
                </span>
              }
            >
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {meeting.notes}
              </p>
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
    </DashboardLayout>
  );
}
