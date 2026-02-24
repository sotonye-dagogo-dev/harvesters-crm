"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { Badge, Dropdown, List, Empty } from "antd";
import Button from "@/components/ui/Button";
import { BellOutlined, CheckOutlined, MailOutlined } from "@ant-design/icons";
import { format } from "date-fns";
import { getRoleConfig } from "@/lib/constants/roles";
import { useDbSubscription } from "@/lib/hooks/useDbSubscription";

export default function NotificationBell() {
  const router = useRouter();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<appNotification[]>([]);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications");
      if (response.ok) {
        const data = await response.json();
        const unread = data
          .filter((n: appNotification) => !n.read)
          .sort(
            (a: appNotification, b: appNotification) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .slice(0, 5);
        setNotifications(unread);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  }, []);

  // Real-time: re-fetch when notifications change in the DB
  useDbSubscription(["notifications"], () => {
    fetchNotifications();
  });

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchNotifications();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    fetchNotifications();

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchNotifications]);

  const handleMarkAsRead = async (
    notificationId: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true }),
      });

      if (response.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      }
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const handleNotificationClick = (notification: appNotification) => {
    handleMarkAsRead(notification.id, {
      stopPropagation: () => {},
    } as React.MouseEvent);

    const routePrefix = user?.role
      ? getRoleConfig(user.role).routePrefix
      : "/member";

    if (notification.type === "MEETING_REMINDER" && notification.relatedId) {
      if (routePrefix === "/leader") {
        router.push(`/leader/meetings/${notification.relatedId}`);
      } else if (routePrefix === "/member") {
        router.push(`/member/meetings/${notification.relatedId}`);
      } else {
        router.push(`${routePrefix}/dashboard`);
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
    } else {
      router.push(`${routePrefix}/inbox`);
    }
  };

  const inboxPath = user?.role
    ? `${getRoleConfig(user.role).routePrefix}/inbox`
    : "/member/inbox";

  const dropdownContent = (
    <div className="w-80 max-h-96 overflow-y-auto bg-ds-surface-elevated rounded-lg shadow-lg border border-ds-border-base">
      <div className="p-4 border-b border-ds-border-subtle flex items-center justify-between">
        <h3 className="font-semibold text-ds-text-primary">Notifications</h3>
        <div className="flex items-center gap-2">
          {notifications.length > 0 && (
            <Button
              variant="link"
              size="small"
              onClick={() => router.push(inboxPath)}
            >
              View All
            </Button>
          )}
        </div>
      </div>
      {notifications.length === 0 ? (
        <div className="p-8">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No new notifications"
          />
        </div>
      ) : (
        <List
          dataSource={notifications}
          renderItem={(notification) => (
            <List.Item
              key={notification.id}
              className="cursor-pointer hover:bg-ds-surface-sunken transition-colors px-4"
              onClick={() => handleNotificationClick(notification)}
              actions={[
                <Button
                  key={`mark-read-${notification.id}`}
                  variant="text"
                  size="small"
                  icon={<CheckOutlined />}
                  onClick={(e) => handleMarkAsRead(notification.id, e)}
                />,
              ]}
            >
              <List.Item.Meta
                title={
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium">
                      {notification.title}
                    </span>
                    {notification.emailSent && (
                      <MailOutlined
                        className="text-xs text-ds-text-subtle"
                        title="Email also sent"
                      />
                    )}
                  </div>
                }
                description={
                  <div>
                    <p className="text-xs text-ds-text-secondary mb-1">
                      {notification.message.length > 60
                        ? `${notification.message.substring(0, 60)}...`
                        : notification.message}
                    </p>
                    <span className="text-xs text-ds-text-subtle">
                      {format(
                        new Date(notification.createdAt),
                        "d MMM, h:mm a"
                      )}
                    </span>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      )}
      <div className="p-2 border-t border-ds-border-subtle">
        <Button
          variant="text"
          size="small"
          className="w-full"
          onClick={() => router.push(inboxPath)}
        >
          Open Inbox
        </Button>
      </div>
    </div>
  );

  return (
    <Dropdown
      dropdownRender={() => dropdownContent}
      trigger={["click"]}
      placement="bottomRight"
      onOpenChange={(open) => {
        if (open) {
          fetchNotifications();
        }
      }}
    >
      <Button
        variant="text"
        icon={
          <Badge count={notifications.length} size="small" offset={[-2, 2]}>
            <BellOutlined className="text-xl" />
          </Badge>
        }
        className="flex items-center justify-center"
      />
    </Dropdown>
  );
}
