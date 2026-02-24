"use client";

import { UserRole } from "@/lib/types";
import DashboardLayout from "@/components/features/navigation/DashboardLayout";
import { ReportDataEntryView } from "@/components/features/reports";

export default function SuperadminDataEntryPage() {
  return (
    <DashboardLayout role={UserRole.SUPERADMIN}>
      <ReportDataEntryView routePrefix="/superadmin" />
    </DashboardLayout>
  );
}
