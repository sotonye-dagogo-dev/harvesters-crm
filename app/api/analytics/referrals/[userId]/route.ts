import { NextRequest } from "next/server";
import { analyticsDb } from "@/lib/data/database";
import { getAuthenticatedUser } from "@/lib/utils/middleware";
import { successResponse, handleApiError } from "@/lib/utils/api";

// GET /api/analytics/referrals/[userId] - Get referral analytics for a user
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error) return error;

    const { userId } = await params;

    // Users can only see their own referral stats unless admin
    if (user?.id !== userId && user?.role !== "SUPERADMIN") {
      return successResponse(
        { error: "You can only view your own referral stats" },
        "Forbidden",
        403
      );
    }

    const stats = analyticsDb.getReferralStats(userId);

    return successResponse(stats);
  } catch (error) {
    return handleApiError(error);
  }
}
