import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/data/database";
import { getAuthenticatedUser } from "@/lib/utils/middleware";

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error) return error;

    if (user?.role !== "LEADER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { followUps } = await request.json();

    if (!followUps || !Array.isArray(followUps)) {
      return NextResponse.json(
        { error: "Invalid follow-ups data" },
        { status: 400 }
      );
    }

    // Create notifications for overdue follow-ups
    const notifications = followUps.map((followUp: any) => ({
      userId: user!.id,
      type: NotificationType.FOLLOW_UP_REMINDER,
      title: "Overdue Follow-up Reminder",
      message: `Follow-up with ${followUp.memberName} is ${followUp.daysOverdue} day${followUp.daysOverdue !== 1 ? "s" : ""} overdue`,
      resourceId: followUp.id,
    }));

    // Save notifications to database
    notifications.forEach((notification: any) => {
      db.notifications.create(
        notification.userId,
        notification.type,
        notification.title,
        notification.message,
        notification.resourceId
      );
    });

    return NextResponse.json({
      success: true,
      message: "Follow-up reminder notifications created",
      count: notifications.length,
    });
  } catch (error) {
    console.error("Error creating follow-up reminder notifications:", error);
    return NextResponse.json(
      { error: "Failed to create notifications" },
      { status: 500 }
    );
  }
}
