"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import DashboardLayout from "@/components/features/navigation/DashboardLayout";
import {
  Card,
  Descriptions,
  Spin,
  Button as AntButton,
  message,
  Tag,
} from "antd";
import { EditOutlined, LockOutlined } from "@ant-design/icons";
import ProfileAvatar from "@/components/features/users/ProfileAvatar";
import { useRouter } from "next/navigation";
import { UserRole } from "@/lib/types";

export default function LeaderProfilePage() {
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
        } else {
          message.error("Failed to load profile");
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
      <DashboardLayout role={UserRole.SMALL_GROUP_LEADER}>
        <div className="flex items-center justify-center h-96">
          <Spin size="large" />
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout role={UserRole.SMALL_GROUP_LEADER}>
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Profile not found</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role={UserRole.SMALL_GROUP_LEADER}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            My Profile
          </h2>
          <div className="flex gap-3">
            <AntButton
              icon={<LockOutlined />}
              onClick={() => router.push("/profile/change-password")}
            >
              Change Password
            </AntButton>
            <AntButton
              type="primary"
              icon={<EditOutlined />}
              onClick={() => router.push("/profile/edit")}
            >
              Edit Profile
            </AntButton>
          </div>
        </div>

        <Card className="max-w-4xl bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100">
          <div className="flex items-start gap-6 mb-6">
            <ProfileAvatar
              firstName={profile.firstName}
              lastName={profile.lastName}
              avatarUrl={profile.avatar}
              size={80}
            />
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {profile.firstName} {profile.lastName}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {profile.email}
              </p>
              <div className="mt-2">
                <Tag color="blue">Group Leader</Tag>
              </div>
            </div>
          </div>

          <Descriptions
            column={1}
            bordered
            className="[&_.ant-descriptions-item-label]:bg-gray-50 dark:[&_.ant-descriptions-item-label]:bg-slate-700 [&_.ant-descriptions-item-label]:text-gray-900 dark:[&_.ant-descriptions-item-label]:text-white [&_.ant-descriptions-item-content]:bg-white dark:[&_.ant-descriptions-item-content]:bg-slate-800 [&_.ant-descriptions-item-content]:text-gray-900 dark:[&_.ant-descriptions-item-content]:text-gray-200"
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
