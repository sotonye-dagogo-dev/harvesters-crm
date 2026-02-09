import { NextRequest } from "next/server";
import { campusDb } from "@/lib/data/database";
import { getAuthenticatedUser } from "@/lib/utils/middleware";
import {
  successResponse,
  notFoundResponse,
  forbiddenResponse,
  handleApiError,
} from "@/lib/utils/api";
import { USER_ROLES } from "@/lib/constants";

// GET /api/campuses/[id]/details - Get campus with full details
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error) return error;

    const { id } = await params;
    const campusDetails = campusDb.getWithDetails(id);

    if (!campusDetails) {
      return notFoundResponse("Campus not found");
    }

    // Check permissions
    const canView =
      user?.role === USER_ROLES.SUPERADMIN ||
      (user?.role === USER_ROLES.ZONAL_LEADER &&
        user?.zoneId === campusDetails.zoneId) ||
      (user?.role === USER_ROLES.CAMPUS_ADMIN && user?.campusId === id) ||
      user?.campusId === id;

    if (!canView) {
      return forbiddenResponse("You don't have permission to view this campus");
    }

    return successResponse(campusDetails);
  } catch (error) {
    return handleApiError(error);
  }
}
