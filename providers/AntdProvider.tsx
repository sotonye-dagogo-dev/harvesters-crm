"use client";

import { ConfigProvider, theme } from "antd";
import { useTheme } from "next-themes";
import { ReactNode, useEffect, useState } from "react";

interface AntdProviderProps {
  children: ReactNode;
}

export function AntdProvider({ children }: AntdProviderProps) {
  const { theme: currentTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && currentTheme === "dark";

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: isDark ? "#22c55e" : "#1B4B3E",
          colorSuccess: "#52c41a",
          colorWarning: "#faad14",
          colorError: "#ff4d4f",
          colorInfo: isDark ? "#22c55e" : "#1B4B3E",
          borderRadius: 6,
          fontFamily:
            '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
          colorBgBase: isDark ? "#0f172a" : "#ffffff",
          colorTextBase: isDark ? "#f1f5f9" : "#141414",
        },
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        components: {
          Button: {
            primaryShadow: isDark
              ? "0 2px 0 rgba(34, 197, 94, 0.1)"
              : "0 2px 0 rgba(27, 75, 62, 0.1)",
          },
          Card: {
            boxShadowTertiary: isDark
              ? "0 1px 2px 0 rgba(0, 0, 0, 0.2), 0 1px 6px -1px rgba(0, 0, 0, 0.15), 0 2px 4px 0 rgba(0, 0, 0, 0.1)"
              : "0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)",
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}
