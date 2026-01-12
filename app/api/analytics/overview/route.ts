import { NextRequest } from "next/server";
import { userDb, groupDb, meetingDb, interactionDb } from "@/lib/data/database";
import { getAuthenticatedUser } from "@/lib/utils/middleware";
import {
  successResponse,
  forbiddenResponse,
  handleApiError,
} from "@/lib/utils/api";

// GET /api/analytics/overview - Get overview analytics
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser(request);
    if (error) return error;

    // Only superadmin can access overview analytics
    if (user?.role !== UserRole.SUPERADMIN) {
      return forbiddenResponse("You don't have permission to access analytics");
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Get all data
    const allUsers = userDb.findAll({});
    const allGroups = groupDb.findAll({});
    const allMeetings = meetingDb.findAll({});
    const allInteractions = interactionDb.findAll({});

    // Filter by date range if provided
    let meetings = allMeetings;
    let interactions = allInteractions;

    if (startDate && endDate) {
      meetings = allMeetings.filter((m) => {
        const meetingDate = new Date(m.date);
        return (
          meetingDate >= new Date(startDate) && meetingDate <= new Date(endDate)
        );
      });

      interactions = allInteractions.filter((i) => {
        const interactionDate = new Date(i.timestamp);
        return (
          interactionDate >= new Date(startDate) &&
          interactionDate <= new Date(endDate)
        );
      });
    }

    // Calculate statistics
    const activeUsers = allUsers.filter((u) => u.isActive).length;
    const activeGroups = allGroups.length; // All groups are active
    const totalMeetings = meetings.length;
    const totalInteractions = interactions.length;

    // Calculate average attendance using attendeeCount
    const meetingsWithAttendance = meetings.filter((m) => m.attendeeCount > 0);
    const totalAttendance = meetingsWithAttendance.reduce((sum, m) => {
      return sum + m.attendeeCount;
    }, 0);
    const avgAttendance =
      meetingsWithAttendance.length > 0
        ? totalAttendance / meetingsWithAttendance.length
        : 0;

    // Group engagement by type
    const interactionsByType = interactions.reduce(
      (acc, i) => {
        acc[i.type] = (acc[i.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Meeting frequency by group
    const meetingsByGroup = meetings.reduce(
      (acc, m) => {
        acc[m.groupId] = (acc[m.groupId] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const groupEngagement = allGroups.map((group) => {
      const groupMeetings = meetingsByGroup[group.id] || 0;
      const groupMembers = allUsers.filter(
        (u) => u.groupId === group.id
      ).length;

      return {
        groupId: group.id,
        groupName: group.name,
        totalMembers: groupMembers,
        totalMeetings: groupMeetings,
        meetingFrequency:
          groupMeetings > 0 && meetings.length > 0
            ? (groupMeetings / meetings.length) * 100
            : 0,
      };
    });

    return successResponse({
      overview: {
        totalUsers: allUsers.length,
        activeUsers,
        totalGroups: allGroups.length,
        activeGroups,
        totalMeetings,
        totalInteractions,
        averageAttendance: Math.round(avgAttendance * 100) / 100,
      },
      interactionsByType,
      groupEngagement,
      dateRange: startDate && endDate ? { startDate, endDate } : null,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
