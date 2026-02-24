"use client";

import { useAuth } from "@/providers/AuthProvider";
import DashboardLayout from "@/components/features/navigation/DashboardLayout";
import ReferralLinkManager from "@/components/features/auth/ReferralLinkManager";
import { Typography } from "antd";

const { Title, Paragraph } = Typography;

export default function SuperadminReferralsPage() {
  const { user } = useAuth();
  const role = user?.role;

  return (
    <DashboardLayout role={role}>
      <div className="flex flex-col gap-6 max-w-6xl mx-auto">
        <div>
          <Title level={3} className="!mb-1">
            Referral Link Management
          </Title>
          <Paragraph className="text-ds-text-subtle !mb-0">
            Generate and manage referral links to invite users with pre-assigned
            roles. Share links directly or copy them to distribute. Links can be
            single-use or multi-use, and automatically deactivate when
            exhausted.
          </Paragraph>
        </div>

        <ReferralLinkManager canCreate />
      </div>
    </DashboardLayout>
  );
}
