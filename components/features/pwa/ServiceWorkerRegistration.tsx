"use client";

import { useEffect } from "react";
import { message } from "antd";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      // Register service worker
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("Service Worker registered:", registration);

          // Check for updates when page becomes visible (instead of polling)
          const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
              registration.update();
            }
          };

          document.addEventListener("visibilitychange", handleVisibilityChange);

          // Cleanup
          return () => {
            document.removeEventListener(
              "visibilitychange",
              handleVisibilityChange
            );
          };
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });

      // Listen for updates
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        message.info({
          content: "App updated! Refresh to get the latest version.",
          duration: 10,
          onClick: () => window.location.reload(),
        });
      });

      // Request notification permission
      if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            console.log("Notification permission granted");
          }
        });
      }
    }
  }, []);

  return null;
}
