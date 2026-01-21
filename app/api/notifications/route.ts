import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/data/database";
import { getAuthenticatedUser } from "@/lib/utils/middleware";

export async function GET() {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error) return error;

    // Get all notifications for the user
    const notifications = db.notifications.findByUserId(user!.id);

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error } = await getAuthenticatedUser();
    if (error) return error;

    const body = await request.json();
    const { userId, type, title, message, relatedId } = body;

    // Validate required fields
    if (!userId || !type || !title || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create notification
    const notification = db.notifications.create(
      userId,
      type,
      title,
      message,
      relatedId
    );

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
