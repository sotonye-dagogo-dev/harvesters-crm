"use client";

import DashboardLayout from "@/components/features/navigation/DashboardLayout";
import { useAuth } from "@/providers/AuthProvider";
import { Card, Empty } from "antd";
import MeetingScheduleView from "@/components/features/meetings/MeetingScheduleView";

export default function MeetingSchedulingPage() {
  const { user } = useAuth();

  if (!user?.groupId) {
    return (
      <DashboardLayout role={user?.role}>
        <Card>
          <Empty
            description="You are not assigned to a group"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role={user?.role}>
      <MeetingScheduleView
        meetingQueryParams={`?groupId=${user.groupId}`}
        createGroupId={user.groupId}
        routePrefix="/leader"
        heading="Meeting Schedule"
        subHeading="Plan and manage your group meetings"
      />
    </DashboardLayout>
  );
}
