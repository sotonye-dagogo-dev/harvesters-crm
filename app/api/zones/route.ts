import { NextRequest } from "next/server";
import { zoneDb } from "@/lib/data/database";
import { getAuthenticatedUser, requireRole } from "@/lib/utils/middleware";
import {
  successResponse,
  paginatedResponse,
  badRequestResponse,
  handleApiError,
} from "@/lib/utils/api";
import { USER_ROLES } from "@/lib/constants";
import { UserRole } from "@/lib/types";

// GET /api/zones - List zones
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error) return error;

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const search = searchParams.get("search") || undefined;
    const isActive = searchParams.get("isActive") === "true" ? true : undefined;

    // Build filters
    const filters = {
      search,
      isActive,
    };

    // Get zones based on role
    let allZones = zoneDb.findAll(filters);

    // Filter by permission
    if (user?.role === USER_ROLES.ZONAL_LEADER) {
      // Zonal leaders can only see their own zone
      allZones = allZones.filter((z) => z.id === user.zoneId);
    } else if (
      user?.role === USER_ROLES.CAMPUS_ADMIN ||
      user?.role === USER_ROLES.HOD ||
      user?.role === USER_ROLES.SMALL_GROUP_LEADER ||
      user?.role === USER_ROLES.CELL_LEADER ||
      user?.role === USER_ROLES.MEMBER
    ) {
      // Lower roles can only see their zone
      allZones = allZones.filter((z) => z.id === user.zoneId);
    }
    // Superadmins can see all zones

    const total = allZones.length;

    // Paginate
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedZones = allZones.slice(start, end);

    return paginatedResponse(paginatedZones, total, page, pageSize);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/zones - Create zone (Superadmin only)
export async function POST(request: NextRequest) {
  try {
    const { error } = await requireRole([USER_ROLES.SUPERADMIN as UserRole]);
    if (error) return error;

    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.description || !body.leaderId) {
      return badRequestResponse(
        "Missing required fields: name, description, leaderId"
      );
    }

    // Create zone
    const newZone = zoneDb.create({
      name: body.name,
      description: body.description,
      leaderId: body.leaderId,
      region: body.region,
    });

    return successResponse(newZone, "Zone created successfully", 201);
  } catch (error) {
    return handleApiError(error);
  }
}
