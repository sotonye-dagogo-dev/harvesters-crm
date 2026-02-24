"use client";

import { useAuth } from "@/providers/AuthProvider";
import DashboardLayout from "@/components/features/navigation/DashboardLayout";
import ReferralLinkManager from "@/components/features/auth/ReferralLinkManager";
import { Typography } from "antd";

const { Title, Paragraph } = Typography;

export default function LeaderReferralsPage() {
  const { user } = useAuth();
  const role = user?.role;

  return (
    <DashboardLayout role={role}>
      <div className="flex flex-col gap-6 max-w-6xl mx-auto">
        <div>
          <Title level={3} className="!mb-1">
            Referral Links
          </Title>
          <Paragraph className="text-ds-text-subtle !mb-0">
            Create referral links to invite members and leaders to your group.
            You can assign roles based on your permission level.
          </Paragraph>
        </div>

        <ReferralLinkManager canCreate />
      </div>
    </DashboardLayout>
  );
}
