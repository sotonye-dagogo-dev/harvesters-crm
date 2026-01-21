import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/data/database";
import { getAuthenticatedUser } from "@/lib/utils/middleware";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error) return error;

    const { id } = await params;

    // Check if user can view this member's analytics
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Members can only view their own analytics
    // Leaders can view their group members' analytics
    // Superadmins can view all
    if (user.role === "MEMBER" && user.id !== id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const member = db.users.findById(id);
    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Get all meetings for member's group
    const meetings = member.groupId
      ? db.meetings.findAll({ groupId: member.groupId })
      : [];

    // Calculate attendance
    const attendedMeetings = meetings.filter((meeting: Meeting) =>
      meeting.attendeeIds?.includes(id)
    );
    const totalMeetings = meetings.length;
    const attendancePercentage =
      totalMeetings > 0 ? (attendedMeetings.length / totalMeetings) * 100 : 0;

    // Get interactions
    const interactions = db.interactions.findAll({ memberId: id });
    const lastInteraction =
      interactions.length > 0
        ? interactions.sort(
            (a, b) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          )[0]
        : null;

    // Calculate engagement score
    const daysSinceMembership = Math.floor(
      (new Date().getTime() - new Date(member.createdAt).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    const membershipScore = Math.min((daysSinceMembership / 365) * 100, 100);

    const interactionScore = Math.min(interactions.length * 5, 100);

    const engagementScore =
      attendancePercentage * 0.5 +
      interactionScore * 0.3 +
      membershipScore * 0.2;

    // Build recent activity
    const recentActivity: Array<{
      type: string;
      title: string;
      timestamp: Date;
      description?: string;
      id?: string;
      date?: Date | string;
      status?: string;
    }> = [];

    // Add recent meetings
    const recentMeetings = meetings
      .sort(
        (a: Meeting, b: Meeting) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
      )
      .slice(0, 5);

    recentMeetings.forEach((meeting: Meeting) => {
      recentActivity.push({
        id: meeting.id,
        type: "meeting",
        title: meeting.attendeeIds?.includes(id)
          ? "Attended group meeting"
          : "Missed group meeting",
        date: meeting.date,
        timestamp: new Date(meeting.date),
        status: meeting.attendeeIds?.includes(id) ? "attended" : "missed",
      });
    });

    // Add recent interactions
    const recentInteractions = interactions
      .sort(
        (a: Interaction, b: Interaction) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, 3);

    recentInteractions.forEach((interaction: Interaction) => {
      recentActivity.push({
        id: interaction.id,
        type: "interaction",
        title: `Leader ${interaction.type.toLowerCase()} - ${interaction.notes?.substring(0, 50) || ""}`,
        date: interaction.timestamp,
        timestamp: new Date(interaction.timestamp),
      });
    });

    // Sort all activity by date
    recentActivity.sort(
      (a: any, b: any) =>
        new Date(b.date || b.timestamp).getTime() -
        new Date(a.date || a.timestamp).getTime()
    );

    const analytics = {
      attendancePercentage: Math.round(attendancePercentage * 10) / 10,
      totalMeetings,
      attendedMeetings: attendedMeetings.length,
      missedMeetings: totalMeetings - attendedMeetings.length,
      interactionCount: interactions.length,
      lastInteractionDate: lastInteraction ? lastInteraction.timestamp : null,
      engagementScore: Math.round(engagementScore),
      memberSince: member.createdAt,
      recentActivity: recentActivity.slice(0, 10),
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error("Error fetching member analytics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
