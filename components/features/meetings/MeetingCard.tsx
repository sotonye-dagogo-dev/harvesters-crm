import { Card, Tag } from "antd";
import {
  CalendarOutlined,
  TeamOutlined,
  FileImageOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { format } from "date-fns";

interface MeetingCardProps {
  meeting: {
    id: string;
    groupId: string;
    groupName?: string;
    date: string;
    location?: string;
    attendeeCount?: number;
    totalMembers?: number;
    screenshotUrl?: string;
    notes?: string;
  };
  showActions?: boolean;
  onEdit?: (meetingId: string) => void;
  onDelete?: (meetingId: string) => void;
  onViewScreenshot?: (url: string) => void;
}

export default function MeetingCard({
  meeting,
  showActions = false,
  onEdit,
  onDelete,
  onViewScreenshot,
}: MeetingCardProps) {
  const attendanceRate = meeting.totalMembers
    ? ((meeting.attendeeCount || 0) / meeting.totalMembers) * 100
    : 0;

  const getAttendanceColor = (rate: number) => {
    if (rate >= 80) return "success";
    if (rate >= 60) return "warning";
    return "error";
  };

  return (
    <Card
      hoverable
      className="h-full"
      actions={
        showActions
          ? [
              meeting.screenshotUrl ? (
                <button
                  key="view"
                  onClick={() => onViewScreenshot?.(meeting.screenshotUrl!)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  View Screenshot
                </button>
              ) : null,
              <button
                key="edit"
                onClick={() => onEdit?.(meeting.id)}
                className="text-blue-600 hover:text-blue-800"
              >
                Edit
              </button>,
              <button
                key="delete"
                onClick={() => onDelete?.(meeting.id)}
                className="text-red-600 hover:text-red-800"
              >
                Delete
              </button>,
            ].filter(Boolean)
          : undefined
      }
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <Link
              href={`/leader/meetings/${meeting.id}`}
              className="text-lg font-semibold text-gray-900 hover:text-church-primary"
            >
              {meeting.groupName || "Group Meeting"}
            </Link>
            <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
              <CalendarOutlined />
              <span>{format(new Date(meeting.date), "MMM dd, yyyy")}</span>
            </div>
          </div>
          {meeting.totalMembers && (
            <Tag color={getAttendanceColor(attendanceRate)}>
              {attendanceRate.toFixed(0)}%
            </Tag>
          )}
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <TeamOutlined className="text-church-primary" />
            <span>
              {meeting.attendeeCount || 0}
              {meeting.totalMembers && ` / ${meeting.totalMembers}`} attended
            </span>
          </div>

          {meeting.location && (
            <div className="text-gray-600">
              <span className="font-medium">Location:</span> {meeting.location}
            </div>
          )}

          {meeting.screenshotUrl && (
            <div className="flex items-center gap-2 text-blue-600">
              <FileImageOutlined />
              <span>Screenshot available</span>
            </div>
          )}

          {meeting.notes && (
            <p className="text-gray-600 text-xs line-clamp-2 mt-2">
              {meeting.notes}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
