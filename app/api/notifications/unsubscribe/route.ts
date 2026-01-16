import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/utils/auth";

/**
 * POST /api/notifications/unsubscribe
 * Unsubscribe from push notifications
 */
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
          error: decoded && !decoded.success ? decoded.message : "Unauthorized",
        },
        { status: 401 }
      );
    }

    const { endpoint } = await request.json();

    // In a real app, you would remove this subscription from the database
    console.log("[Push Notifications] User unsubscribed:", {
      userId: decoded.userId,
      endpoint,
    });

    return NextResponse.json({
      message: "Successfully unsubscribed from push notifications",
    });
  } catch (error) {
    console.error("Error unsubscribing from push notifications:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
