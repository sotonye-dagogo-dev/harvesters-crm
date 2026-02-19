"use client";

import { use } from "react";
import DashboardLayout from "@/components/features/navigation/DashboardLayout";
import ReportDetailView from "@/components/features/reports/ReportDetailView";
import { useAuth } from "@/providers/AuthProvider";

export default function CampusAdminReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user } = useAuth();

  return (
    <DashboardLayout role={user?.role}>
      <ReportDetailView
        reportId={id}
        backUrl="/campusadmin/reports"
        currentUserId={user?.id}
        currentUserRole={user?.role}
      />
    </DashboardLayout>
  );
}
