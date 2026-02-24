import DashboardLayout from "@/components/features/navigation/DashboardLayout";
import InboxView from "@/components/features/notifications/InboxView";
import { UserRole } from "@/lib/types";

export default function SuperadminInboxPage() {
  return (
    <DashboardLayout role={UserRole.SUPERADMIN}>
      <InboxView />
    </DashboardLayout>
  );
}
