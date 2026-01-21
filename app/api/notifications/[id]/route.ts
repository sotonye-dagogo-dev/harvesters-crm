import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/data/database";
import { getAuthenticatedUser } from "@/lib/utils/middleware";

export async function PUT(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error) return error;

    const { id } = await params;

    const notificationId = id;

    // Get notification
    const notification = db.notifications.findById(notificationId);
    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    // Check ownership
    if (notification.userId !== user!.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update notification
    const updated = db.notifications.markAsRead(notificationId);

    if (!updated) {
      return NextResponse.json(
        { error: "Failed to update notification" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating notification:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error) return error;

    const { id } = await params;

    const notificationId = id;

    // Get notification
    const notification = db.notifications.findById(notificationId);
    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    // Check ownership
    if (notification.userId !== user!.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete notification
    db.notifications.delete(notificationId);

    return NextResponse.json({ message: "Notification deleted" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
