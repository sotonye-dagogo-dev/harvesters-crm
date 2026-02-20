"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import DashboardLayout from "@/components/features/navigation/DashboardLayout";
import { Descriptions, Spin, message } from "antd";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { EditOutlined } from "@ant-design/icons";
import ProfileAvatar from "@/components/features/users/ProfileAvatar";
import { useRouter } from "next/navigation";
import { UserRole } from "@/lib/types";

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<User | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;

      try {
        const response = await fetch(`/api/users/${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setProfile(data.data);
        }
      } catch {
        message.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user?.id]);

  if (loading) {
    return (
      <DashboardLayout role={user?.role || UserRole.MEMBER}>
        <div className="flex items-center justify-center h-96">
          <Spin size="large" />
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout role={user?.role || UserRole.MEMBER}>
        <div className="text-center py-12">
          <p className="text-ds-text-subtle">Profile not found</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role={user?.role || UserRole.MEMBER}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-ds-text-primary">
            My Profile
          </h2>
          <Button
            icon={<EditOutlined />}
            onClick={() => router.push("/member/profile/edit")}
          >
            Edit Profile
          </Button>
        </div>

        <Card className="max-w-4xl bg-ds-surface-elevated">
          <div className="flex items-start gap-6 mb-6">
            <ProfileAvatar
              firstName={profile.firstName}
              lastName={profile.lastName}
              avatarUrl={profile.avatar}
              size={80}
            />
            <div>
              <h3 className="text-xl font-semibold text-ds-text-primary">
                {profile.firstName} {profile.lastName}
              </h3>
              <p className="text-ds-text-secondary">
                {profile.email}
              </p>
              <div className="mt-2">
                <span
                  className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                    profile.role === "SUPERADMIN"
                      ? "bg-ds-status-error/10 text-ds-status-error dark:bg-red-900/30 dark:text-ds-status-error"
                      : profile.role === UserRole.SMALL_GROUP_LEADER
                        ? "bg-ds-chart-1/10 text-ds-chart-1 dark:bg-blue-900/30 dark:text-ds-chart-1"
                        : "bg-ds-status-success/10 text-ds-status-success dark:bg-green-900/30 dark:text-ds-status-success"
                  }`}
                >
                  {profile.role}
                </span>
              </div>
            </div>
          </div>

          <Descriptions
            column={1}
            bordered
            className="[&_.ant-descriptions-item-label]:bg-ds-surface-sunken [&_.ant-descriptions-item-label]:text-ds-text-primary [&_.ant-descriptions-item-content]:bg-ds-surface-elevated [&_.ant-descriptions-item-content]:text-ds-text-primary"
          >
            <Descriptions.Item label="Phone">
              {profile.phone || "Not provided"}
            </Descriptions.Item>
            <Descriptions.Item label="WhatsApp Phone">
              {profile.whatsappPhone || "Not provided"}
            </Descriptions.Item>
            <Descriptions.Item label="Age">
              {profile.age || "Not provided"}
            </Descriptions.Item>
            <Descriptions.Item label="Location">
              {profile.location || "Not provided"}
            </Descriptions.Item>
            <Descriptions.Item label="Marital Status">
              {profile.maritalStatus || "Not provided"}
            </Descriptions.Item>
            <Descriptions.Item label="Employment Status">
              {profile.employmentStatus || "Not provided"}
            </Descriptions.Item>
            <Descriptions.Item label="Interests">
              {profile.interests && profile.interests.length > 0
                ? profile.interests.join(", ")
                : "Not provided"}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </div>
    </DashboardLayout>
  );
}
