"use client";

import { useAuth } from "@/providers/AuthProvider";
import DashboardLayout from "@/components/features/navigation/DashboardLayout";
import { ReportNewView } from "@/components/features/reports";

export default function NewReportPage() {
  const { user } = useAuth();

  return (
    <DashboardLayout role={user?.role}>
      <ReportNewView routePrefix="/leader" />
    </DashboardLayout>
  );
}
