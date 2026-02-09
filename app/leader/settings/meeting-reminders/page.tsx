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

export default function MeetingRemindersPage() {
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
    } catch (error) {
      message.error("Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout role={user?.role || UserRole.SMALL_GROUP_LEADER}>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BellOutlined />
            Meeting Reminders
          </h2>
          <p className="text-gray-600 mt-1">
            Manage your meeting reminder preferences and notification settings
          </p>
        </div>

        <Card
          title={
            <div className="flex items-center gap-2">
              <BellOutlined />
              In-App Notifications
            </div>
          }
          className="max-w-3xl"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <div className="font-medium text-gray-900">
                  Meeting Reminders
                </div>
                <div className="text-sm text-gray-500">
                  Get notified about upcoming meetings
                </div>
              </div>
              <Switch
                checked={preferences.meetingReminders}
                onChange={(checked) =>
                  handleToggle("meetingReminders", checked)
                }
              />
            </div>

            <Divider className="my-2" />

            <div className="flex items-center justify-between py-2">
              <div>
                <div className="font-medium text-gray-900">
                  Membership Requests
                </div>
                <div className="text-sm text-gray-500">
                  Notifications for new membership requests
                </div>
              </div>
              <Switch
                checked={preferences.membershipRequests}
                onChange={(checked) =>
                  handleToggle("membershipRequests", checked)
                }
              />
            </div>

            <Divider className="my-2" />

            <div className="flex items-center justify-between py-2">
              <div>
                <div className="font-medium text-gray-900">Role Changes</div>
                <div className="text-sm text-gray-500">
                  Notifications when your role is updated
                </div>
              </div>
              <Switch
                checked={preferences.roleChanges}
                onChange={(checked) => handleToggle("roleChanges", checked)}
              />
            </div>

            <Divider className="my-2" />

            <div className="flex items-center justify-between py-2">
              <div>
                <div className="font-medium text-gray-900">New Members</div>
                <div className="text-sm text-gray-500">
                  Notifications when new members join your group
                </div>
              </div>
              <Switch
                checked={preferences.newMembers}
                onChange={(checked) => handleToggle("newMembers", checked)}
              />
            </div>

            <Divider className="my-2" />

            <div className="flex items-center justify-between py-2">
              <div>
                <div className="font-medium text-gray-900">
                  Member Removal Alerts
                </div>
                <div className="text-sm text-gray-500">
                  Notifications when you are removed from a group
                </div>
              </div>
              <Switch
                checked={preferences.memberRemoved}
                onChange={(checked) => handleToggle("memberRemoved", checked)}
              />
            </div>

            <Divider className="my-2" />

            <div className="flex items-center justify-between py-2">
              <div>
                <div className="font-medium text-gray-900">
                  Follow-up Reminders
                </div>
                <div className="text-sm text-gray-500">
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
                <div className="font-medium text-gray-900">
                  Inactive Member Alerts
                </div>
                <div className="text-sm text-gray-500">
                  Notifications about members with low attendance
                </div>
              </div>
              <Switch
                checked={preferences.inactiveAlerts}
                onChange={(checked) => handleToggle("inactiveAlerts", checked)}
              />
            </div>
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
                <div className="font-medium text-gray-900 flex items-center gap-2">
                  <MailOutlined />
                  Email Notifications
                </div>
                <div className="text-sm text-gray-500">
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
                <div className="font-medium text-gray-900 flex items-center gap-2">
                  <PhoneOutlined />
                  SMS Notifications
                </div>
                <div className="text-sm text-gray-500">
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

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm text-blue-800">
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
