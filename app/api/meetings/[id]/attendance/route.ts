// TEMPORARILY DISABLED - Meeting interface uses attendeeIds array, not detailed attendance tracking
// This endpoint needs to be redesigned to match the current data structure
// or the Meeting interface needs to be updated to include an attendance array

/*
import { NextRequest } from "next/server";
import { meetingDb, groupDb, userDb } from "@/lib/data/database";
import { getAuthenticatedUser } from "@/lib/utils/middleware";
import { z } from "zod";
import {
  successResponse,
  notFoundResponse,
  forbiddenResponse,
  badRequestResponse,
  handleApiError,
} from "@/lib/utils/api";

const attendanceSchema = z.object({
  memberId: z.string().min(1, "Member ID is required"),
  status: z.enum(["PRESENT", "ABSENT", "EXCUSED"]),
  notes: z.string().optional(),
});

const bulkAttendanceSchema = z.object({
  attendance: z.array(attendanceSchema),
});

// POST /api/meetings/[id]/attendance - Record attendance
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error) return error;

    const { id } = await params;
    const body = await request.json();

    // Validate input
    const validation = bulkAttendanceSchema.safeParse(body);
    if (!validation.success) {
      return badRequestResponse("Invalid attendance data");
    }

    const meeting = meetingDb.findById(id);
    if (!meeting) {
      return notFoundResponse("Meeting not found");
    }

    // Check permissions
    const group = groupDb.findById(meeting.groupId);
    const canRecordAttendance =
      user?.role === USER_ROLES.SUPERADMIN || group?.leaderId === user?.id;

    if (!canRecordAttendance) {
      return forbiddenResponse(
        "You don't have permission to record attendance for this meeting"
      );
    }

    // Validate all members belong to the group
    const groupMembers = userDb.findAll({ groupId: meeting.groupId });
    const groupMemberIds = groupMembers.map((m) => m.id);

    for (const record of validation.data.attendance) {
      if (!groupMemberIds.includes(record.memberId)) {
        return badRequestResponse(
          `Member ${record.memberId} is not in this group`
        );
      }
    }

    // Update attendance
    const updatedMeeting = meetingDb.update(id, {
      attendance: validation.data.attendance.map((record) => ({
        memberId: record.memberId,
        status: record.status as AttendanceStatus,
        notes: record.notes,
      })),
    });

    if (!updatedMeeting) {
      return notFoundResponse("Meeting not found");
    }

    return successResponse(updatedMeeting, "Attendance recorded successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

// GET /api/meetings/[id]/attendance - Get attendance records
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error) return error;

    const { id } = await params;
    const meeting = meetingDb.findById(id);

    if (!meeting) {
      return notFoundResponse("Meeting not found");
    }

    // Check permissions
    const group = groupDb.findById(meeting.groupId);
    const canView =
      user?.role === USER_ROLES.SUPERADMIN ||
      group?.leaderId === user?.id ||
      user?.groupId === meeting.groupId;

    if (!canView) {
      return forbiddenResponse(
        "You don't have permission to view attendance for this meeting"
      );
    }

    // Get attendance with member details
    const attendanceWithDetails = meeting.attendance.map((record) => {
      const member = userDb.findById(record.memberId);
      return {
        ...record,
        member: member
          ? {
              id: member.id,
              firstName: member.firstName,
              lastName: member.lastName,
              email: member.email,
            }
          : null,
      };
    });

    return successResponse({
      meetingId: meeting.id,
      meetingTitle: meeting.title,
      meetingDate: meeting.meetingDate,
      attendance: attendanceWithDetails,
      totalMembers: attendanceWithDetails.length,
      presentCount: attendanceWithDetails.filter((a) => a.status === "PRESENT")
        .length,
      absentCount: attendanceWithDetails.filter((a) => a.status === "ABSENT")
        .length,
      excusedCount: attendanceWithDetails.filter((a) => a.status === "EXCUSED")
        .length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
*/

// Placeholder exports to prevent build errors
export async function POST() {
  return new Response(
    JSON.stringify({ error: "Attendance tracking temporarily disabled" }),
    {
      status: 501,
      headers: { "Content-Type": "application/json" },
    }
  );
}

export async function GET() {
  return new Response(
    JSON.stringify({ error: "Attendance tracking temporarily disabled" }),
    {
      status: 501,
      headers: { "Content-Type": "application/json" },
    }
  );
}
