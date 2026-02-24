import { UserRole } from "@/lib/types";
import Card from "@/components/ui/Card";
import { MailOutlined, PhoneOutlined } from "@ant-design/icons";
import Link from "next/link";

interface UserCardProps {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    role: UserRole;
    isActive?: boolean;
  };
  showActions?: boolean;
  onEdit?: (userId: string) => void;
  onDeactivate?: (userId: string) => void;
  onAssignGroup?: (userId: string) => void;
}

export default function UserCard({
  user,
  showActions = false,
  onEdit,
  onDeactivate,
  onAssignGroup,
}: UserCardProps) {
  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPERADMIN:
        return "bg-ds-status-error/10 text-ds-status-error";
      case UserRole.ZONAL_LEADER:
        return "bg-ds-chart-3/10 text-purple-800";
      case UserRole.CAMPUS_ADMIN:
        return "bg-ds-brand-accent-subtle text-ds-brand-accent";
      case UserRole.HOD:
        return "bg-ds-chart-1/10 text-ds-chart-1";
      case UserRole.SMALL_GROUP_LEADER:
        return "bg-cyan-100 text-cyan-800";
      case UserRole.CELL_LEADER:
        return "bg-teal-100 text-teal-800";
      case UserRole.MEMBER:
        return "bg-ds-status-success/10 text-ds-status-success";
      default:
        return "bg-ds-surface-sunken text-ds-text-primary";
    }
  };

  return (
    <Card
      hoverable
      className="h-full"
      actions={
        showActions
          ? [
              <button
                key="edit"
                onClick={() => onEdit?.(user.id)}
                className="text-ds-chart-1 hover:text-ds-chart-1"
              >
                Edit
              </button>,
              onAssignGroup && (
                <button
                  key="assign"
                  onClick={() => onAssignGroup(user.id)}
                  className="text-ds-status-success hover:text-ds-status-success"
                >
                  Assign Group
                </button>
              ),
              <button
                key="deactivate"
                onClick={() => onDeactivate?.(user.id)}
                className="text-ds-status-error hover:text-ds-status-error"
              >
                {user.isActive ? "Deactivate" : "Activate"}
              </button>,
            ].filter(Boolean)
          : undefined
      }
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-ds-brand-accent text-white rounded-full flex items-center justify-center text-lg font-semibold">
            {user.firstName[0]}
            {user.lastName[0]}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <Link
            href={`/users/${user.id}`}
            className="text-lg font-semibold text-ds-text-primary hover:text-ds-brand-accent"
          >
            {user.firstName} {user.lastName}
          </Link>
          <div className="mt-1">
            <span
              className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(user.role)}`}
            >
              {user.role}
            </span>
          </div>
          <div className="mt-3 space-y-1 text-sm text-ds-text-secondary">
            <div className="flex items-center gap-2">
              <MailOutlined />
              <span className="truncate">{user.email}</span>
            </div>
            {user.phone && (
              <div className="flex items-center gap-2">
                <PhoneOutlined />
                <span>{user.phone}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
