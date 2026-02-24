import DashboardLayout from "@/components/features/navigation/DashboardLayout";
import InboxView from "@/components/features/notifications/InboxView";
import { UserRole } from "@/lib/types";

export default function MemberInboxPage() {
  return (
    <DashboardLayout role={UserRole.MEMBER}>
      <InboxView />
    </DashboardLayout>
  );
}
