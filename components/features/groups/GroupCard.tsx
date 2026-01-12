import { Card } from "antd";
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
  showActions?: boolean;
  onEdit?: (groupId: string) => void;
  onDelete?: (groupId: string) => void;
}

export default function GroupCard({
  group,
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
                className="text-blue-600 hover:text-blue-800"
              >
                Edit
              </button>,
              <button
                key="delete"
                onClick={() => onDelete?.(group.id)}
                className="text-red-600 hover:text-red-800"
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
            href={`/groups/${group.id}`}
            className="text-lg font-semibold text-gray-900 hover:text-church-primary"
          >
            {group.name}
          </Link>
          {group.description && (
            <p className="mt-1 text-sm text-gray-600 line-clamp-2">
              {group.description}
            </p>
          )}
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          {group.leaderName && (
            <div className="flex items-center gap-2">
              <UserOutlined className="text-church-primary" />
              <span>
                Leader: <span className="font-medium">{group.leaderName}</span>
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <TeamOutlined className="text-church-primary" />
            <span>
              {group.memberCount || 0} member
              {group.memberCount !== 1 ? "s" : ""}
            </span>
          </div>

          {group.meetingDay && group.meetingFrequency && (
            <div className="flex items-center gap-2">
              <CalendarOutlined className="text-church-primary" />
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
