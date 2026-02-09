"use client";

import { UserRole, CampaignStatus } from "@/lib/types";
import { Tag, Button, Avatar, Tooltip, Progress } from "antd";
import {
  EyeOutlined,
  HeartOutlined,
  ShareAltOutlined,
  ClockCircleOutlined,
  UserOutlined,
  GlobalOutlined,
  BankOutlined,
  ApartmentOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import Image from "next/image";
import { formatDistanceToNow, format } from "date-fns";

interface CampaignBannerProps {
  campaign: Campaign;
  createdBy?: {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
    role?: UserRole;
  };
  zone?: { id: string; name: string };
  campus?: { id: string; name: string };
  department?: { id: string; name: string };
  group?: { id: string; name: string };
  showActions?: boolean;
  onLike?: () => void;
  onShare?: () => void;
  onView?: () => void;
}

export default function CampaignBanner({
  campaign,
  createdBy,
  zone,
  campus,
  department,
  group,
  showActions = true,
  onLike,
  onShare,
}: CampaignBannerProps) {
  // Calculate time remaining (campaigns last 24 hours)
  const createdAt = new Date(campaign.createdAt);
  const expiresAt = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);
  const now = new Date();
  const isExpired = now > expiresAt;
  const hoursElapsed = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
  const progressPercent = Math.min((hoursElapsed / 24) * 100, 100);
  const hoursRemaining = Math.max(24 - hoursElapsed, 0);

  // Get status color
  const getStatusColor = (status: CampaignStatus) => {
    switch (status) {
      case "ACTIVE":
        return "success";
      case "DRAFT":
        return "processing";
      case "EXPIRED":
        return "default";
      case "ARCHIVED":
        return "warning";
      default:
        return "default";
    }
  };

  // Render media
  const renderMedia = () => {
    if (campaign.mediaType === "IMAGE" && campaign.mediaUrl) {
      return (
        <div className="relative w-full h-96 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900">
          <Image
            src={campaign.mediaUrl}
            alt={campaign.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      );
    }

    if (campaign.mediaType === "VIDEO" && campaign.mediaUrl) {
      return (
        <div className="relative w-full h-96 bg-black">
          <video
            src={campaign.mediaUrl}
            controls
            className="w-full h-full object-contain"
            poster={campaign.thumbnailUrl}
          />
        </div>
      );
    }

    // Gradient background for text-only campaigns
    return (
      <div className="relative w-full h-96 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white p-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">{campaign.title}</h1>
          <p className="text-xl opacity-90">{campaign.description}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {createdBy && (
              <Avatar
                size={48}
                src={createdBy.profilePicture}
                icon={<UserOutlined />}
                className="bg-indigo-500"
              >
                {createdBy.firstName.charAt(0)}
                {createdBy.lastName.charAt(0)}
              </Avatar>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {createdBy
                    ? `${createdBy.firstName} ${createdBy.lastName}`
                    : "Church Campaign"}
                </h3>
                <Tag color={getStatusColor(campaign.status)}>
                  {campaign.status}
                </Tag>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <span>
                  {formatDistanceToNow(createdAt, { addSuffix: true })}
                </span>
                <span>•</span>
                <span>{format(createdAt, "MMM d, yyyy HH:mm")}</span>
              </div>
            </div>
          </div>

          {/* Organizational Context */}
          <div className="hidden md:flex items-center gap-2">
            {zone && (
              <Tooltip title={`Zone: ${zone.name}`}>
                <Tag icon={<GlobalOutlined />} color="blue">
                  {zone.name}
                </Tag>
              </Tooltip>
            )}
            {campus && (
              <Tooltip title={`Campus: ${campus.name}`}>
                <Tag icon={<BankOutlined />} color="green">
                  {campus.name}
                </Tag>
              </Tooltip>
            )}
            {department && (
              <Tooltip title={`Department: ${department.name}`}>
                <Tag icon={<ApartmentOutlined />} color="purple">
                  {department.name}
                </Tag>
              </Tooltip>
            )}
            {group && (
              <Tooltip title={`Group: ${group.name}`}>
                <Tag icon={<TeamOutlined />} color="orange">
                  {group.name}
                </Tag>
              </Tooltip>
            )}
          </div>
        </div>

        {/* Time Progress Bar */}
        {!isExpired && campaign.status === "ACTIVE" && (
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <ClockCircleOutlined />
                {hoursRemaining.toFixed(1)} hours remaining
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {progressPercent.toFixed(0)}%
              </span>
            </div>
            <Progress
              percent={progressPercent}
              strokeColor={{
                "0%": "#6366f1",
                "50%": "#a855f7",
                "100%": "#ec4899",
              }}
              showInfo={false}
              size="small"
            />
          </div>
        )}
      </div>

      {/* Media Content */}
      {renderMedia()}

      {/* Campaign Details */}
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
          {campaign.title}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          {campaign.description}
        </p>

        {/* Call to Action */}
        {campaign.ctaText && campaign.ctaUrl && (
          <Button
            type="primary"
            size="large"
            href={campaign.ctaUrl}
            target="_blank"
            className="mt-4"
          >
            {campaign.ctaText}
          </Button>
        )}

        {/* Target Audience */}
        {campaign.targetAudience && campaign.targetAudience.length > 0 && (
          <div className="mb-4">
            <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">
              Target Audience:
            </span>
            {campaign.targetAudience.map((audience) => (
              <Tag key={audience} color="blue">
                {audience}
              </Tag>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-6">
            <Tooltip title="Views">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <EyeOutlined className="text-lg" />
                <span className="font-medium">{campaign.viewCount || 0}</span>
              </div>
            </Tooltip>
            <Tooltip title="Likes">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <HeartOutlined className="text-lg" />
                <span className="font-medium">{campaign.likeCount || 0}</span>
              </div>
            </Tooltip>
            <Tooltip title="Shares">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <ShareAltOutlined className="text-lg" />
                <span className="font-medium">{campaign.shareCount || 0}</span>
              </div>
            </Tooltip>
          </div>

          {/* Action Buttons */}
          {showActions && (
            <div className="flex items-center gap-2">
              <Button
                icon={<HeartOutlined />}
                onClick={onLike}
                className="hover:text-red-500 hover:border-red-500"
              >
                Like
              </Button>
              <Button icon={<ShareAltOutlined />} onClick={onShare}>
                Share
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
