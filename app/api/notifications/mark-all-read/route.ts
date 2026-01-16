import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/data/database";
import { verifyToken } from "@/lib/utils/auth";

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("accessToken")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.success) {
      return NextResponse.json(
        {
          error:
            decoded && !decoded.success ? decoded.message : "Invalid token",
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { notificationIds } = body;

    if (!Array.isArray(notificationIds)) {
      return NextResponse.json(
        { error: "Invalid notification IDs" },
        { status: 400 }
      );
    }

    // Mark all notifications as read
    notificationIds.forEach((id: string) => {
      const notification = db.notifications.findById(id);
      if (notification && notification.userId === decoded.userId) {
        db.notifications.markAsRead(id);
      }
    });

    return NextResponse.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
