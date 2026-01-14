"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  List,
  Button as AntButton,
  message,
  Spin,
  Tag,
  Avatar,
  Empty,
  Tabs,
} from "antd";
import {
  BellOutlined,
  CheckOutlined,
  CalendarOutlined,
  TeamOutlined,
  UserOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { format } from "date-fns";
import EmptyState from "@/components/ui/EmptyState";

const { TabPane } = Tabs;

export default function NotificationsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<appNotification[]>([]);
  const [markingRead, setMarkingRead] = useState<string | null>(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications");
      if (response.ok) {
        const data = await response.json();
        // Sort by date descending
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
  };

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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
      message.error("An error occurred");
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "MEETING_REMINDER":
        return <CalendarOutlined className="text-blue-500" />;
      case "REQUEST_STATUS":
        return <TeamOutlined className="text-green-500" />;
      case "ROLE_ASSIGNMENT":
        return <UserOutlined className="text-purple-500" />;
      default:
        return <BellOutlined className="text-gray-500" />;
    }
  };

  const handleNotificationClick = (notification: appNotification) => {
    // Mark as read
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }

    // Navigate based on type and relatedId
    if (notification.type === "MEETING_REMINDER" && notification.relatedId) {
      router.push(`/member/meetings/${notification.relatedId}`);
    } else if (
      notification.type === "REQUEST_STATUS" &&
      notification.relatedId
    ) {
      router.push("/member/membership-requests");
    } else if (notification.type === "ROLE_ASSIGNMENT") {
      router.push("/member/profile");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  const unreadNotifications = notifications.filter((n) => !n.read);

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <BellOutlined />
              Notifications
            </h1>
            <p className="text-gray-600">
              {unreadNotifications.length} unread notification
              {unreadNotifications.length !== 1 ? "s" : ""}
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
          icon={<BellOutlined />}
          title="No Notifications"
          description="You don't have any notifications yet. We'll notify you about meetings, requests, and important updates."
        />
      ) : (
        <Tabs defaultActiveKey="all">
          <TabPane tab={`All (${notifications.length})`} key="all">
            <List
              dataSource={notifications}
              renderItem={(notification) => (
                <List.Item
                  key={notification.id}
                  className={`cursor-pointer transition-colors hover:bg-gray-50 ${!notification.read ? "bg-blue-50" : ""}`}
                  onClick={() => handleNotificationClick(notification)}
                  actions={[
                    !notification.read && (
                      <AntButton
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
                          backgroundColor: notification.read
                            ? "#f0f0f0"
                            : "#e6f7ff",
                        }}
                      />
                    }
                    title={
                      <div className="flex items-center gap-2">
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
                      </div>
                    }
                    description={
                      <div>
                        <p className="text-gray-700 mb-1">
                          {notification.message}
                        </p>
                        <span className="text-sm text-gray-500">
                          {format(
                            new Date(notification.createdAt),
                            "MMM d, yyyy 'at' h:mm a"
                          )}
                        </span>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </TabPane>
          <TabPane tab={`Unread (${unreadNotifications.length})`} key="unread">
            {unreadNotifications.length === 0 ? (
              <Empty
                description="No unread notifications"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ) : (
              <List
                dataSource={unreadNotifications}
                renderItem={(notification) => (
                  <List.Item
                    key={notification.id}
                    className="cursor-pointer transition-colors hover:bg-gray-50 bg-blue-50"
                    onClick={() => handleNotificationClick(notification)}
                    actions={[
                      <AntButton
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
                      </AntButton>,
                      <AntButton
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
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          icon={getNotificationIcon(notification.type)}
                          style={{ backgroundColor: "#e6f7ff" }}
                        />
                      }
                      title={
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">
                            {notification.title}
                          </span>
                          <Tag color="blue" className="text-xs">
                            New
                          </Tag>
                        </div>
                      }
                      description={
                        <div>
                          <p className="text-gray-700 mb-1">
                            {notification.message}
                          </p>
                          <span className="text-sm text-gray-500">
                            {format(
                              new Date(notification.createdAt),
                              "MMM d, yyyy 'at' h:mm a"
                            )}
                          </span>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </TabPane>
        </Tabs>
      )}
    </div>
  );
}
