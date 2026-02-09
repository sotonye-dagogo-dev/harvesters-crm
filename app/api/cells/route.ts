import { NextRequest } from "next/server";
import { cellDb } from "@/lib/data/database";
import { getAuthenticatedUser, requireRole } from "@/lib/utils/middleware";
import {
  successResponse,
  paginatedResponse,
  badRequestResponse,
  handleApiError,
} from "@/lib/utils/api";
import { USER_ROLES } from "@/lib/constants";
import { UserRole, MeetingFrequency } from "@/lib/types";

// GET /api/cells - List cells
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error) return error;

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const search = searchParams.get("search") || undefined;
    const groupId = searchParams.get("groupId") || undefined;
    const campusId = searchParams.get("campusId") || undefined;
    const zoneId = searchParams.get("zoneId") || undefined;
    const departmentId = searchParams.get("departmentId") || undefined;
    const leaderId = searchParams.get("leaderId") || undefined;
    const isActive = searchParams.get("isActive") === "true" ? true : undefined;

    // Build filters
    const filters = {
      search,
      groupId,
      campusId,
      zoneId,
      departmentId,
      leaderId,
      isActive,
    };

    // Get cells based on role
    let allCells = cellDb.findAll(filters);

    // Filter by permission
    if (user?.role === USER_ROLES.ZONAL_LEADER) {
      allCells = allCells.filter((c) => c.zoneId === user.zoneId);
    } else if (user?.role === USER_ROLES.CAMPUS_ADMIN) {
      allCells = allCells.filter((c) => c.campusId === user.campusId);
    } else if (user?.role === USER_ROLES.HOD) {
      allCells = allCells.filter((c) => c.campusId === user.campusId);
    } else if (user?.role === USER_ROLES.SMALL_GROUP_LEADER) {
      allCells = allCells.filter((c) => c.groupId === user.groupId);
    } else if (user?.role === USER_ROLES.CELL_LEADER) {
      allCells = allCells.filter(
        (c) => c.leaderId === user.id || c.id === user.cellId
      );
    } else if (user?.role === USER_ROLES.MEMBER) {
      allCells = allCells.filter((c) => c.id === user.cellId);
    }
    // Superadmins can see all cells

    const total = allCells.length;

    // Paginate
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedCells = allCells.slice(start, end);

    return paginatedResponse(paginatedCells, total, page, pageSize);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/cells - Create cell (Superadmin, Zonal Leader, Campus Admin, HOD, Small Group Leader)
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await requireRole([
      USER_ROLES.SUPERADMIN as UserRole,
      USER_ROLES.ZONAL_LEADER as UserRole,
      USER_ROLES.CAMPUS_ADMIN as UserRole,
      USER_ROLES.HOD as UserRole,
      USER_ROLES.SMALL_GROUP_LEADER as UserRole,
    ]);
    if (error) return error;

    const body = await request.json();

    // Validate required fields
    if (
      !body.name ||
      !body.description ||
      !body.campusId ||
      !body.zoneId ||
      !body.groupId ||
      !body.leaderId ||
      !body.meetingFrequency
    ) {
      return badRequestResponse(
        "Missing required fields: name, description, campusId, zoneId, groupId, leaderId, meetingFrequency"
      );
    }

    // Permission checks
    if (user?.role === USER_ROLES.ZONAL_LEADER && body.zoneId !== user.zoneId) {
      return badRequestResponse(
        "Zonal leaders can only create cells in their own zone"
      );
    }

    if (
      user?.role === USER_ROLES.CAMPUS_ADMIN &&
      body.campusId !== user.campusId
    ) {
      return badRequestResponse(
        "Campus admins can only create cells in their own campus"
      );
    }

    if (user?.role === USER_ROLES.HOD && body.campusId !== user.campusId) {
      return badRequestResponse(
        "HODs can only create cells in their own campus"
      );
    }

    if (
      user?.role === USER_ROLES.SMALL_GROUP_LEADER &&
      body.groupId !== user.groupId
    ) {
      return badRequestResponse(
        "Small group leaders can only create cells in their own group"
      );
    }

    // Create cell
    const newCell = cellDb.create({
      name: body.name,
      description: body.description,
      campusId: body.campusId,
      zoneId: body.zoneId,
      departmentId: body.departmentId,
      groupId: body.groupId,
      leaderId: body.leaderId,
      meetingFrequency: body.meetingFrequency as MeetingFrequency,
    });

    return successResponse(newCell, "Cell created successfully", 201);
  } catch (error) {
    return handleApiError(error);
  }
}
