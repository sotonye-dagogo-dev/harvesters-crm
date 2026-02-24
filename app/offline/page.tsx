"use client";

import { Result } from "antd";
import Button from "@/components/ui/Button";
import { WifiOutlined } from "@ant-design/icons";
import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-ds-surface-base p-4">
      <Result
        icon={<WifiOutlined className="text-ds-text-subtle" />}
        title="You're Offline"
        subTitle="Please check your internet connection and try again."
        extra={[
          <Button
            key="retry"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>,
          <Button key="home" variant="secondary">
            <Link href="/">Go Home</Link>
          </Button>,
        ]}
      />
    </div>
  );
}
