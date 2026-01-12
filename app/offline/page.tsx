"use client";

import { Result, Button } from "antd";
import { WifiOutlined } from "@ant-design/icons";
import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-church-primary/5 via-white to-church-accent/5 p-4">
      <Result
        icon={<WifiOutlined className="text-gray-400" />}
        title="You're Offline"
        subTitle="Please check your internet connection and try again."
        extra={[
          <Button
            key="retry"
            type="primary"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>,
          <Button key="home" type="default">
            <Link href="/">Go Home</Link>
          </Button>,
        ]}
      />
    </div>
  );
}
