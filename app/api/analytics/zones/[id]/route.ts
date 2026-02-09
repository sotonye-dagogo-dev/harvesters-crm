import { NextRequest } from "next/server";
import { analyticsDb } from "@/lib/data/database";
import { getAuthenticatedUser } from "@/lib/utils/middleware";
import { successResponse, handleApiError } from "@/lib/utils/api";
import { USER_ROLES } from "@/lib/constants";

// GET /api/analytics/zones/[id] - Get zone analytics
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error) return error;

    const { id } = await params;

    // Check permissions
    const canView =
      user?.role === USER_ROLES.SUPERADMIN ||
      (user?.role === USER_ROLES.ZONAL_LEADER && user?.zoneId === id) ||
      user?.zoneId === id;

    if (!canView) {
      return successResponse(
        { error: "You don't have permission to view this zone's analytics" },
        "Forbidden",
        403
      );
    }

    const stats = analyticsDb.getZoneStats(id);

    return successResponse(stats);
  } catch (error) {
    return handleApiError(error);
  }
}
