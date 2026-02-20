"use client";

import { UserRole } from "@/lib/types";
import { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import DashboardLayout from "@/components/features/navigation/DashboardLayout";
import {
  Card,
  Switch,
  Button as AntButton,
  message,
  Divider,
  Form,
  Select,
} from "antd";
import {
  BellOutlined,
  SaveOutlined,
  MailOutlined,
  PhoneOutlined,
} from "@ant-design/icons";

interface NotificationPreferences {
  meetingReminders: boolean;
  membershipRequests: boolean;
  roleChanges: boolean;
  newMembers: boolean;
  memberRemoved: boolean;
  followUpReminders: boolean;
  inactiveAlerts: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  reminderTiming: string;
}

export default function PreferencesPage() {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    meetingReminders: true,
    membershipRequests: true,
    roleChanges: true,
    newMembers: true,
    memberRemoved: true,
    followUpReminders: true,
    inactiveAlerts: true,
    emailNotifications: true,
    smsNotifications: false,
    reminderTiming: "24h",
  });

  const handleToggle = (key: keyof NotificationPreferences, value: boolean) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleReminderTimingChange = (value: string) => {
    setPreferences((prev) => ({
      ...prev,
      reminderTiming: value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Mock API call - in production, would save to backend
      await new Promise((resolve) => setTimeout(resolve, 1000));
      message.success("Notification preferences saved successfully");
    } catch {
      message.error("Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout role={user?.role || UserRole.MEMBER}>
      <div className="space-y-8">
        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-slate-800 dark:to-slate-900 p-6 rounded-2xl shadow-lg border border-ds-border-base">
          <h2 className="text-3xl font-bold text-ds-text-primary flex items-center gap-3">
            <div className="w-12 h-12 bg-ds-status-success/10 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <BellOutlined className="text-2xl text-ds-status-success" />
            </div>
            Notification Preferences
          </h2>
          <p className="text-ds-text-secondary mt-3 text-lg">
            Manage your notification preferences and how you receive updates
          </p>
        </div>

        <Card
          title={
            <div className="flex items-center gap-3 text-lg">
              <BellOutlined className="text-xl" />
              In-App Notifications
            </div>
          }
          className="max-w-4xl shadow-ds-xl"
        >
          <div className="space-y-1">
            <div className="flex items-center justify-between py-4 px-4 rounded-xl hover:bg-ds-surface-sunken transition-all duration-200">
              <div className="flex-1">
                <div className="font-semibold text-ds-text-primary text-base">
                  Meeting Reminders
                </div>
                <div className="text-sm text-ds-text-secondary mt-1">
                  Get notified about upcoming meetings
                </div>
              </div>
              <Switch
                checked={preferences.meetingReminders}
                onChange={(checked) =>
                  handleToggle("meetingReminders", checked)
                }
                className="ml-4"
              />
            </div>

            <Divider className="my-2" />

            <div className="flex items-center justify-between py-4 px-4 rounded-xl hover:bg-ds-surface-sunken transition-all duration-200">
              <div className="flex-1">
                <div className="font-semibold text-ds-text-primary text-base">
                  Membership Requests
                </div>
                <div className="text-sm text-ds-text-secondary mt-1">
                  Notifications for new membership requests (Leaders only)
                </div>
              </div>
              <Switch
                checked={preferences.membershipRequests}
                onChange={(checked) =>
                  handleToggle("membershipRequests", checked)
                }
                disabled={user?.role === "MEMBER"}
                className="ml-4"
              />
            </div>

            <Divider className="my-2" />

            <div className="flex items-center justify-between py-4 px-4 rounded-xl hover:bg-ds-surface-sunken transition-all duration-200">
              <div className="flex-1">
                <div className="font-semibold text-ds-text-primary text-base">
                  Role Changes
                </div>
                <div className="text-sm text-ds-text-secondary mt-1">
                  Notifications when your role is updated
                </div>
              </div>
              <Switch
                checked={preferences.roleChanges}
                onChange={(checked) => handleToggle("roleChanges", checked)}
                className="ml-4"
              />
            </div>

            <Divider className="my-2" />

            <div className="flex items-center justify-between py-4 px-4 rounded-xl hover:bg-ds-surface-sunken transition-all duration-200">
              <div className="flex-1">
                <div className="font-semibold text-ds-text-primary text-base">
                  New Members
                </div>
                <div className="text-sm text-ds-text-secondary mt-1">
                  Notifications when new members join your group (Leaders only)
                </div>
              </div>
              <Switch
                checked={preferences.newMembers}
                onChange={(checked) => handleToggle("newMembers", checked)}
                disabled={user?.role === "MEMBER"}
                className="ml-4"
              />
            </div>

            <Divider className="my-2" />

            <div className="flex items-center justify-between py-2">
              <div>
                <div className="font-medium text-ds-text-primary">
                  Member Removal Alerts
                </div>
                <div className="text-sm text-ds-text-subtle">
                  Notifications when you are removed from a group
                </div>
              </div>
              <Switch
                checked={preferences.memberRemoved}
                onChange={(checked) => handleToggle("memberRemoved", checked)}
              />
            </div>

            {user?.role !== "MEMBER" && (
              <>
                <Divider className="my-2" />

                <div className="flex items-center justify-between py-2">
                  <div>
                    <div className="font-medium text-ds-text-primary">
                      Follow-up Reminders
                    </div>
                    <div className="text-sm text-ds-text-subtle">
                      Reminders for scheduled member follow-ups
                    </div>
                  </div>
                  <Switch
                    checked={preferences.followUpReminders}
                    onChange={(checked) =>
                      handleToggle("followUpReminders", checked)
                    }
                  />
                </div>

                <Divider className="my-2" />

                <div className="flex items-center justify-between py-2">
                  <div>
                    <div className="font-medium text-ds-text-primary">
                      Inactive Member Alerts
                    </div>
                    <div className="text-sm text-ds-text-subtle">
                      Notifications about members with low attendance
                    </div>
                  </div>
                  <Switch
                    checked={preferences.inactiveAlerts}
                    onChange={(checked) =>
                      handleToggle("inactiveAlerts", checked)
                    }
                  />
                </div>
              </>
            )}
          </div>
        </Card>

        <Card title="Meeting Reminder Timing" className="max-w-3xl">
          <Form layout="vertical">
            <Form.Item
              label="Send meeting reminders"
              tooltip="Choose how far in advance you want to receive meeting reminders"
            >
              <Select
                value={preferences.reminderTiming}
                onChange={handleReminderTimingChange}
                style={{ width: 200 }}
                options={[
                  { label: "1 hour before", value: "1h" },
                  { label: "3 hours before", value: "3h" },
                  { label: "12 hours before", value: "12h" },
                  { label: "24 hours before", value: "24h" },
                  { label: "48 hours before", value: "48h" },
                ]}
              />
            </Form.Item>
          </Form>
        </Card>

        <Card
          title={
            <div className="flex items-center gap-2">
              <MailOutlined />
              Email & SMS Notifications
            </div>
          }
          className="max-w-3xl"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <div className="font-medium text-ds-text-primary flex items-center gap-2">
                  <MailOutlined />
                  Email Notifications
                </div>
                <div className="text-sm text-ds-text-subtle">
                  Receive notification emails at {user?.email}
                </div>
              </div>
              <Switch
                checked={preferences.emailNotifications}
                onChange={(checked) =>
                  handleToggle("emailNotifications", checked)
                }
              />
            </div>

            <Divider className="my-2" />

            <div className="flex items-center justify-between py-2">
              <div>
                <div className="font-medium text-ds-text-primary flex items-center gap-2">
                  <PhoneOutlined />
                  SMS Notifications
                </div>
                <div className="text-sm text-ds-text-subtle">
                  Receive text messages for critical updates (coming soon)
                </div>
              </div>
              <Switch
                checked={preferences.smsNotifications}
                onChange={(checked) =>
                  handleToggle("smsNotifications", checked)
                }
                disabled
              />
            </div>
          </div>

          <div className="mt-4 p-3 bg-ds-chart-1/5 border border-blue-200 rounded">
            <p className="text-sm text-ds-chart-1">
              <strong>Note:</strong> Email and SMS notifications are currently
              in mock mode. In production, these will be delivered through
              proper email/SMS services.
            </p>
          </div>
        </Card>

        <div className="flex justify-end max-w-3xl">
          <AntButton
            type="primary"
            icon={<SaveOutlined />}
            size="large"
            onClick={handleSave}
            loading={saving}
          >
            Save Preferences
          </AntButton>
        </div>
      </div>
    </DashboardLayout>
  );
}
