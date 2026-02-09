"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/features/navigation/DashboardLayout";
import { useAuth } from "@/providers/AuthProvider";
import { Button as AntButton, message, Tabs } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import MeetingCard from "@/components/features/meetings/MeetingCard";
import EmptyState from "@/components/ui/EmptyState";
import { CardSkeleton } from "@/components/ui/LoadingSkeleton";
import { useRouter } from "next/navigation";
import { UserRole } from "@/lib/types";

export default function MeetingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [filteredMeetings, setFilteredMeetings] = useState<Meeting[]>([]);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchMeetings();
  }, []);

  useEffect(() => {
    filterMeetings();
  }, [activeTab, meetings]);

  const fetchMeetings = async () => {
    try {
      const response = await fetch("/api/meetings");
      if (response.ok) {
        const data = await response.json();
        setMeetings(data.data);
      }
    } catch (error) {
      message.error("Failed to load meetings");
    } finally {
      setLoading(false);
    }
  };

  const filterMeetings = () => {
    const now = new Date();
    let filtered = [...meetings];

    if (activeTab === "upcoming") {
      filtered = filtered.filter((m) => new Date(m.date) >= now);
    } else if (activeTab === "past") {
      filtered = filtered.filter((m) => new Date(m.date) < now);
    }

    // Sort by date descending
    filtered.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    setFilteredMeetings(filtered);
  };

  if (loading) {
    return (
      <DashboardLayout role={user?.role || UserRole.SMALL_GROUP_LEADER}>
        <CardSkeleton count={6} />
      </DashboardLayout>
    );
  }

  const canCreateMeeting =
    user?.role === UserRole.SMALL_GROUP_LEADER || user?.role === "SUPERADMIN";

  const tabItems = [
    { key: "all", label: "All Meetings" },
    { key: "upcoming", label: "Upcoming" },
    { key: "past", label: "Past" },
  ];

  return (
    <DashboardLayout role={user?.role || UserRole.SMALL_GROUP_LEADER}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Meetings
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Track fellowship meetings and attendance
            </p>
          </div>
          {canCreateMeeting && user?.groupId && (
            <AntButton
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => router.push("/leader/meetings/new")}
            >
              Log Meeting
            </AntButton>
          )}
        </div>

        <Tabs activeKey={activeTab} items={tabItems} onChange={setActiveTab} />

        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredMeetings.length} meeting
          {filteredMeetings.length !== 1 ? "s" : ""}
        </div>

        {filteredMeetings.length === 0 ? (
          <EmptyState
            title="No meetings found"
            description={
              activeTab === "upcoming"
                ? "No upcoming meetings scheduled"
                : activeTab === "past"
                  ? "No past meetings recorded"
                  : "No meetings have been logged yet"
            }
            action={
              canCreateMeeting && user?.groupId ? (
                <AntButton
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => router.push("/leader/meetings/new")}
                >
                  Log First Meeting
                </AntButton>
              ) : undefined
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mx-2 sm:mx-0">
            {filteredMeetings.map((meeting) => (
              <MeetingCard
                key={meeting.id}
                meeting={{
                  id: meeting.id,
                  groupId: meeting.groupId || '',
                  date: meeting.date,
                  attendeeCount: meeting.attendeeCount,
                  screenshotUrl: meeting.screenshotUrl,
                  notes: meeting.notes,
                }}
                showActions={canCreateMeeting}
                onEdit={(id) => router.push(`/leader/meetings/${id}/edit`)}
                onDelete={() => message.info("Delete coming soon")}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
