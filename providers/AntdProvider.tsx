"use client";

import { ConfigProvider, theme } from "antd";
import { ReactNode } from "react";

interface AntdProviderProps {
  children: ReactNode;
}

export function AntdProvider({ children }: AntdProviderProps) {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#1B4B3E",
          colorSuccess: "#52c41a",
          colorWarning: "#faad14",
          colorError: "#ff4d4f",
          colorInfo: "#1B4B3E",
          borderRadius: 6,
          fontFamily:
            '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
        },
        algorithm: theme.defaultAlgorithm,
        components: {
          Button: {
            primaryShadow: "0 2px 0 rgba(27, 75, 62, 0.1)",
          },
          Card: {
            boxShadowTertiary:
              "0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)",
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}
