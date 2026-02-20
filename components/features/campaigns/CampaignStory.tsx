"use client";

import { Avatar, Badge } from "antd";
import { PlayCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";

interface CampaignStoryProps {
  campaign: Campaign;
  createdBy?: {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  onClick?: (campaign: Campaign) => void;
  size?: "small" | "default" | "large";
}

export default function CampaignStory({
  campaign,
  createdBy,
  onClick,
  size = "default",
}: CampaignStoryProps) {
  // Calculate time remaining (campaigns last 24 hours)
  const createdAt = new Date(campaign.createdAt);
  const expiresAt = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);
  const now = new Date();
  const isExpired = now > expiresAt;
  const hoursElapsed = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
  const progressPercent = Math.min((hoursElapsed / 24) * 100, 100);

  // Size configurations
  const sizeConfig = {
    small: {
      avatarSize: 64,
      containerClass: "w-20",
      nameClass: "text-xs",
    },
    default: {
      avatarSize: 80,
      containerClass: "w-24",
      nameClass: "text-sm",
    },
    large: {
      avatarSize: 100,
      containerClass: "w-28",
      nameClass: "text-base",
    },
  };

  const config = sizeConfig[size];

  // Get avatar content
  const getAvatarContent = () => {
    if (campaign.thumbnailUrl || campaign.mediaUrl) {
      return (
        <div className="relative w-full h-full">
          <Image
            src={campaign.thumbnailUrl || campaign.mediaUrl || ""}
            alt={campaign.title}
            fill
            className="object-cover"
          />
          {campaign.mediaType === "VIDEO" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <PlayCircleOutlined className="text-2xl text-white drop-shadow-lg" />
            </div>
          )}
        </div>
      );
    }

    // Gradient background for text-only campaigns
    return (
      <div className="w-full h-full bg-gradient-to-br from-ds-brand-accent via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl">
        {campaign.title.charAt(0)}
      </div>
    );
  };

  return (
    <div
      className={`${config.containerClass} cursor-pointer group`}
      onClick={() => onClick?.(campaign)}
    >
      <div className="flex flex-col items-center gap-2">
        {/* Story Avatar with Ring */}
        <div className="relative">
          {/* Gradient Ring */}
          <div
            className={`absolute -inset-1 rounded-full bg-gradient-to-tr ${
              isExpired
                ? "from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700"
                : campaign.status === "ACTIVE"
                  ? "from-ds-brand-accent via-purple-500 to-pink-500"
                  : "from-yellow-400 to-orange-500"
            } p-0.5 transition-all duration-300 group-hover:scale-110`}
            style={{
              background: isExpired
                ? undefined
                : `conic-gradient(
                    from 0deg,
                    rgb(99 102 241) 0%,
                    rgb(168 85 247) ${progressPercent}%,
                    rgb(209 213 219) ${progressPercent}%,
                    rgb(209 213 219) 100%
                  )`,
            }}
          />

          {/* Avatar */}
          <div className="relative bg-ds-surface-elevated rounded-full p-1">
            <Avatar
              size={config.avatarSize}
              className="border-2 border-ds-surface-elevated dark:border-ds-surface-elevated"
              src={getAvatarContent()}
            >
              {campaign.title.charAt(0)}
            </Avatar>
          </div>

          {/* Status Badge */}
          {!isExpired && campaign.status === "ACTIVE" && (
            <Badge
              count="Live"
              className="absolute bottom-0 right-0 [&_.ant-badge-count]:text-xs [&_.ant-badge-count]:px-2 [&_.ant-badge-count]:bg-ds-status-success/50"
            />
          )}

          {isExpired && (
            <div className="absolute bottom-0 right-0 w-6 h-6 bg-ds-text-subtle dark:bg-ds-text-subtle rounded-full flex items-center justify-center border-2 border-ds-surface-elevated dark:border-ds-surface-elevated">
              <ClockCircleOutlined className="text-xs text-white" />
            </div>
          )}
        </div>

        {/* Campaign Title/Creator Name */}
        <div className="text-center max-w-full">
          <p
            className={`${config.nameClass} font-medium truncate text-ds-text-secondary group-hover:text-ds-brand-accent dark:group-hover:text-ds-brand-accent transition-colors`}
          >
            {createdBy
              ? `${createdBy.firstName} ${createdBy.lastName}`
              : campaign.title}
          </p>
          {!isExpired && (
            <p className="text-xs text-ds-text-subtle">
              {formatDistanceToNow(createdAt, { addSuffix: true })}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
