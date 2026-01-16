import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/data/database";
import { getAuthenticatedUser } from "@/lib/utils/middleware";
import { handleApiError, successResponse } from "@/lib/utils/api";
import { differenceInDays } from "date-fns";

interface InactiveMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  daysSinceLastMeeting: number;
  daysSinceLastInteraction: number;
  attendanceRate: number;
  riskLevel: "high" | "medium" | "low";
  lastMeetingDate: string | null;
  lastInteractionDate: string | null;
  pendingFollowUp: boolean;
}

// GET /api/follow-ups/inactive - Get list of inactive members
export async function GET(_request: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error) return error;

    if (user?.role !== "LEADER" && user?.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get leader's group members
    const groupMembers =
      user.role === "LEADER"
        ? db.users.findAll({ groupId: user.groupId })
        : db.users.findAll();

    // Get all meetings and interactions
    const allMeetings = db.meetings.findAll();
    const allInteractions = db.interactions.findAll();

    const inactiveMembers: InactiveMember[] = [];
    const now = new Date();

    groupMembers.forEach((member) => {
      if (member.role !== "MEMBER") return;

      // Calculate days since last meeting attendance
      const memberMeetings = allMeetings.filter(
        (m) =>
          m.groupId === member.groupId && m.attendeeIds?.includes(member.id)
      );

      const lastMeeting = memberMeetings.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )[0];

      const daysSinceLastMeeting = lastMeeting
        ? differenceInDays(now, new Date(lastMeeting.date))
        : 9999;

      // Calculate days since last interaction
      const memberInteractions = allInteractions.filter(
        (i) => i.memberId === member.id
      );

      const lastInteraction = memberInteractions.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )[0];

      const daysSinceLastInteraction = lastInteraction
        ? differenceInDays(now, new Date(lastInteraction.timestamp))
        : 9999;

      // Calculate attendance rate
      const groupMeetings = allMeetings.filter(
        (m) => m.groupId === member.groupId
      );
      const attendanceRate =
        groupMeetings.length > 0
          ? Math.round((memberMeetings.length / groupMeetings.length) * 100)
          : 0;

      // Determine risk level
      let riskLevel: "high" | "medium" | "low" = "low";

      if (
        daysSinceLastMeeting > 45 ||
        (daysSinceLastMeeting > 30 && attendanceRate < 30)
      ) {
        riskLevel = "high";
      } else if (
        daysSinceLastMeeting > 21 ||
        (daysSinceLastInteraction > 30 && attendanceRate < 60)
      ) {
        riskLevel = "medium";
      }

      // Only include members who meet inactive criteria
      if (daysSinceLastMeeting > 21 || attendanceRate < 60) {
        inactiveMembers.push({
          id: member.id,
          firstName: member.firstName,
          lastName: member.lastName,
          email: member.email,
          phone: member.phone || "",
          daysSinceLastMeeting,
          daysSinceLastInteraction,
          attendanceRate,
          riskLevel,
          lastMeetingDate: lastMeeting ? lastMeeting.date : null,
          lastInteractionDate: lastInteraction
            ? lastInteraction.timestamp.toString()
            : null,
          pendingFollowUp: false, // Would check follow-ups table in production
        });
      }
    });

    // Sort by risk level (high first) then by days inactive
    inactiveMembers.sort((a, b) => {
      const riskOrder = { high: 3, medium: 2, low: 1 };
      if (riskOrder[b.riskLevel] !== riskOrder[a.riskLevel]) {
        return riskOrder[b.riskLevel] - riskOrder[a.riskLevel];
      }
      return b.daysSinceLastMeeting - a.daysSinceLastMeeting;
    });

    return successResponse({ inactiveMembers });
  } catch (error) {
    return handleApiError(error);
  }
}
