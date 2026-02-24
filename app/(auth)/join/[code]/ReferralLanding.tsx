"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Typography, Spin, Tag, Divider, Result } from "antd";
import Button from "@/components/ui/Button";
import {
  TeamOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { InviteLinkType, UserRole } from "@/lib/types";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const { Title, Text, Paragraph } = Typography;

interface InviteLinkData {
  id: string;
  code: string;
  createdById: string;
  type: InviteLinkType;
  targetId: string;
  assignRole?: UserRole;
  expiresAt?: string;
  maxUses?: number;
  isActive: boolean;
  visitCount: number;
  conversionCount: number;
}

const TYPE_LABELS: Record<string, string> = {
  CAMPUS: "Campus",
  ZONE: "Zone",
  DEPARTMENT: "Department",
  SMALL_GROUP: "Small Group",
  CELL: "Cell",
  MEETING: "Meeting",
  CAMPAIGN: "Campaign",
};

const ROLE_LABELS: Record<string, string> = {
  SUPERADMIN: "Super Admin",
  GROUP_PASTOR: "Group Pastor",
  GROUP_ADMIN: "Group Admin",
  CAMPUS_PASTOR: "Campus Pastor",
  CAMPUS_ADMIN: "Campus Admin",
  ZONAL_LEADER: "Zonal Leader",
  HOD: "Head of Department",
  SMALL_GROUP_LEADER: "Small Group Leader",
  CELL_LEADER: "Cell Leader",
  DATA_ENTRY: "Data Entry",
  MEMBER: "Member",
};

interface ReferralLandingProps {
  code: string;
}

export default function ReferralLanding({ code }: ReferralLandingProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [linkData, setLinkData] = useState<InviteLinkData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const validateLink = async () => {
      try {
        const response = await fetch(`/api/invite-links/${code}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Invalid or expired referral link");
          return;
        }

        setLinkData(data.data);
      } catch {
        setError("Failed to validate referral link. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    validateLink();
  }, [code]);

  const handleAcceptInvite = () => {
    // Navigate to register page with referral code
    const params = new URLSearchParams({
      referralCode: code,
    });

    if (linkData?.assignRole) {
      params.set("assignedRole", linkData.assignRole);
    }
    if (linkData?.type) {
      params.set("linkType", linkData.type);
    }

    router.push(`/register?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ds-surface-base">
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        <Spin size="large" tip="Validating referral link…" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ds-surface-base p-4">
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        <Card className="max-w-md w-full shadow-lg">
          <Result
            status="error"
            icon={<CloseCircleOutlined className="text-ds-status-error" />}
            title="Invalid Referral Link"
            subTitle={error}
            extra={[
              <Button key="register" onClick={() => router.push("/register")}>
                Register Without Referral
              </Button>,
              <Button
                key="login"
                variant="secondary"
                onClick={() => router.push("/login")}
              >
                Login Instead
              </Button>,
            ]}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ds-surface-base p-4">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <Card className="max-w-lg w-full shadow-lg">
        <div className="flex flex-col items-center text-center gap-4">
          {/* Icon */}
          <div className="w-16 h-16 rounded-full bg-ds-accent-primary/10 flex items-center justify-center">
            <TeamOutlined className="text-3xl text-ds-accent-primary" />
          </div>

          {/* Title */}
          <div>
            <Title level={3} className="!mb-1">
              You&apos;ve Been Invited!
            </Title>
            <Paragraph className="text-ds-text-subtle">
              Someone from Harvesters International Christian Centre has invited
              you to join the Small Groups CRM platform.
            </Paragraph>
          </div>

          <Divider className="my-0" />

          {/* Invite details */}
          <div className="flex flex-col gap-3 w-full text-left">
            <div className="flex justify-between items-center">
              <Text className="text-ds-text-subtle">Invitation Type</Text>
              <Tag color="blue">
                {TYPE_LABELS[linkData?.type || ""] || linkData?.type}
              </Tag>
            </div>

            {linkData?.assignRole && (
              <div className="flex justify-between items-center">
                <Text className="text-ds-text-subtle">Assigned Role</Text>
                <Tag color="green">
                  {ROLE_LABELS[linkData.assignRole] || linkData.assignRole}
                </Tag>
              </div>
            )}

            {linkData?.expiresAt && (
              <div className="flex justify-between items-center">
                <Text className="text-ds-text-subtle">Expires</Text>
                <Text>{new Date(linkData.expiresAt).toLocaleDateString()}</Text>
              </div>
            )}
          </div>

          <Divider className="my-0" />

          {/* Actions */}
          <div className="flex flex-col gap-3 w-full">
            <Button
              icon={<UserAddOutlined />}
              onClick={handleAcceptInvite}
              size="large"
              className="w-full"
            >
              Accept Invitation & Register
            </Button>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => router.push("/login")}
                className="flex-1"
              >
                Already Have an Account? Login
              </Button>
            </div>
          </div>

          {/* Trust indicator */}
          <div className="flex items-center gap-1.5 text-xs text-ds-text-subtle mt-2">
            <CheckCircleOutlined className="text-ds-status-success" />
            <span>Verified referral link from Harvesters Church</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
