import Card from "@/components/ui/Card";
import {
  TeamOutlined,
  UserOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import Link from "next/link";

interface GroupCardProps {
  group: {
    id: string;
    name: string;
    description?: string;
    leaderId?: string;
    leaderName?: string;
    memberCount?: number;
    meetingDay?: string;
    meetingFrequency?: string;
    isActive?: boolean;
  };
  /** Route prefix for the group link (e.g. "/superadmin/groups" or "/leader/groups"). Defaults to "/superadmin/groups". */
  routePrefix?: string;
  showActions?: boolean;
  onEdit?: (groupId: string) => void;
  onDelete?: (groupId: string) => void;
}

export default function GroupCard({
  group,
  routePrefix = "/superadmin/groups",
  showActions = false,
  onEdit,
  onDelete,
}: GroupCardProps) {
  return (
    <Card
      hoverable
      className="h-full"
      actions={
        showActions
          ? [
              <button
                key="edit"
                onClick={() => onEdit?.(group.id)}
                className="text-ds-chart-1 hover:text-ds-chart-1"
              >
                Edit
              </button>,
              <button
                key="delete"
                onClick={() => onDelete?.(group.id)}
                className="text-ds-status-error hover:text-ds-status-error"
              >
                Delete
              </button>,
            ]
          : undefined
      }
    >
      <div className="space-y-3">
        <div>
          <Link
            href={`${routePrefix}/${group.id}`}
            className="text-lg font-semibold text-ds-text-primary hover:text-ds-brand-accent"
          >
            {group.name}
          </Link>
          {group.description && (
            <p className="mt-1 text-sm text-ds-text-secondary line-clamp-2">
              {group.description}
            </p>
          )}
        </div>

        <div className="space-y-2 text-sm text-ds-text-secondary">
          {group.leaderName && (
            <div className="flex items-center gap-2">
              <UserOutlined className="text-ds-brand-accent" />
              <span>
                Leader: <span className="font-medium">{group.leaderName}</span>
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <TeamOutlined className="text-ds-brand-accent" />
            <span>
              {group.memberCount || 0} member
              {group.memberCount !== 1 ? "s" : ""}
            </span>
          </div>

          {group.meetingDay && group.meetingFrequency && (
            <div className="flex items-center gap-2">
              <CalendarOutlined className="text-ds-brand-accent" />
              <span>
                {group.meetingFrequency} on {group.meetingDay}
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
