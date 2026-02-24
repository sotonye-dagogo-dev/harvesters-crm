"use client";

import DashboardLayout from "@/components/features/navigation/DashboardLayout";
import ReportAnalyticsDashboard from "@/components/features/reports/ReportAnalyticsDashboard";
import { useAuth } from "@/providers/AuthProvider";

export default function HodReportAnalyticsPage() {
  const { user } = useAuth();

  return (
    <DashboardLayout role={user?.role}>
      <ReportAnalyticsDashboard />
    </DashboardLayout>
  );
}
