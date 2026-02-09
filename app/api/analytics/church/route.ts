import { UserRole } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/data/database";
import { differenceInDays } from "date-fns";
import { getAuthenticatedUser } from "@/lib/utils/middleware";

export async function GET(_request: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error) return error;

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Permission check: Only superadmins
    if (user.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get all users, groups, and meetings
    const allUsers = db.users.findAll({});
    const allGroups = db.groups.findAll({});
    const allMeetings = db.meetings.findAll({});

    // Calculate engagement scores for all members
    const memberEngagementScores = allUsers
      .filter((u) => u.role === "MEMBER" || u.role === UserRole.SMALL_GROUP_LEADER)
      .map((member) => {
        const memberMeetings = allMeetings.filter(
          (m) =>
            m.attendeeIds.includes(member.id) && member.groupId === m.groupId
        );
        const groupMeetings = allMeetings.filter(
          (m) => m.groupId === member.groupId
        );
        const attendanceRate =
          groupMeetings.length > 0
            ? (memberMeetings.length / groupMeetings.length) * 100
            : 0;

        const interactions = db.interactions.findAll({ memberId: member.id });
        const interactionScore = Math.min(interactions.length * 5, 100);

        const daysSinceMembership = differenceInDays(
          new Date(),
          new Date(member.createdAt)
        );
        const membershipScore = Math.min(
          (daysSinceMembership / 365) * 100,
          100
        );

        const engagementScore = Math.round(
          attendanceRate * 0.5 + interactionScore * 0.3 + membershipScore * 0.2
        );

        return { member, engagementScore, attendanceRate };
      });

    // Count active, inactive, and at-risk members
    const activeMembers = memberEngagementScores.filter(
      (m: { attendanceRate: number }) => m.attendanceRate >= 60
    ).length;
    const inactiveMembers = memberEngagementScores.filter(
      (m: { attendanceRate: number }) => m.attendanceRate === 0
    ).length;
    const atRiskMembers = memberEngagementScores.filter(
      (m: { engagementScore: number }) => m.engagementScore < 40
    ).length;

    // Calculate overall engagement
    const totalEngagement = memberEngagementScores.reduce(
      (sum: number, m: { engagementScore: number }) => sum + m.engagementScore,
      0
    );
    const overallEngagement =
      memberEngagementScores.length > 0
        ? totalEngagement / memberEngagementScores.length
        : 0;

    // Calculate group performance
    const groupPerformance = allGroups.map((group: Group) => {
      const groupMembers = allUsers.filter((u: User) => u.groupId === group.id);
      const groupMeetings = allMeetings.filter(
        (m: Meeting) => m.groupId === group.id
      );

      // Calculate average attendance
      const totalAttendance = groupMeetings.reduce(
        (sum: number, m: Meeting) => sum + m.attendeeIds.length,
        0
      );
      const averageAttendance =
        groupMeetings.length > 0 && groupMembers.length > 0
          ? (totalAttendance / groupMeetings.length / groupMembers.length) * 100
          : 0;

      // Count active and at-risk members in this group
      const groupMemberScores = memberEngagementScores.filter((m: any) =>
        groupMembers.some((gm: User) => gm.id === m.member.id)
      );
      const activeInGroup = groupMemberScores.filter(
        (m: { attendanceRate: number }) => m.attendanceRate >= 60
      ).length;
      const atRiskInGroup = groupMemberScores.filter(
        (m: { engagementScore: number }) => m.engagementScore < 40
      ).length;

      // Calculate performance score (weighted average)
      const meetingConsistency = calculateMeetingConsistency(
        group,
        groupMeetings
      );
      const avgEngagement =
        groupMemberScores.length > 0
          ? groupMemberScores.reduce(
              (sum: number, m: { engagementScore: number }) =>
                sum + m.engagementScore,
              0
            ) / groupMemberScores.length
          : 0;

      const performanceScore = Math.round(
        averageAttendance * 0.4 + meetingConsistency * 0.3 + avgEngagement * 0.3
      );

      // Calculate trend
      const trend = calculateGroupTrend(groupMeetings);

      return {
        group,
        memberCount: groupMembers.length,
        meetingCount: groupMeetings.length,
        averageAttendance,
        activeMembers: activeInGroup,
        atRiskMembers: atRiskInGroup,
        performanceScore,
        trend,
      };
    });

    return NextResponse.json({
      totalMembers: memberEngagementScores.length,
      totalGroups: allGroups.length,
      totalMeetings: allMeetings.length,
      overallEngagement,
      activeMembers,
      inactiveMembers,
      atRiskMembers,
      groupPerformance: groupPerformance.sort(
        (a: any, b: any) => b.performanceScore - a.performanceScore
      ),
    });
  } catch (error) {
    console.error("Error fetching church analytics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function calculateMeetingConsistency(
  group: Group,
  meetings: Meeting[]
): number {
  if (meetings.length === 0) return 0;

  const sortedMeetings = meetings.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const firstMeeting = new Date(sortedMeetings[0].date);
  const lastMeeting = new Date(sortedMeetings[sortedMeetings.length - 1].date);
  const daysBetween = differenceInDays(lastMeeting, firstMeeting);

  if (daysBetween === 0) return 100;

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

  const consistency = (meetings.length / expectedMeetings) * 100;
  return Math.min(consistency, 100);
}

function calculateGroupTrend(
  meetings: Meeting[]
): "improving" | "stable" | "declining" {
  if (meetings.length < 4) return "stable";

  const now = new Date();
  const threeMonthsAgo = new Date(now);
  threeMonthsAgo.setMonth(now.getMonth() - 3);
  const sixMonthsAgo = new Date(now);
  sixMonthsAgo.setMonth(now.getMonth() - 6);

  const recentMeetings = meetings.filter(
    (m) => new Date(m.date) >= threeMonthsAgo
  );
  const previousMeetings = meetings.filter((m) => {
    const date = new Date(m.date);
    return date >= sixMonthsAgo && date < threeMonthsAgo;
  });

  if (recentMeetings.length === 0 || previousMeetings.length === 0) {
    return "stable";
  }

  const recentAvgAttendance =
    recentMeetings.reduce((sum, m) => sum + m.attendeeIds.length, 0) /
    recentMeetings.length;
  const previousAvgAttendance =
    previousMeetings.reduce((sum, m) => sum + m.attendeeIds.length, 0) /
    previousMeetings.length;

  const difference = recentAvgAttendance - previousAvgAttendance;

  if (Math.abs(difference) < 0.5) return "stable";

  return difference > 0 ? "improving" : "declining";
}
