"use client";

import { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import DashboardLayout from "@/components/features/navigation/DashboardLayout";
import { Form, message } from "antd";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { SaveOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { PasswordInput } from "@/components/ui/Input";
import { UserRole } from "@/lib/types";

export default function ChangePasswordPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (values: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error("New passwords do not match");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        }),
      });

      if (response.ok) {
        message.success("Password changed successfully");
        form.resetFields();
        router.push("/member/profile");
      } else {
        const error = await response.json();
        message.error(error.error || "Failed to change password");
      }
    } catch {
      message.error("An error occurred while changing password");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout role={user?.role || UserRole.MEMBER}>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-ds-text-primary">Change Password</h2>
          <p className="text-ds-text-secondary mt-1">
            Update your password to keep your account secure
          </p>
        </div>

        <Card className="max-w-xl">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            disabled={saving}
          >
            <Form.Item
              label="Current Password"
              name="currentPassword"
              rules={[
                {
                  required: true,
                  message: "Please enter your current password",
                },
              ]}
            >
              <PasswordInput placeholder="Enter current password" />
            </Form.Item>

            <Form.Item
              label="New Password"
              name="newPassword"
              rules={[
                { required: true, message: "Please enter a new password" },
                { min: 8, message: "Password must be at least 8 characters" },
              ]}
            >
              <PasswordInput placeholder="Enter new password" />
            </Form.Item>

            <Form.Item
              label="Confirm New Password"
              name="confirmPassword"
              rules={[
                { required: true, message: "Please confirm your new password" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("newPassword") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("The two passwords do not match")
                    );
                  },
                }),
              ]}
            >
              <PasswordInput placeholder="Confirm new password" />
            </Form.Item>

            <div className="flex gap-3 justify-end mt-6">
              <Button variant="secondary" onClick={() => router.push("/member/profile")}>
                Cancel
              </Button>
              <Button
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={saving}
              >
                Change Password
              </Button>
            </div>
          </Form>
        </Card>
      </div>
    </DashboardLayout>
  );
}
