"use client";

import DashboardLayout from "@/components/features/navigation/DashboardLayout";
import ReportsList from "@/components/features/reports/ReportsList";
import { useAuth } from "@/providers/AuthProvider";

export default function SuperadminReportsPage() {
  const { user } = useAuth();

  return (
    <DashboardLayout role={user?.role}>
      <ReportsList
        basePath="/superadmin/reports"
        createPath="/superadmin/reports/submit"
        title="All Reports"
        showSubmitter
        showFilters
      />
    </DashboardLayout>
  );
}
