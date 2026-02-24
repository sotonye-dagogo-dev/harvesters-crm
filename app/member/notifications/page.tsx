"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/features/navigation/DashboardLayout";
import { Spin } from "antd";
import { UserRole } from "@/lib/types";

/**
 * Legacy notifications page — redirects to the new unified Inbox.
 * Kept so old bookmarks / links still work.
 */
export default function NotificationsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/member/inbox");
  }, [router]);

  return (
    <DashboardLayout role={UserRole.MEMBER}>
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spin size="large" tip="Redirecting to Inbox…" />
      </div>
    </DashboardLayout>
  );
}

