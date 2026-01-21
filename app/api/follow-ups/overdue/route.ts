import { NextRequest } from "next/server";
import { db } from "@/lib/data/database";
import { getAuthenticatedUser } from "@/lib/utils/middleware";
import {
  handleApiError,
  successResponse,
  badRequestResponse,
} from "@/lib/utils/api";
import { differenceInDays } from "date-fns";

// GET /api/follow-ups/overdue - Get overdue follow-ups (members needing attention)
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error) return error;

    if (user?.role !== "LEADER" && user?.role !== "SUPERADMIN") {
      return badRequestResponse("Only leaders can access follow-up reminders");
    }

    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get("groupId") || user.groupId;

    if (!groupId) {
      return badRequestResponse("Group ID is required");
    }

    // Get group members
    const members = db.users.findAll({ groupId });
    const meetings = db.meetings.findAll({ groupId });
    const allInteractions = db.interactions.findAll();

    const followUpReminders: FollowUpReminder[] = [];
    const now = new Date();

    members.forEach((member) => {
      if (member.role !== "MEMBER") return;

      // Get member's attendance
      const memberMeetings = meetings.filter((m) =>
        m.attendeeIds.includes(member.id)
      );

      const lastMeeting = memberMeetings.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )[0];

      // Get member's interactions
      const memberInteractions = allInteractions.filter(
        (i) => i.memberId === member.id
      );

      const lastInteraction = memberInteractions.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )[0];

      const daysSinceLastMeeting = lastMeeting
        ? differenceInDays(now, new Date(lastMeeting.date))
        : 9999;

      const daysSinceLastInteraction = lastInteraction
        ? differenceInDays(now, new Date(lastInteraction.timestamp))
        : 9999;

      const daysSinceLastContact = Math.min(
        daysSinceLastMeeting,
        daysSinceLastInteraction
      );

      // Calculate attendance rate
      const attendanceRate =
        meetings.length > 0
          ? Math.round((memberMeetings.length / meetings.length) * 100)
          : 0;

      // Determine if member needs follow-up
      let status: "overdue" | "due_soon" | "at_risk" | null = null;
      let priority: "high" | "medium" | "low" = "low";

      if (daysSinceLastContact > 30 || attendanceRate < 30) {
        status = "overdue";
        priority = "high";
      } else if (daysSinceLastContact > 21 || attendanceRate < 50) {
        status = "due_soon";
        priority = "medium";
      } else if (daysSinceLastContact > 14 || attendanceRate < 70) {
        status = "at_risk";
        priority = "low";
      }

      if (status) {
        followUpReminders.push({
          id: `reminder-${member.id}`,
          memberId: member.id,
          memberName: `${member.firstName} ${member.lastName}`,
          groupId,
          lastMeetingDate: lastMeeting?.date,
          lastInteractionDate: lastInteraction?.timestamp,
          daysSinceLastContact,
          attendanceRate,
          status,
          priority,
        });
      }
    });

    // Sort by priority (high first) then days since last contact
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    followUpReminders.sort((a, b) => {
      if (a.priority !== b.priority) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return b.daysSinceLastContact - a.daysSinceLastContact;
    });

    return successResponse({
      followUpReminders,
      count: followUpReminders.length,
      summary: {
        overdue: followUpReminders.filter((f) => f.status === "overdue").length,
        dueSoon: followUpReminders.filter((f) => f.status === "due_soon")
          .length,
        atRisk: followUpReminders.filter((f) => f.status === "at_risk").length,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
