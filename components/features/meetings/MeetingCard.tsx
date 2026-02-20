import Card from "@/components/ui/Card";
import StatusBadge from "@/components/ui/StatusBadge";
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
                  className="text-ds-chart-1 hover:text-ds-chart-1"
                >
                  View Screenshot
                </button>
              ) : null,
              <button
                key="edit"
                onClick={() => onEdit?.(meeting.id)}
                className="text-ds-chart-1 hover:text-ds-chart-1"
              >
                Edit
              </button>,
              <button
                key="delete"
                onClick={() => onDelete?.(meeting.id)}
                className="text-ds-status-error hover:text-ds-status-error"
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
              className="text-lg font-semibold text-ds-text-primary hover:text-ds-brand-accent"
            >
              {meeting.groupName || "Group Meeting"}
            </Link>
            <div className="mt-1 flex items-center gap-2 text-sm text-ds-text-secondary">
              <CalendarOutlined />
              <span>{format(new Date(meeting.date), "d MMM yyyy")}</span>
            </div>
          </div>
          {meeting.totalMembers && (
            <StatusBadge
              status={attendanceRate >= 80 ? "present" : attendanceRate >= 60 ? "late" : "absent"}
              category="attendance"
              label={`${attendanceRate.toFixed(0)}%`}
            />
          )}
        </div>

        <div className="space-y-2 text-sm text-ds-text-secondary">
          <div className="flex items-center gap-2">
            <TeamOutlined className="text-ds-brand-accent" />
            <span>
              {meeting.attendeeCount || 0}
              {meeting.totalMembers && ` / ${meeting.totalMembers}`} attended
            </span>
          </div>

          {meeting.location && (
            <div className="text-ds-text-secondary">
              <span className="font-medium">Location:</span> {meeting.location}
            </div>
          )}

          {meeting.screenshotUrl && (
            <div className="flex items-center gap-2 text-ds-chart-1">
              <FileImageOutlined />
              <span>Screenshot available</span>
            </div>
          )}

          {meeting.notes && (
            <p className="text-ds-text-secondary text-xs line-clamp-2 mt-2">
              {meeting.notes}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
