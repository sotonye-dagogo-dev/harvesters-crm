import { NextRequest } from "next/server";
import { zoneDb } from "@/lib/data/database";
import { getAuthenticatedUser } from "@/lib/utils/middleware";
import {
  successResponse,
  notFoundResponse,
  forbiddenResponse,
  handleApiError,
} from "@/lib/utils/api";
import { USER_ROLES } from "@/lib/constants";

// GET /api/zones/[id]/details - Get zone with full details
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error) return error;

    const { id } = await params;
    const zoneDetails = zoneDb.getWithDetails(id);

    if (!zoneDetails) {
      return notFoundResponse("Zone not found");
    }

    // Check permissions
    const canView =
      user?.role === USER_ROLES.SUPERADMIN ||
      (user?.role === USER_ROLES.ZONAL_LEADER && user?.zoneId === id) ||
      user?.zoneId === id;

    if (!canView) {
      return forbiddenResponse("You don't have permission to view this zone");
    }

    return successResponse(zoneDetails);
  } catch (error) {
    return handleApiError(error);
  }
}
