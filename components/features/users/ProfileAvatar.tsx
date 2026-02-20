import { Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";

interface ProfileAvatarProps {
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  size?: number | "small" | "default" | "large";
  className?: string;
}

export default function ProfileAvatar({
  firstName,
  lastName,
  avatarUrl,
  size = "default",
  className = "",
}: ProfileAvatarProps) {
  const getInitials = () => {
    if (!firstName && !lastName) return "?";
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  if (avatarUrl) {
    return (
      <Avatar src={avatarUrl} size={size} className={className} alt="Profile" />
    );
  }

  return (
    <Avatar
      size={size}
      className={`bg-ds-brand-accent ${className}`}
      icon={!firstName && !lastName ? <UserOutlined /> : undefined}
    >
      {getInitials()}
    </Avatar>
  );
}
