import { Card } from "antd";
import { MailOutlined, PhoneOutlined } from "@ant-design/icons";
import Link from "next/link";

interface UserCardProps {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    role: "SUPERADMIN" | "LEADER" | "MEMBER";
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
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "SUPERADMIN":
        return "bg-red-100 text-red-800";
      case "LEADER":
        return "bg-blue-100 text-blue-800";
      case "MEMBER":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
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
                className="text-blue-600 hover:text-blue-800"
              >
                Edit
              </button>,
              onAssignGroup && (
                <button
                  key="assign"
                  onClick={() => onAssignGroup(user.id)}
                  className="text-green-600 hover:text-green-800"
                >
                  Assign Group
                </button>
              ),
              <button
                key="deactivate"
                onClick={() => onDeactivate?.(user.id)}
                className="text-red-600 hover:text-red-800"
              >
                {user.isActive ? "Deactivate" : "Activate"}
              </button>,
            ].filter(Boolean)
          : undefined
      }
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-church-primary text-white rounded-full flex items-center justify-center text-lg font-semibold">
            {user.firstName[0]}
            {user.lastName[0]}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <Link
            href={`/users/${user.id}`}
            className="text-lg font-semibold text-gray-900 hover:text-church-primary"
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
          <div className="mt-3 space-y-1 text-sm text-gray-600">
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
