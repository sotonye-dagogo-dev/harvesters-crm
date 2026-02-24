"use client";

import DashboardLayout from "@/components/features/navigation/DashboardLayout";
import ReportsList from "@/components/features/reports/ReportsList";
import { useAuth } from "@/providers/AuthProvider";

export default function CampusAdminReportsPage() {
  const { user } = useAuth();

  return (
    <DashboardLayout role={user?.role}>
      <ReportsList
        basePath="/campusadmin/reports"
        createPath="/campusadmin/reports/submit"
        title="All Reports"
        showSubmitter
        showFilters
      />
    </DashboardLayout>
  );
}
