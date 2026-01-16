import { NextRequest } from "next/server";
import { groupDb, userDb, meetingDb, interactionDb } from "@/lib/data/database";
import { getAuthenticatedUser } from "@/lib/utils/middleware";
import {
  successResponse,
  notFoundResponse,
  forbiddenResponse,
  handleApiError,
} from "@/lib/utils/api";
import { USER_ROLES } from "@/lib/constants";

// GET /api/analytics/groups/[id] - Get group analytics
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error) return error;

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const group = groupDb.findById(id);
    if (!group) {
      return notFoundResponse("Group not found");
    }

    // Check permissions
    const canView =
      user?.role === USER_ROLES.SUPERADMIN || group.leaderId === user?.id;

    if (!canView) {
      return forbiddenResponse(
        "You don't have permission to view analytics for this group"
      );
    }

    // Get group data
    const members = userDb.findAll({ groupId: id });
    let meetings = meetingDb.findAll({ groupId: id });
    let interactions = interactionDb.findAll({});

    // Filter by date range if provided
    if (startDate && endDate) {
      meetings = meetings.filter((m) => {
        const meetingDate = new Date(m.date);
        return (
          meetingDate >= new Date(startDate) && meetingDate <= new Date(endDate)
        );
      });

      interactions = interactions.filter((i) => {
        const member = members.find((m) => m.id === i.memberId);
        if (!member) return false;

        const interactionDate = new Date(i.timestamp);
        return (
          interactionDate >= new Date(startDate) &&
          interactionDate <= new Date(endDate)
        );
      });
    }

    // Filter interactions for group members
    const groupInteractions = interactions.filter((i) =>
      members.some((m) => m.id === i.memberId)
    );

    // Calculate member engagement
    const memberEngagement = members.map((member) => {
      // Count meetings attended using attendeeIds
      const meetingsAttended = meetings.filter((m) =>
        m.attendeeIds.includes(member.id)
      ).length;

      // Count interactions
      const memberInteractions = groupInteractions.filter(
        (i) => i.memberId === member.id
      ).length;

      // Calculate attendance rate
      const attendanceRate =
        meetings.length > 0 ? (meetingsAttended / meetings.length) * 100 : 0;

      return {
        memberId: member.id,
        memberName: `${member.firstName} ${member.lastName}`,
        totalMeetings: meetings.length,
        meetingsAttended,
        attendanceRate: Math.round(attendanceRate * 100) / 100,
        totalInteractions: memberInteractions,
        lastAttendance: meetings
          .filter((m) => m.attendeeIds.includes(member.id))
          .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          )[0]?.date,
      };
    });

    // Sort by attendance rate
    memberEngagement.sort((a, b) => b.attendanceRate - a.attendanceRate);

    // Calculate overall statistics
    const totalMeetings = meetings.length;
    const averageAttendance =
      meetings.length > 0
        ? meetings.reduce((sum, m) => {
            return sum + m.attendeeCount;
          }, 0) / meetings.length
        : 0;

    // Interaction breakdown
    const interactionsByType = groupInteractions.reduce(
      (acc, i) => {
        acc[i.type] = (acc[i.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Identify at-risk members (low attendance)
    const atRiskMembers = memberEngagement.filter(
      (m) => m.attendanceRate < 50 && totalMeetings >= 3
    );

    // Identify highly engaged members
    const highlyEngagedMembers = memberEngagement.filter(
      (m) => m.attendanceRate >= 80 && m.totalInteractions >= 2
    );

    return successResponse({
      group: {
        id: group.id,
        name: group.name,
        description: group.description,
        leader: {
          id: group.leaderId,
          name: userDb.findById(group.leaderId)
            ? `${userDb.findById(group.leaderId)!.firstName} ${
                userDb.findById(group.leaderId)!.lastName
              }`
            : "Unknown",
        },
      },
      summary: {
        totalMembers: members.length,
        totalMeetings,
        totalInteractions: groupInteractions.length,
        averageAttendance: Math.round(averageAttendance * 100) / 100,
        attendanceRate:
          members.length > 0 && totalMeetings > 0
            ? Math.round((averageAttendance / members.length) * 100 * 100) / 100
            : 0,
      },
      memberEngagement,
      interactionsByType,
      atRiskMembers: atRiskMembers.map((m) => ({
        memberId: m.memberId,
        memberName: m.memberName,
        attendanceRate: m.attendanceRate,
        lastAttendance: m.lastAttendance,
      })),
      highlyEngagedMembers: highlyEngagedMembers.map((m) => ({
        memberId: m.memberId,
        memberName: m.memberName,
        attendanceRate: m.attendanceRate,
        totalInteractions: m.totalInteractions,
      })),
      dateRange: startDate && endDate ? { startDate, endDate } : null,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
