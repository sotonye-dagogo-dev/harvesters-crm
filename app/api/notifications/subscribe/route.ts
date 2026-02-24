import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/utils/middleware";

/**
 * POST /api/notifications/subscribe
 * Subscribe to push notifications
 */
export async function POST(_request: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error) return error;

    const subscription = await _request.json();

    // In a real app, you would save this subscription to the database
    // For now, we'll just store it in memory (mock implementation)
    console.log("[Push Notifications] User subscribed:", {
      userId: user!.id,
      endpoint: subscription.endpoint,
    });

    // In production, you'd save this to the database
    // const dbUser = db.users.findById(user.id);
    // if (dbUser) {
    //   dbUser.pushSubscriptions = [...(dbUser.pushSubscriptions || []), subscription];
    // }

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
