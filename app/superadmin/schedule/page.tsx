"use client";

import { useState, useEffect } from "react";
import { Select, message } from "antd";
import { UserRole } from "@/lib/types";
import DashboardLayout from "@/components/features/navigation/DashboardLayout";
import MeetingScheduleView from "@/components/features/meetings/MeetingScheduleView";

interface GroupOption {
  id: string;
  name: string;
}

export default function SuperadminSchedulePage() {
  const [groups, setGroups] = useState<GroupOption[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | undefined>();

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetch("/api/groups");
        if (response.ok) {
          const result = await response.json();
          setGroups(result.data || []);
        }
      } catch {
        message.error("Failed to load groups");
      }
    };

    fetchGroups();
  }, []);

  // Build query params — show all meetings by default, filter by group if selected
  const queryParams = selectedGroupId ? `?groupId=${selectedGroupId}` : "";

  return (
    <DashboardLayout role={UserRole.SUPERADMIN}>
      <MeetingScheduleView
        meetingQueryParams={queryParams}
        createGroupId={selectedGroupId}
        routePrefix="/superadmin"
        heading="Church-Wide Schedule"
        subHeading="View and manage all meetings across the organisation"
        canCreate={!!selectedGroupId}
        canGenerateSchedule={!!selectedGroupId}
        groupSelector={
          <div className="bg-ds-surface-elevated p-4 rounded-xl border border-ds-border-base">
            <label className="block text-sm font-medium text-ds-text-secondary mb-2">
              Filter by Group
            </label>
            <Select
              value={selectedGroupId}
              onChange={setSelectedGroupId}
              placeholder="All groups (select a group to create meetings)"
              allowClear
              showSearch
              className="w-full max-w-md"
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={groups.map((g) => ({
                value: g.id,
                label: g.name,
              }))}
            />
          </div>
        }
      />
    </DashboardLayout>
  );
}
