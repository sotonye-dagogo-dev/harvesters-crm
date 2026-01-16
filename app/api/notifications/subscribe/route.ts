import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/utils/auth";
import { db } from "@/lib/data/database";

/**
 * POST /api/notifications/subscribe
 * Subscribe to push notifications
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

    const subscription = await request.json();

    // In a real app, you would save this subscription to the database
    // For now, we'll just store it in memory (mock implementation)
    console.log("[Push Notifications] User subscribed:", {
      userId: decoded.userId,
      endpoint: subscription.endpoint,
    });

    // Mock: Add to user's push subscriptions
    const user = db.users.findById(decoded.userId);
    if (user) {
      // In production, you'd save this to the database
      // user.pushSubscriptions = [...(user.pushSubscriptions || []), subscription];
    }

    return NextResponse.json({
      message: "Successfully subscribed to push notifications",
    });
  } catch (error) {
    console.error("Error subscribing to push notifications:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
