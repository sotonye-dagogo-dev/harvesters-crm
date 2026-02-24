"use client";

import { UserRole } from "@/lib/types";
import DashboardLayout from "@/components/features/navigation/DashboardLayout";
import { ReportNewView } from "@/components/features/reports";

export default function SuperadminNewReportPage() {
  return (
    <DashboardLayout role={UserRole.SUPERADMIN}>
      <ReportNewView routePrefix="/superadmin" />
    </DashboardLayout>
  );
}
