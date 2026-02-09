"use client";

import { useState } from "react";
import { Empty, Spin } from "antd";
import CampaignStory from "./CampaignStory";
import CampaignModal from "./CampaignModal";
import { RightOutlined, LeftOutlined } from "@ant-design/icons";

interface CampaignListProps {
  campaigns: Campaign[];
  loading?: boolean;
  viewType?: "story" | "grid";
  showCreator?: boolean;
  onCampaignView?: (campaign: Campaign) => void;
}

export default function CampaignList({
  campaigns,
  loading = false,
  viewType = "story",
  onCampaignView,
}: CampaignListProps) {
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);

  const handleCampaignClick = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setModalOpen(true);
    onCampaignView?.(campaign);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setTimeout(() => setSelectedCampaign(null), 300);
  };

  const handleScroll = (direction: "left" | "right") => {
    const container = document.getElementById("campaign-story-container");
    if (!container) return;

    const scrollAmount = 300;
    const newPosition =
      direction === "left"
        ? scrollPosition - scrollAmount
        : scrollPosition + scrollAmount;

    container.scrollTo({
      left: newPosition,
      behavior: "smooth",
    });
    setScrollPosition(newPosition);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spin size="large" />
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <Empty
        description="No campaigns available"
        className="py-12"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  // Story view (horizontal scrolling like Instagram stories)
  if (viewType === "story") {
    return (
      <>
        <div className="relative">
          {/* Scroll Left Button */}
          {scrollPosition > 0 && (
            <button
              onClick={() => handleScroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Scroll left"
            >
              <LeftOutlined />
            </button>
          )}

          {/* Story Container */}
          <div
            id="campaign-story-container"
            className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide scroll-smooth"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {campaigns.map((campaign) => (
              <CampaignStory
                key={campaign.id}
                campaign={campaign}
                onClick={handleCampaignClick}
                size="default"
              />
            ))}
          </div>

          {/* Scroll Right Button */}
          <button
            onClick={() => handleScroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Scroll right"
          >
            <RightOutlined />
          </button>
        </div>

        {/* Campaign Modal */}
        <CampaignModal
          campaign={selectedCampaign}
          campaigns={campaigns}
          open={modalOpen}
          onClose={handleModalClose}
          showNavigation={true}
        />

        <style jsx global>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </>
    );
  }

  // Grid view (for campaign cards)
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {campaigns.map((campaign) => (
          <div
            key={campaign.id}
            onClick={() => handleCampaignClick(campaign)}
            className="cursor-pointer"
          >
            <CampaignStory
              campaign={campaign}
              onClick={handleCampaignClick}
              size="large"
            />
          </div>
        ))}
      </div>

      {/* Campaign Modal */}
      <CampaignModal
        campaign={selectedCampaign}
        campaigns={campaigns}
        open={modalOpen}
        onClose={handleModalClose}
        showNavigation={true}
      />
    </>
  );
}
