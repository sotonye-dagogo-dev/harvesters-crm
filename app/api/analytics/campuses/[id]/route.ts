import { NextRequest } from "next/server";
import { analyticsDb } from "@/lib/data/database";
import { getAuthenticatedUser } from "@/lib/utils/middleware";
import { successResponse, handleApiError } from "@/lib/utils/api";
import { USER_ROLES } from "@/lib/constants";

// GET /api/analytics/campuses/[id] - Get campus analytics
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
      (user?.role === USER_ROLES.ZONAL_LEADER && user?.campusId === id) ||
      (user?.role === USER_ROLES.CAMPUS_ADMIN && user?.campusId === id) ||
      user?.campusId === id;

    if (!canView) {
      return successResponse(
        { error: "You don't have permission to view this campus's analytics" },
        "Forbidden",
        403
      );
    }

    const stats = analyticsDb.getCampusStats(id);

    return successResponse(stats);
  } catch (error) {
    return handleApiError(error);
  }
}
