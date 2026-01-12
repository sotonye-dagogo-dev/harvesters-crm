"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import DashboardLayout from "@/components/features/navigation/DashboardLayout";
import { Card, Descriptions, Spin, Button as AntButton, message } from "antd";
import { EditOutlined } from "@ant-design/icons";
import ProfileAvatar from "@/components/features/users/ProfileAvatar";
import { useRouter } from "next/navigation";

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
      } catch (error) {
        message.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user?.id]);

  if (loading) {
    return (
      <DashboardLayout role={user?.role || "MEMBER"}>
        <div className="flex items-center justify-center h-96">
          <Spin size="large" />
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout role={user?.role || "MEMBER"}>
        <div className="text-center py-12">
          <p className="text-gray-500">Profile not found</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role={user?.role || "MEMBER"}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
          <AntButton
            type="primary"
            icon={<EditOutlined />}
            onClick={() => router.push("/profile/edit")}
          >
            Edit Profile
          </AntButton>
        </div>

        <Card className="max-w-4xl">
          <div className="flex items-start gap-6 mb-6">
            <ProfileAvatar
              firstName={profile.firstName}
              lastName={profile.lastName}
              avatarUrl={profile.avatar}
              size={80}
            />
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {profile.firstName} {profile.lastName}
              </h3>
              <p className="text-gray-600">{profile.email}</p>
              <div className="mt-2">
                <span
                  className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                    profile.role === "SUPERADMIN"
                      ? "bg-red-100 text-red-800"
                      : profile.role === "LEADER"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-green-100 text-green-800"
                  }`}
                >
                  {profile.role}
                </span>
              </div>
            </div>
          </div>

          <Descriptions column={1} bordered>
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
