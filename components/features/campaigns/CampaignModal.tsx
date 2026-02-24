"use client";

import Modal from "@/components/ui/Modal";
import { useState, useEffect } from "react";
import CampaignBanner from "./CampaignBanner";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";

interface CampaignModalProps {
  campaign: Campaign | null;
  campaigns?: Campaign[];
  open: boolean;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  showNavigation?: boolean;
}

export default function CampaignModal({
  campaign,
  campaigns = [],
  open,
  onClose,
  onNext,
  onPrevious,
  showNavigation = true,
}: CampaignModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Update current index when campaign changes
  useEffect(() => {
    if (campaign && campaigns.length > 0) {
      const index = campaigns.findIndex((c) => c.id === campaign.id);
      if (index !== -1 && index !== currentIndex) {
        setCurrentIndex(index);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaign?.id, campaigns.length, currentIndex]);

  const handleNext = () => {
    if (currentIndex < campaigns.length - 1) {
      setCurrentIndex(currentIndex + 1);
      onNext?.();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      onPrevious?.();
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;

      if (e.key === "ArrowLeft") {
        handlePrevious();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, currentIndex, campaigns.length]);

  if (!campaign) return null;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width="90%"
      style={{ maxWidth: "900px", top: 20 }}
      className="campaign-modal"
      destroyOnClose
    >
      <div className="relative">
        {/* Navigation Buttons */}
        {showNavigation && campaigns.length > 1 && (
          <>
            {currentIndex > 0 && (
              <button
                onClick={handlePrevious}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 z-10 w-10 h-10 rounded-full bg-ds-surface-elevated shadow-lg flex items-center justify-center hover:bg-ds-surface-sunken transition-colors"
                aria-label="Previous campaign"
              >
                <LeftOutlined />
              </button>
            )}
            {currentIndex < campaigns.length - 1 && (
              <button
                onClick={handleNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 z-10 w-10 h-10 rounded-full bg-ds-surface-elevated shadow-lg flex items-center justify-center hover:bg-ds-surface-sunken transition-colors"
                aria-label="Next campaign"
              >
                <RightOutlined />
              </button>
            )}
          </>
        )}

        {/* Campaign Content */}
        <CampaignBanner campaign={campaigns[currentIndex] || campaign} />

        {/* Progress Indicator */}
        {showNavigation && campaigns.length > 1 && (
          <div className="flex items-center justify-center gap-1 mt-4">
            {campaigns.map((_, index) => (
              <div
                key={index}
                className={`h-1 rounded-full transition-all ${
                  index === currentIndex
                    ? "w-8 bg-ds-brand-accent"
                    : "w-1 bg-ds-border-base dark:bg-ds-border-subtle"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
