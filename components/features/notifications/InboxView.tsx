"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import {
  List,
  Button as AntButton,
  message,
  Spin,
  Tag,
  Avatar,
  Empty,
  Tabs,
  Tooltip,
  Card,
} from "antd";
import {
  BellOutlined,
  CheckOutlined,
  CalendarOutlined,
  TeamOutlined,
  UserOutlined,
  DeleteOutlined,
  MailOutlined,
  FileTextOutlined,
  MessageOutlined,
  InfoCircleOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import { format } from "date-fns";
import EmptyState from "@/components/ui/EmptyState";
import { getRoleConfig } from "@/lib/constants/roles";
import { useDbSubscription } from "@/lib/hooks/useDbSubscription";

export default function InboxView() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<appNotification[]>([]);
  const [markingRead, setMarkingRead] = useState<string | null>(null);

  const routePrefix = user?.role
    ? getRoleConfig(user.role).routePrefix
    : "/member";

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications");
      if (response.ok) {
        const data = await response.json();
        data.sort(
          (a: appNotification, b: appNotification) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setNotifications(data);
      } else {
        message.error("Failed to load notifications");
      }
    } catch (error) {
      message.error("An error occurred");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Real-time updates
  useDbSubscription(["notifications"], () => {
    fetchNotifications();
  });

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (notificationId: string) => {
    setMarkingRead(notificationId);
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true }),
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
        );
      } else {
        message.error("Failed to mark as read");
      }
    } catch {
      message.error("An error occurred");
    } finally {
      setMarkingRead(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    if (unreadIds.length === 0) {
      message.info("No unread notifications");
      return;
    }

    try {
      const response = await fetch("/api/notifications/mark-all-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationIds: unreadIds }),
      });

      if (response.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        message.success("All notifications marked as read");
      } else {
        message.error("Failed to mark all as read");
      }
    } catch {
      message.error("An error occurred");
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        message.success("Notification deleted");
      } else {
        message.error("Failed to delete notification");
      }
    } catch {
      message.error("An error occurred");
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "MEETING_REMINDER":
        return <CalendarOutlined className="text-ds-chart-1" />;
      case "REQUEST_STATUS":
        return <TeamOutlined className="text-ds-status-success" />;
      case "ROLE_ASSIGNMENT":
        return <UserOutlined className="text-ds-chart-3" />;
      case "REPORT_SUBMITTED":
      case "REPORT_APPROVED":
      case "REPORT_REJECTED":
      case "REPORT_UPDATE_REQUESTED":
        return <FileTextOutlined className="text-ds-chart-2" />;
      case "FOLLOW_UP_REMINDER":
        return <MessageOutlined className="text-ds-chart-4" />;
      default:
        return <BellOutlined className="text-ds-text-subtle" />;
    }
  };

  const handleNotificationClick = (notification: appNotification) => {
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }

    if (notification.type === "MEETING_REMINDER" && notification.relatedId) {
      if (routePrefix === "/leader") {
        router.push(`/leader/meetings/${notification.relatedId}`);
      } else if (routePrefix === "/member") {
        router.push(`/member/meetings/${notification.relatedId}`);
      } else {
        router.push(`${routePrefix}/meetings`);
      }
    } else if (notification.type === "REQUEST_STATUS") {
      if (routePrefix === "/leader") {
        router.push("/leader/requests");
      } else if (routePrefix === "/superadmin") {
        router.push("/superadmin/members");
      } else {
        router.push("/member/membership-requests");
      }
    } else if (notification.type === "ROLE_ASSIGNMENT") {
      router.push("/profile");
    } else if (
      notification.type?.startsWith("REPORT_") &&
      notification.relatedId
    ) {
      router.push(`${routePrefix}/reports/${notification.relatedId}`);
    }
  };

  const renderNotificationList = (items: appNotification[]) => {
    if (items.length === 0) {
      return (
        <Empty
          description="No notifications here"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      );
    }

    return (
      <List
        dataSource={items}
        renderItem={(notification) => (
          <List.Item
            key={notification.id}
            className={`cursor-pointer transition-colors hover:bg-ds-surface-sunken ${
              !notification.read ? "bg-ds-chart-1/5" : ""
            }`}
            onClick={() => handleNotificationClick(notification)}
            actions={[
              !notification.read && (
                <AntButton
                  key="mark-read"
                  type="text"
                  size="small"
                  icon={<CheckOutlined />}
                  loading={markingRead === notification.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkAsRead(notification.id);
                  }}
                >
                  Mark Read
                </AntButton>
              ),
              <AntButton
                key="delete"
                type="text"
                danger
                size="small"
                icon={<DeleteOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(notification.id);
                }}
              >
                Delete
              </AntButton>,
            ].filter(Boolean)}
          >
            <List.Item.Meta
              avatar={
                <Avatar
                  icon={getNotificationIcon(notification.type)}
                  style={{
                    backgroundColor: notification.read ? "#f0f0f0" : "#e6f7ff",
                  }}
                />
              }
              title={
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={!notification.read ? "font-semibold" : ""}
                  >
                    {notification.title}
                  </span>
                  {!notification.read && (
                    <Tag color="blue" className="text-xs">
                      New
                    </Tag>
                  )}
                  {notification.emailSent && (
                    <Tooltip title="Email also sent">
                      <Tag
                        icon={<MailOutlined />}
                        color="geekblue"
                        className="text-xs"
                      >
                        Email
                      </Tag>
                    </Tooltip>
                  )}
                </div>
              }
              description={
                <div>
                  <p className="text-ds-text-secondary mb-1">
                    {notification.message}
                  </p>
                  <span className="text-sm text-ds-text-subtle">
                    {format(
                      new Date(notification.createdAt),
                      "d MMM yyyy 'at' h:mm a"
                    )}
                  </span>
                </div>
              }
            />
          </List.Item>
        )}
      />
    );
  };

  const renderEmailLog = () => {
    const emailNotifications = notifications.filter((n) => n.emailSent);

    if (emailNotifications.length === 0) {
      return (
        <EmptyState
          icon={<MailOutlined />}
          title="No Email Notifications"
          description="When notifications are sent via email, they will appear here with full email details. This simulates the email delivery that will be active in production."
        />
      );
    }

    return (
      <div className="space-y-4">
        <div className="p-3 rounded-lg bg-ds-surface-sunken border border-ds-border-subtle">
          <p className="text-sm text-ds-text-secondary flex items-center gap-2">
            <InfoCircleOutlined />
            <span>
              This tab simulates emails that would be sent in production. In the
              live system, these will be delivered to actual email addresses via
              the configured mail service.
            </span>
          </p>
        </div>

        <List
          dataSource={emailNotifications}
          renderItem={(notification) => (
            <Card
              key={notification.id}
              size="small"
              className="mb-3"
              title={
                <div className="flex items-center gap-2">
                  <MailOutlined className="text-ds-chart-2" />
                  <span className="text-sm font-medium">
                    {notification.emailMeta?.subject || notification.title}
                  </span>
                </div>
              }
              extra={
                <span className="text-xs text-ds-text-subtle">
                  {notification.emailMeta?.sentAt
                    ? format(
                        new Date(notification.emailMeta.sentAt),
                        "d MMM yyyy 'at' h:mm a"
                      )
                    : format(
                        new Date(notification.createdAt),
                        "d MMM yyyy 'at' h:mm a"
                      )}
                </span>
              }
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-ds-text-subtle font-medium">To:</span>
                  <span className="text-ds-text-secondary">
                    {notification.emailMeta?.to || "—"}
                  </span>
                </div>
                <div className="border-t border-ds-border-subtle pt-2">
                  <p className="text-sm text-ds-text-primary whitespace-pre-wrap">
                    {notification.emailMeta?.body || notification.message}
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <Tag color="green" className="text-xs">
                    Simulated
                  </Tag>
                  <Tag className="text-xs">
                    {notification.type?.replace(/_/g, " ") || "General"}
                  </Tag>
                </div>
              </div>
            </Card>
          )}
        />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spin size="large" />
      </div>
    );
  }

  const unreadNotifications = notifications.filter((n) => !n.read);
  const emailNotifications = notifications.filter((n) => n.emailSent);

  const tabItems = [
    {
      key: "all",
      label: `All (${notifications.length})`,
      children: renderNotificationList(notifications),
    },
    {
      key: "unread",
      label: `Unread (${unreadNotifications.length})`,
      children: renderNotificationList(unreadNotifications),
    },
    {
      key: "email",
      label: (
        <span className="flex items-center gap-1.5">
          <MailOutlined />
          Email Log ({emailNotifications.length})
        </span>
      ),
      children: renderEmailLog(),
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-ds-text-primary flex items-center gap-2">
              <InboxOutlined />
              Inbox
            </h1>
            <p className="text-ds-text-secondary">
              {unreadNotifications.length} unread notification
              {unreadNotifications.length !== 1 ? "s" : ""}
              {emailNotifications.length > 0 && (
                <span className="ml-2">
                  · {emailNotifications.length} email
                  {emailNotifications.length !== 1 ? "s" : ""}
                </span>
              )}
            </p>
          </div>
          {unreadNotifications.length > 0 && (
            <AntButton
              type="primary"
              icon={<CheckOutlined />}
              onClick={handleMarkAllAsRead}
            >
              Mark All as Read
            </AntButton>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={<InboxOutlined />}
          title="Your Inbox is Empty"
          description="You don't have any notifications yet. We'll notify you about meetings, requests, reports, and important updates."
        />
      ) : (
        <Tabs defaultActiveKey="all" items={tabItems} />
      )}
    </div>
  );
}
