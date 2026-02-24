import { NextRequest } from "next/server";
import { campusDb } from "@/lib/data/database";
import { getAuthenticatedUser, requireRole } from "@/lib/utils/middleware";
import {
  successResponse,
  paginatedResponse,
  badRequestResponse,
  handleApiError,
} from "@/lib/utils/api";
import { USER_ROLES } from "@/lib/constants";
import { UserRole } from "@/lib/types";

// GET /api/campuses - List campuses
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error) return error;

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const search = searchParams.get("search") || undefined;
    const parentId = searchParams.get("parentId") || undefined;
    const isActive = searchParams.get("isActive") === "true" ? true : undefined;

    // Build filters
    const filters = {
      search,
      parentId,
      isActive,
    };

    // Get campuses based on role
    let allCampuses = campusDb.findAll(filters);

    // Filter by permission
    if (user?.role === USER_ROLES.ZONAL_LEADER) {
      // Zonal leaders can see campuses in their zone
      allCampuses = allCampuses.filter((c) => c.parentId === user.zoneId);
    } else if (user?.role === USER_ROLES.CAMPUS_ADMIN) {
      // Campus admins can only see their own campus
      allCampuses = allCampuses.filter((c) => c.id === user.campusId);
    } else if (
      user?.role === USER_ROLES.HOD ||
      user?.role === USER_ROLES.SMALL_GROUP_LEADER ||
      user?.role === USER_ROLES.CELL_LEADER ||
      user?.role === USER_ROLES.MEMBER
    ) {
      // Lower roles can only see their campus
      allCampuses = allCampuses.filter((c) => c.id === user.campusId);
    }
    // Superadmins can see all campuses

    const total = allCampuses.length;

    // Paginate
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedCampuses = allCampuses.slice(start, end);

    return paginatedResponse(paginatedCampuses, total, page, pageSize);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/campuses - Create campus (Superadmin, Zonal Leader)
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await requireRole([
      USER_ROLES.SUPERADMIN as UserRole,
      USER_ROLES.ZONAL_LEADER as UserRole,
    ]);
    if (error) return error;

    const body = await request.json();

    // Validate required fields
    if (
      !body.name ||
      !body.description ||
      !body.location ||
      !body.country ||
      !body.parentId ||
      !body.adminId
    ) {
      return badRequestResponse(
        "Missing required fields: name, description, location, country, parentId, adminId"
      );
    }

    // If zonal leader is creating, campus must be in their zone
    if (user?.role === USER_ROLES.ZONAL_LEADER && body.parentId !== user.zoneId) {
      return badRequestResponse(
        "Zonal leaders can only create campuses in their own zone"
      );
    }

    // Create campus with parentId pointing to the org group
    const newCampus = campusDb.create({
      name: body.name,
      description: body.description,
      location: body.location,
      country: body.country,
      parentId: body.parentId,
      adminId: body.adminId,
    });

    return successResponse(newCampus, "Campus created successfully", 201);
  } catch (error) {
    return handleApiError(error);
  }
}
