import { NextRequest } from "next/server";
import { userDb, meetingDb, interactionDb, groupDb } from "@/lib/data/database";
import { getAuthenticatedUser } from "@/lib/utils/middleware";
import {
  successResponse,
  notFoundResponse,
  forbiddenResponse,
  handleApiError,
} from "@/lib/utils/api";

// GET /api/analytics/members/[id] - Get member analytics
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await getAuthenticatedUser(request);
    if (error) return error;

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const member = userDb.findById(id);
    if (!member) {
      return notFoundResponse("Member not found");
    }

    // Check permissions
    const memberGroup = member.groupId
      ? groupDb.findById(member.groupId)
      : null;
    const canView =
      user?.role === UserRole.SUPERADMIN ||
      memberGroup?.leaderId === user?.id ||
      user?.id === id;

    if (!canView) {
      return forbiddenResponse(
        "You don't have permission to view analytics for this member"
      );
    }

    // Get member's group meetings
    let meetings = member.groupId
      ? meetingDb.findAll({ groupId: member.groupId })
      : [];
    let interactions = interactionDb.findAll({ memberId: id });

    // Filter by date range if provided
    if (startDate && endDate) {
      meetings = meetings.filter((m) => {
        const meetingDate = new Date(m.date);
        return (
          meetingDate >= new Date(startDate) && meetingDate <= new Date(endDate)
        );
      });

      interactions = interactions.filter((i) => {
        const interactionDate = new Date(i.timestamp);
        return (
          interactionDate >= new Date(startDate) &&
          interactionDate <= new Date(endDate)
        );
      });
    }

    // Calculate attendance statistics using attendeeIds
    const meetingsAttended = meetings.filter((m) =>
      m.attendeeIds.includes(id)
    ).length;

    const meetingsAbsent = meetings.length - meetingsAttended;
    const meetingsExcused = 0; // Not tracked in current structure

    const attendanceRate =
      meetings.length > 0 ? (meetingsAttended / meetings.length) * 100 : 0;

    // Attendance history (simplified without detailed status)
    const attendanceHistory = meetings
      .filter((m) => m.attendeeIds.includes(id))
      .map((m) => {
        return {
          meetingId: m.id,
          meetingDate: m.date,
          status: "PRESENT", // Simplified - if in attendeeIds, they were present
          notes: m.notes,
        };
      })
      .sort(
        (a, b) =>
          new Date(b.meetingDate).getTime() - new Date(a.meetingDate).getTime()
      );

    // Interaction breakdown
    const interactionsByType = interactions.reduce(
      (acc, i) => {
        acc[i.type] = (acc[i.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Recent interactions
    const recentInteractions = interactions
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, 10)
      .map((i) => {
        const leader = userDb.findById(i.leaderId);
        return {
          id: i.id,
          type: i.type,
          date: i.timestamp,
          notes: i.notes,
          leader: leader
            ? {
                id: leader.id,
                name: `${leader.firstName} ${leader.lastName}`,
              }
            : null,
        };
      });

    // Engagement trends (last 6 meetings)
    const recentMeetings = meetings
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 6);

    const engagementTrend = recentMeetings.map((m) => {
      return {
        date: m.date,
        attended: m.attendeeIds.includes(id),
      };
    });

    // Calculate engagement score (0-100)
    const engagementScore = Math.round(
      attendanceRate * 0.7 +
        Math.min((interactions.length / 5) * 100, 100) * 0.3
    );

    // Determine engagement level
    let engagementLevel: "HIGH" | "MEDIUM" | "LOW" | "AT_RISK";
    if (engagementScore >= 80) engagementLevel = "HIGH";
    else if (engagementScore >= 60) engagementLevel = "MEDIUM";
    else if (engagementScore >= 40) engagementLevel = "LOW";
    else engagementLevel = "AT_RISK";

    return successResponse({
      member: {
        id: member.id,
        firstName: member.firstName,
        lastName: member.lastName,
        email: member.email,
        phone: member.phone,
        groupId: member.groupId,
        groupName: memberGroup?.name,
      },
      summary: {
        totalMeetings: meetings.length,
        meetingsAttended,
        meetingsAbsent,
        meetingsExcused,
        attendanceRate: Math.round(attendanceRate * 100) / 100,
        totalInteractions: interactions.length,
        engagementScore,
        engagementLevel,
      },
      attendanceHistory,
      interactionsByType,
      recentInteractions,
      engagementTrend: engagementTrend.reverse(),
      dateRange: startDate && endDate ? { startDate, endDate } : null,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
