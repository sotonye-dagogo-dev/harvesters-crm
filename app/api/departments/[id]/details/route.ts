import { NextRequest } from "next/server";
import { departmentDb } from "@/lib/data/database";
import { getAuthenticatedUser } from "@/lib/utils/middleware";
import {
  successResponse,
  notFoundResponse,
  forbiddenResponse,
  handleApiError,
} from "@/lib/utils/api";
import { USER_ROLES } from "@/lib/constants";

// GET /api/departments/[id]/details - Get department with full details
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error) return error;

    const { id } = await params;
    const departmentDetails = departmentDb.getWithDetails(id);

    if (!departmentDetails) {
      return notFoundResponse("Department not found");
    }

    // Check permissions
    const canView =
      user?.role === USER_ROLES.SUPERADMIN ||
      (user?.role === USER_ROLES.ZONAL_LEADER &&
        user?.zoneId === departmentDetails.zoneId) ||
      (user?.role === USER_ROLES.CAMPUS_ADMIN &&
        user?.campusId === departmentDetails.campusId) ||
      (user?.role === USER_ROLES.HOD && user?.departmentId === id) ||
      user?.campusId === departmentDetails.campusId;

    if (!canView) {
      return forbiddenResponse(
        "You don't have permission to view this department"
      );
    }

    return successResponse(departmentDetails);
  } catch (error) {
    return handleApiError(error);
  }
}
