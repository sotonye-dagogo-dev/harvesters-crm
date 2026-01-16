import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/data/database";
import { verifyToken } from "@/lib/utils/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get("accessToken")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.success) {
      return NextResponse.json(
        { error: decoded && !decoded.success ? decoded.message : "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const notificationId = id;
    const body = await request.json();
    const { read: _read } = body;

    // Get notification
    const notification = db.notifications.findById(notificationId);
    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    // Check ownership
    if (notification.userId !== decoded.userId) {
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
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get("accessToken")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.success) {
      return NextResponse.json(
        { error: decoded && !decoded.success ? decoded.message : \"Unauthorized\" },
        { status: 401 }
      );
    }

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
    if (notification.userId !== decoded.userId) {
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
