"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { Badge, Dropdown, List, Button as AntButton, Empty } from "antd";
import { BellOutlined, CheckOutlined } from "@ant-design/icons";
import { format } from "date-fns";
import { getRoleConfig } from "@/lib/constants/roles";

export default function NotificationBell() {
  const router = useRouter();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<appNotification[]>([]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications");
      if (response.ok) {
        const data = await response.json();
        // Sort by date descending and take top 5 unread
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
  };

  useEffect(() => {
    // Only fetch notifications when page becomes visible (instead of polling)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchNotifications();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Initial fetch - intentionally fetching data on mount
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNotifications();

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

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
    // Mark as read
    handleMarkAsRead(notification.id, {
      stopPropagation: () => {},
    } as React.MouseEvent);

    // Derive the correct route prefix for this user's role
    const routePrefix = user?.role
      ? getRoleConfig(user.role).routePrefix
      : "/member";

    // Navigate based on notification type with role-aware destinations
    if (notification.type === "MEETING_REMINDER" && notification.relatedId) {
      if (routePrefix === "/leader") {
        // Leaders have a meeting detail page
        router.push(`/leader/meetings/${notification.relatedId}`);
      } else if (routePrefix === "/member") {
        // Members have a read-only meeting detail page
        router.push(`/member/meetings/${notification.relatedId}`);
      } else {
        // Superadmin and other roles fall back to dashboard
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
    }
  };

  const dropdownContent = (
    <div className="w-80 max-h-96 overflow-y-auto bg-white rounded-lg shadow-lg">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Notifications</h3>
        {notifications.length > 0 && (
          <AntButton
            type="link"
            size="small"
            onClick={() => {
              const routePrefix = user?.role
                ? getRoleConfig(user.role).routePrefix
                : "/member";
              // Only members have a dedicated notifications page
              if (routePrefix === "/member") {
                router.push("/member/notifications");
              } else {
                router.push(`${routePrefix}/dashboard`);
              }
            }}
          >
            View All
          </AntButton>
        )}
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
              className="cursor-pointer hover:bg-gray-50 transition-colors px-4"
              onClick={() => handleNotificationClick(notification)}
              actions={[
                <AntButton
                  key={`mark-read-${notification.id}`}
                  type="text"
                  size="small"
                  icon={<CheckOutlined />}
                  onClick={(e) => handleMarkAsRead(notification.id, e)}
                />,
              ]}
            >
              <List.Item.Meta
                title={
                  <span className="text-sm font-medium">
                    {notification.title}
                  </span>
                }
                description={
                  <div>
                    <p className="text-xs text-gray-600 mb-1">
                      {notification.message.length > 60
                        ? `${notification.message.substring(0, 60)}...`
                        : notification.message}
                    </p>
                    <span className="text-xs text-gray-400">
                      {format(
                        new Date(notification.createdAt),
                        "MMM d, h:mm a"
                      )}
                    </span>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      )}
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
      <AntButton
        type="text"
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
