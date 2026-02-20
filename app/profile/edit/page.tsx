"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import DashboardLayout from "@/components/features/navigation/DashboardLayout";
import {
  Form,
  Input as AntInput,
  Select,
  Button as AntButton,
  Card,
  message,
  Spin,
} from "antd";
import { SaveOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import ProfileAvatar from "@/components/features/users/ProfileAvatar";
import MockFileUpload from "@/components/ui/MockFileUpload";
import { UserRole } from "@/lib/types";

export default function EditProfilePage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;

      try {
        const response = await fetch(`/api/users/${user.id}`);
        if (response.ok) {
          const data = await response.json();
          form.setFieldsValue(data.data);
        }
      } catch {
        message.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user?.id, form]);

  const handleSubmit = async (values: UpdateUserInput) => {
    if (!user?.id) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        message.success("Profile updated successfully");
        await refreshUser();
        router.push("/profile");
      } else {
        const error = await response.json();
        message.error(error.error || "Failed to update profile");
      }
    } catch {
      message.error("An error occurred while updating profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role={user?.role || UserRole.MEMBER}>
        <div className="flex items-center justify-center h-96">
          <Spin size="large" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role={user?.role || UserRole.MEMBER}>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-ds-text-primary">
            Edit Profile
          </h2>
          <p className="text-ds-text-secondary mt-1">
            Update your personal information
          </p>
        </div>

        <Card className="max-w-2xl">
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <ProfileAvatar
                firstName={user?.firstName}
                lastName={user?.lastName}
                avatarUrl={user?.avatar}
                size={64}
              />
              <div>
                <p className="text-sm font-medium text-ds-text-secondary">
                  Profile Picture
                </p>
                <p className="text-xs text-ds-text-subtle">
                  Upload a new profile photo
                </p>
              </div>
            </div>
            <Form.Item name="avatar" label="Change Profile Picture">
              <MockFileUpload
                accept="image/*"
                maxSize={2}
                uploadText="Upload Profile Picture"
                listType="picture-card"
              />
            </Form.Item>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            disabled={saving}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                label="First Name"
                name="firstName"
                rules={[
                  { required: true, message: "Please enter your first name" },
                ]}
              >
                <AntInput />
              </Form.Item>

              <Form.Item
                label="Last Name"
                name="lastName"
                rules={[
                  { required: true, message: "Please enter your last name" },
                ]}
              >
                <AntInput />
              </Form.Item>

              <Form.Item
                label="Phone"
                name="phone"
                rules={[
                  { required: true, message: "Please enter your phone number" },
                ]}
              >
                <AntInput />
              </Form.Item>

              <Form.Item label="WhatsApp Phone" name="whatsappPhone">
                <AntInput />
              </Form.Item>

              <Form.Item label="Age" name="age">
                <AntInput type="number" />
              </Form.Item>

              <Form.Item label="Location" name="location">
                <AntInput />
              </Form.Item>

              <Form.Item label="Marital Status" name="maritalStatus">
                <Select>
                  <Select.Option value="SINGLE">Single</Select.Option>
                  <Select.Option value="MARRIED">Married</Select.Option>
                  <Select.Option value="DIVORCED">Divorced</Select.Option>
                  <Select.Option value="WIDOWED">Widowed</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item label="Employment Status" name="employmentStatus">
                <Select>
                  <Select.Option value="EMPLOYED">Employed</Select.Option>
                  <Select.Option value="UNEMPLOYED">Unemployed</Select.Option>
                  <Select.Option value="STUDENT">Student</Select.Option>
                  <Select.Option value="SELF_EMPLOYED">
                    Self Employed
                  </Select.Option>
                  <Select.Option value="RETIRED">Retired</Select.Option>
                </Select>
              </Form.Item>
            </div>

            <Form.Item label="Interests" name="interests">
              <Select
                mode="multiple"
                placeholder="Select your interests"
                options={[
                  { label: "Music", value: "Music" },
                  { label: "Sports", value: "Sports" },
                  { label: "Reading", value: "Reading" },
                  { label: "Technology", value: "Technology" },
                  { label: "Arts", value: "Arts" },
                  { label: "Volunteering", value: "Volunteering" },
                  { label: "Cooking", value: "Cooking" },
                  { label: "Travel", value: "Travel" },
                ]}
              />
            </Form.Item>

            <div className="flex gap-3 justify-end">
              <AntButton onClick={() => router.push("/profile")}>
                Cancel
              </AntButton>
              <AntButton
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={saving}
              >
                Save Changes
              </AntButton>
            </div>
          </Form>
        </Card>
      </div>
    </DashboardLayout>
  );
}
