"use client";

import { useEffect, useState } from "react";
import { Button, message, Modal, Switch } from "antd";
import { BellOutlined } from "@ant-design/icons";

interface PushNotificationService {
  isSupported: boolean;
  isSubscribed: boolean;
  subscription: PushSubscription | null;
}

/**
 * Push Notification Manager Component
 * Handles push notification permissions, subscriptions, and preferences
 */
export function PushNotificationManager() {
  const [notificationState, setNotificationState] =
    useState<PushNotificationService>({
      isSupported: false,
      isSubscribed: false,
      subscription: null,
    });
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkNotificationSupport();
  }, []);

  const checkNotificationSupport = async () => {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      return;
    }

    setNotificationState((prev) => ({ ...prev, isSupported: true }));

    // Check current subscription
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      setNotificationState((prev) => ({
        ...prev,
        isSubscribed: !!subscription,
        subscription,
      }));
    } catch (error) {
      console.error("Error checking notification subscription:", error);
    }
  };

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      message.error("Notifications are not supported in this browser");
      return false;
    }

    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      message.success("Notifications enabled!");
      return true;
    } else if (permission === "denied") {
      message.error("Notification permission denied");
      return false;
    }

    return false;
  };

  const subscribeToPushNotifications = async () => {
    setLoading(true);

    try {
      const hasPermission = await requestNotificationPermission();
      if (!hasPermission) {
        setLoading(false);
        return;
      }

      const registration = await navigator.serviceWorker.ready;

      // In production, you would use your VAPID public key here
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
            "BEl62iUYgUivxIkv69yViEuiBIa-Ib37J8vpYHTZEQAhAZ2pAe8EWOu3PiBRRk7J_Ql7iC3w6yXLJRMGZuB83WE"
        ),
      });

      // Send subscription to backend
      await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(subscription),
      });

      setNotificationState((prev) => ({
        ...prev,
        isSubscribed: true,
        subscription,
      }));

      message.success("Successfully subscribed to push notifications!");
    } catch (error) {
      console.error("Error subscribing to push notifications:", error);
      message.error("Failed to subscribe to notifications");
    } finally {
      setLoading(false);
    }
  };

  const unsubscribeFromPushNotifications = async () => {
    setLoading(true);

    try {
      if (notificationState.subscription) {
        await notificationState.subscription.unsubscribe();

        // Notify backend
        await fetch("/api/notifications/unsubscribe", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            endpoint: notificationState.subscription.endpoint,
          }),
        });

        setNotificationState((prev) => ({
          ...prev,
          isSubscribed: false,
          subscription: null,
        }));

        message.success("Unsubscribed from push notifications");
      }
    } catch (error) {
      console.error("Error unsubscribing from push notifications:", error);
      message.error("Failed to unsubscribe");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleNotifications = async (checked: boolean) => {
    if (checked) {
      await subscribeToPushNotifications();
    } else {
      await unsubscribeFromPushNotifications();
    }
  };

  // Helper function to convert VAPID key
  function urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  if (!notificationState.isSupported) {
    return null;
  }

  return (
    <>
      <Button
        icon={<BellOutlined />}
        onClick={() => setShowSettings(true)}
        type={notificationState.isSubscribed ? "default" : "primary"}
      >
        {notificationState.isSubscribed
          ? "Notifications On"
          : "Enable Notifications"}
      </Button>

      <Modal
        title="Push Notification Settings"
        open={showSettings}
        onCancel={() => setShowSettings(false)}
        footer={null}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Enable Push Notifications</h4>
              <p className="text-sm text-gray-600">
                Receive updates about meetings, requests, and activities
              </p>
            </div>
            <Switch
              checked={notificationState.isSubscribed}
              onChange={handleToggleNotifications}
              loading={loading}
            />
          </div>

          {notificationState.isSubscribed && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700">
                ✓ You will receive notifications for:
              </p>
              <ul className="mt-2 text-sm text-green-600 space-y-1">
                <li>• Upcoming meeting reminders</li>
                <li>• Membership request updates</li>
                <li>• Role assignment changes</li>
                <li>• Important announcements</li>
              </ul>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
