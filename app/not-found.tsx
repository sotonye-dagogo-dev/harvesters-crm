"use client";

import Link from "next/link";
import { Button, Result } from "antd";
import { HomeOutlined, DashboardOutlined } from "@ant-design/icons";
import { useAuth } from "@/providers/AuthProvider";
import { getDashboardRoute } from "@/lib/constants/roles";

export default function NotFoundPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-amber-50 dark:from-slate-950 dark:to-slate-900 p-4">
      <Result
        status="404"
        title="404"
        subTitle="This page doesn't exist. Let's get you back to your small group community."
        extra={
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {user?.role ? (
              <>
                <Link href={user?.role ? getDashboardRoute(user.role) : "/"}>
                  <Button
                    type="primary"
                    size="large"
                    icon={<DashboardOutlined />}
                  >
                    Go to Dashboard
                  </Button>
                </Link>
                <Link href="/">
                  <Button size="large" icon={<HomeOutlined />}>
                    Home
                  </Button>
                </Link>
              </>
            ) : (
              <Link href="/">
                <Button type="primary" size="large" icon={<HomeOutlined />}>
                  Back Home
                </Button>
              </Link>
            )}
          </div>
        }
      />
    </div>
  );
}
