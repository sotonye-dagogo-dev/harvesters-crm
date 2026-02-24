"use client";

import { useAuth } from "@/providers/AuthProvider";
import DashboardLayout from "@/components/features/navigation/DashboardLayout";
import { ReportDataEntryView } from "@/components/features/reports";

export default function DataEntryPage() {
  const { user } = useAuth();

  return (
    <DashboardLayout role={user?.role}>
      <ReportDataEntryView routePrefix="/leader" />
    </DashboardLayout>
  );
}
