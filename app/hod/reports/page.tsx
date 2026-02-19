"use client";

import DashboardLayout from "@/components/features/navigation/DashboardLayout";
import ReportsList from "@/components/features/reports/ReportsList";
import { useAuth } from "@/providers/AuthProvider";

export default function HodReportsPage() {
  const { user } = useAuth();

  return (
    <DashboardLayout role={user?.role}>
      <ReportsList
        basePath="/hod/reports"
        createPath="/hod/reports/submit"
        title="My Reports"
      />
    </DashboardLayout>
  );
}
