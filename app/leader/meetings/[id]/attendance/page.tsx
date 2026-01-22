"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import {
  Card,
  Checkbox,
  Button,
  message,
  Spin,
  Empty,
  Alert,
  List,
  Avatar,
} from "antd";
import {
  SaveOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { format } from "date-fns";

export default function ManageAttendancePage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const meetingId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [meeting, setMeeting] = useState<MeetingWithDetails | null>(null);
  const [groupMembers, setGroupMembers] = useState<User[]>([]);
  const [attendeeIds, setAttendeeIds] = useState<string[]>([]);

  const fetchData = async () => {
    try {
      // Fetch meeting details
      const meetingRes = await fetch(`/api/meetings/${meetingId}`);
      if (!meetingRes.ok) throw new Error("Failed to fetch meeting");
      const meetingResult = await meetingRes.json();
      const meetingData: MeetingWithDetails =
        meetingResult.data || meetingResult;
      setMeeting(meetingData);
      setAttendeeIds(meetingData.attendeeIds || []);

      // Fetch group members
      const membersRes = await fetch(
        `/api/groups/${meetingData.groupId}/members`
      );
      if (!membersRes.ok) throw new Error("Failed to fetch members");
      const membersResult = await membersRes.json();
      const membersData: User[] = membersResult.data || membersResult;
      setGroupMembers(membersData);
    } catch (error) {
      message.error("Failed to load attendance data");
      console.error(error);
      router.push("/leader/meetings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingId]);

  const handleToggleAttendance = (memberId: string) => {
    setAttendeeIds((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSelectAll = () => {
    if (attendeeIds.length === groupMembers.length) {
      setAttendeeIds([]);
    } else {
      setAttendeeIds(groupMembers.map((m) => m.id));
    }
  };

  const handleSaveAttendance = async () => {
    if (!meeting) return;

    // Check if user can manage attendance
    const canManage =
      user?.role === "SUPERADMIN" ||
      (user?.role === "LEADER" && meeting.group?.leaderId === user.id);

    if (!canManage) {
      message.error("You don't have permission to manage attendance");
      return;
    }

    setSaving(true);

    try {
      // Update meeting with attendee list
      const res = await fetch(`/api/meetings/${meetingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: meeting.date,
          startTime: meeting.startTime,
          endTime: meeting.endTime,
          attendeeCount: attendeeIds.length,
          attendeeIds: attendeeIds,
          notes: meeting.notes,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to save attendance");
      }

      message.success("Attendance saved successfully");
      router.push(`/leader/meetings/${meetingId}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to save attendance";
      message.error(errorMessage);
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!meeting) {
    return null;
  }

  const canManage =
    user?.role === "SUPERADMIN" ||
    (user?.role === "LEADER" && meeting.group?.leaderId === user.id);

  if (!canManage) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <p className="text-gray-500">
            You don&apos;t have permission to manage attendance for this meeting
          </p>
          <Button
            type="primary"
            onClick={() => router.push(`/leader/meetings/${meetingId}`)}
          >
            Back to Meeting
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Attendance</h1>
        <p className="text-gray-500 mt-1">
          {meeting.group.name} •{" "}
          {format(new Date(meeting.date), "MMMM d, yyyy")}
        </p>
      </div>

      <div className="space-y-6">
        <Alert
          title="Mark Attendance"
          description="Check the members who attended this meeting. Unchecked members will be marked as absent. The attendance count will be automatically updated."
          type="info"
          showIcon
        />

        <Card
          title={
            <div className="flex items-center justify-between">
              <span>Member Attendance</span>
              <Button size="small" onClick={handleSelectAll}>
                {attendeeIds.length === groupMembers.length
                  ? "Mark All Absent"
                  : "Mark All Present"}
              </Button>
            </div>
          }
        >
          {groupMembers.length === 0 ? (
            <Empty
              description="No members in this group"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <List
              dataSource={groupMembers}
              renderItem={(member) => {
                const isAttended = attendeeIds.includes(member.id);
                const isAbsent = !isAttended;
                return (
                  <List.Item
                    key={member.id}
                    className={`cursor-pointer hover:bg-gray-50 transition-colors ${
                      isAttended ? "bg-green-50" : isAbsent ? "bg-red-50" : ""
                    }`}
                    onClick={() => handleToggleAttendance(member.id)}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          size={40}
                          icon={<UserOutlined />}
                          src={member.avatar}
                          style={{
                            backgroundColor: isAttended
                              ? "#52c41a"
                              : isAbsent
                                ? "#ff4d4f"
                                : "#d9d9d9",
                          }}
                        >
                          {member.firstName[0]}
                          {member.lastName[0]}
                        </Avatar>
                      }
                      title={
                        <div className="flex items-center gap-2">
                          {member.firstName} {member.lastName}
                          {isAttended && (
                            <CheckCircleOutlined className="text-green-600" />
                          )}
                          {isAbsent && (
                            <CloseCircleOutlined className="text-red-600" />
                          )}
                        </div>
                      }
                      description={
                        <div className="flex items-center gap-2">
                          <span>{member.email}</span>
                          {isAbsent && (
                            <span className="text-xs text-red-600 font-medium">
                              • Absent
                            </span>
                          )}
                        </div>
                      }
                    />
                    <Checkbox
                      checked={isAttended}
                      onChange={() => handleToggleAttendance(member.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </List.Item>
                );
              }}
            />
          )}

          <div className="mt-4 pt-4 border-t space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div>
                <span className="font-semibold text-green-600">Present:</span>{" "}
                {attendeeIds.length} members
              </div>
              <div>
                <span className="font-semibold text-red-600">Absent:</span>{" "}
                {groupMembers.length - attendeeIds.length} members
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-semibold">Attendance Rate:</span>{" "}
              {groupMembers.length > 0
                ? Math.round((attendeeIds.length / groupMembers.length) * 100)
                : 0}
              % ({attendeeIds.length} of {groupMembers.length} members)
            </div>
          </div>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button onClick={() => router.push(`/leader/meetings/${meetingId}`)}>
            Cancel
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSaveAttendance}
            loading={saving}
          >
            Save Attendance
          </Button>
        </div>
      </div>
    </div>
  );
}
