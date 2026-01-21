import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/utils/middleware";

/**
 * POST /api/notifications/unsubscribe
 * Unsubscribe from push notifications
 */
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error) return error;

    const { endpoint } = await request.json();

    // In a real app, you would remove this subscription from the database
    console.log("[Push Notifications] User unsubscribed:", {
      userId: user!.id,
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
