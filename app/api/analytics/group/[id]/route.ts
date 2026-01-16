import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/utils/auth";
import { db } from "@/lib/data/database";
import { differenceInDays } from "date-fns";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await verifyToken(token.value);
    if (!decoded || !decoded.success) {
      return NextResponse.json(
        {
          error: decoded && !decoded.success ? decoded.message : "Unauthorized",
        },
        { status: 401 }
      );
    }

    const { id } = await params;

    const user = db.users.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const group = db.groups.findById(id);

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // Permission check: Only leaders of the group or superadmins
    if (
      user.role !== "SUPERADMIN" &&
      (user.role !== "LEADER" || user.groupId !== id)
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get all members in the group
    const members = db.users.findAll({ groupId: id });

    // Get all meetings for the group
    const meetings = db.meetings.findAll({ groupId: id });

    // Calculate meeting frequency adherence
    const meetingFrequencyAdherence = calculateMeetingFrequencyAdherence(
      group,
      meetings
    );

    // Calculate recent trend (last 3 months vs previous 3 months)
    const recentTrend = calculateRecentTrend(meetings);

    // Calculate member performance
    const memberPerformance = members.map((member: User) => {
      const memberMeetings = meetings.filter((m: Meeting) =>
        m.attendeeIds.includes(member.id)
      );
      const attendanceRate =
        meetings.length > 0
          ? (memberMeetings.length / meetings.length) * 100
          : 0;

      // Get member interactions for engagement score
      const interactions = db.interactions.findAll({ memberId: member.id });

      // Calculate engagement score
      const interactionScore = Math.min(interactions.length * 5, 100);
      const daysSinceMembership = differenceInDays(
        new Date(),
        new Date(member.createdAt)
      );
      const membershipScore = Math.min((daysSinceMembership / 365) * 100, 100);

      const engagementScore = Math.round(
        attendanceRate * 0.5 + interactionScore * 0.3 + membershipScore * 0.2
      );

      // Determine status
      let status: "excellent" | "good" | "fair" | "at-risk";
      if (engagementScore >= 80) status = "excellent";
      else if (engagementScore >= 60) status = "good";
      else if (engagementScore >= 40) status = "fair";
      else status = "at-risk";

      return {
        member,
        attendanceRate,
        meetingsAttended: memberMeetings.length,
        totalMeetings: meetings.length,
        engagementScore,
        status,
      };
    });

    // Count active and at-risk members
    const activeMembers = memberPerformance.filter(
      (m: { attendanceRate: number; engagementScore: number }) =>
        m.attendanceRate >= 60
    ).length;
    const atRiskMembers = memberPerformance.filter(
      (m: { attendanceRate: number; engagementScore: number }) =>
        m.engagementScore < 40
    ).length;

    // Calculate average attendance
    const totalAttendance = meetings.reduce(
      (sum: number, m: Meeting) => sum + m.attendeeIds.length,
      0
    );
    const averageAttendance =
      meetings.length > 0 && members.length > 0
        ? (totalAttendance / meetings.length / members.length) * 100
        : 0;

    return NextResponse.json({
      groupName: group.name,
      totalMembers: members.length,
      activeMembers,
      atRiskMembers,
      averageAttendance,
      totalMeetings: meetings.length,
      meetingFrequencyAdherence,
      memberPerformance: memberPerformance.sort(
        (a, b) => b.engagementScore - a.engagementScore
      ),
      recentTrend,
    });
  } catch (error) {
    console.error("Error fetching group analytics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function calculateMeetingFrequencyAdherence(
  group: Group,
  meetings: Meeting[]
): number {
  if (meetings.length === 0) return 0;

  // Get date range
  const sortedMeetings = meetings.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const firstMeeting = new Date(sortedMeetings[0].date);
  const lastMeeting = new Date(sortedMeetings[sortedMeetings.length - 1].date);
  const daysBetween = differenceInDays(lastMeeting, firstMeeting);

  if (daysBetween === 0) return 100;

  // Calculate expected meetings based on frequency
  let expectedMeetings = 0;
  switch (group.meetingFrequency) {
    case "WEEKLY":
      expectedMeetings = Math.floor(daysBetween / 7) + 1;
      break;
    case "BIWEEKLY":
      expectedMeetings = Math.floor(daysBetween / 14) + 1;
      break;
    case "MONTHLY":
      expectedMeetings = Math.floor(daysBetween / 30) + 1;
      break;
  }

  if (expectedMeetings === 0) return 100;

  const adherence = (meetings.length / expectedMeetings) * 100;
  return Math.min(adherence, 100);
}

function calculateRecentTrend(
  meetings: Meeting[]
): "improving" | "stable" | "declining" {
  if (meetings.length < 4) return "stable";

  const now = new Date();
  const threeMonthsAgo = new Date(now);
  threeMonthsAgo.setMonth(now.getMonth() - 3);
  const sixMonthsAgo = new Date(now);
  sixMonthsAgo.setMonth(now.getMonth() - 6);

  // Get recent meetings (last 3 months)
  const recentMeetings = meetings.filter(
    (m) => new Date(m.date) >= threeMonthsAgo
  );

  // Get previous meetings (3-6 months ago)
  const previousMeetings = meetings.filter((m) => {
    const date = new Date(m.date);
    return date >= sixMonthsAgo && date < threeMonthsAgo;
  });

  if (recentMeetings.length === 0 || previousMeetings.length === 0) {
    return "stable";
  }

  // Calculate average attendance rate for each period
  const recentAvgAttendance =
    recentMeetings.reduce((sum, m) => sum + m.attendeeIds.length, 0) /
    recentMeetings.length;
  const previousAvgAttendance =
    previousMeetings.reduce((sum, m) => sum + m.attendeeIds.length, 0) /
    previousMeetings.length;

  const difference = recentAvgAttendance - previousAvgAttendance;

  // Consider stable if difference is within 5%
  if (Math.abs(difference) < 0.5) return "stable";

  return difference > 0 ? "improving" : "declining";
}
