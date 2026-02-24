"use client";

import { CampaignMediaType } from "@/lib/types";
import { Tag, Tooltip } from "antd";
import Card from "@/components/ui/Card";
import StatusBadge from "@/components/ui/StatusBadge";
import {
  EyeOutlined,
  PlayCircleOutlined,
  FileImageOutlined,
  ShareAltOutlined,
  HeartOutlined,
  MessageOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";

interface CampaignCardProps {
  campaign: Campaign;
  showStats?: boolean;
  onView?: (campaign: Campaign) => void;
}

export default function CampaignCard({
  campaign,
  showStats = true,
  onView,
}: CampaignCardProps) {
  // Calculate time remaining (campaigns last 24 hours)
  const createdAt = new Date(campaign.createdAt);
  const expiresAt = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);
  const now = new Date();
  const isExpired = now > expiresAt;
  const timeRemaining = isExpired
    ? "Expired"
    : formatDistanceToNow(expiresAt, { addSuffix: true });

  // Get media type icon
  const getMediaIcon = (mediaType: CampaignMediaType) => {
    switch (mediaType) {
      case "VIDEO":
        return <PlayCircleOutlined className="text-xl" />;
      case "IMAGE":
        return <FileImageOutlined className="text-xl" />;
      case "TEXT":
        return <MessageOutlined className="text-xl" />;
      default:
        return null;
    }
  };

  // Render thumbnail based on media type
  const renderThumbnail = () => {
    if (campaign.mediaType === "IMAGE" && campaign.mediaUrl) {
      return (
        <div className="relative w-full h-48 bg-gradient-to-br from-ds-brand-accent-subtle to-purple-100 dark:from-ds-brand-accent dark:to-purple-900">
          <Image
            src={campaign.mediaUrl}
            alt={campaign.title}
            fill
            className="object-cover"
          />
        </div>
      );
    }

    if (campaign.mediaType === "VIDEO" && campaign.thumbnailUrl) {
      return (
        <div className="relative w-full h-48 bg-gradient-to-br from-ds-brand-accent-subtle to-purple-100 dark:from-ds-brand-accent dark:to-purple-900">
          <Image
            src={campaign.thumbnailUrl}
            alt={campaign.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <PlayCircleOutlined className="text-6xl text-white drop-shadow-lg" />
          </div>
        </div>
      );
    }

    // Default gradient for text-only campaigns
    return (
      <div className="relative w-full h-48 bg-gradient-to-br from-ds-brand-accent via-purple-500 to-pink-500 flex items-center justify-center">
        <div className="text-center text-white p-6">
          <ShareAltOutlined className="text-5xl mb-4" />
          <p className="text-lg font-semibold">{campaign.title}</p>
        </div>
      </div>
    );
  };

  return (
    <Card
      hoverable
      className="overflow-hidden shadow-md hover:shadow-ds-xl transition-all duration-300"
      cover={renderThumbnail()}
      onClick={() => onView?.(campaign)}
      actions={
        showStats
          ? [
              <Tooltip title="Views" key="views">
                <div className="flex items-center justify-center gap-1">
                  <EyeOutlined />
                  <span>{campaign.viewCount || 0}</span>
                </div>
              </Tooltip>,
              <Tooltip title="Likes" key="likes">
                <div className="flex items-center justify-center gap-1">
                  <HeartOutlined />
                  <span>{campaign.likeCount || 0}</span>
                </div>
              </Tooltip>,
              <Tooltip title="Shares" key="shares">
                <div className="flex items-center justify-center gap-1">
                  <ShareAltOutlined />
                  <span>{campaign.shareCount || 0}</span>
                </div>
              </Tooltip>,
            ]
          : undefined
      }
    >
      <Card.Meta
        title={
          <div className="flex items-start justify-between gap-2">
            <span className="line-clamp-1">{campaign.title}</span>
            <StatusBadge status={campaign.status} category="campaign" />
          </div>
        }
        description={
          <div className="space-y-2">
            <p className="line-clamp-2 text-ds-text-secondary">
              {campaign.description}
            </p>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                {campaign.mediaType && getMediaIcon(campaign.mediaType)}
                <span className="text-ds-text-subtle">
                  {campaign.mediaType || "TEXT"}
                </span>
              </div>

              <div className="flex items-center gap-1 text-ds-text-subtle">
                <ClockCircleOutlined />
                <span className={isExpired ? "text-ds-status-error" : ""}>
                  {timeRemaining}
                </span>
              </div>
            </div>

            {campaign.targetAudience && campaign.targetAudience.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {campaign.targetAudience.map((audience) => (
                  <Tag key={audience} color="blue">
                    {audience}
                  </Tag>
                ))}
              </div>
            )}
          </div>
        }
      />
    </Card>
  );
}
