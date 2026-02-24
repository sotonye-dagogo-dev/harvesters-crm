import { NextRequest } from "next/server";
import { groupDb } from "@/lib/data/database";
import { getAuthenticatedUser, requireRole } from "@/lib/utils/middleware";
import { createGroupSchema } from "@/lib/utils/validation";
import {
  successResponse,
  paginatedResponse,
  badRequestResponse,
  handleApiError,
} from "@/lib/utils/api";
import { USER_ROLES } from "@/lib/constants";
import { UserRole, MeetingFrequency } from "@/lib/types";

// GET /api/groups - List groups
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error) return error;

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const search = searchParams.get("search") || undefined;
    const leaderId = searchParams.get("leaderId") || undefined;
    const campusId = searchParams.get("campusId") || undefined;
    const zoneId = searchParams.get("zoneId") || undefined;
    const departmentId = searchParams.get("departmentId") || undefined;
    const isActive = searchParams.get("isActive") === "true" ? true : undefined;

    // Build filters
    const filters: GroupFilters = {
      search,
      leaderId,
      campusId,
      zoneId,
      departmentId,
      isActive,
    };

    // Get groups based on role
    let allGroups = groupDb.findAll(filters);

    // Filter by permission
    if (user?.role === USER_ROLES.ZONAL_LEADER) {
      allGroups = allGroups.filter((g) => g.zoneId === user.zoneId);
    } else if (user?.role === USER_ROLES.CAMPUS_ADMIN) {
      allGroups = allGroups.filter((g) => g.campusId === user.campusId);
    } else if (user?.role === USER_ROLES.HOD) {
      allGroups = allGroups.filter((g) => g.campusId === user.campusId);
    } else if (user?.role === USER_ROLES.SMALL_GROUP_LEADER) {
      // Small group leaders can see groups they lead
      allGroups = allGroups.filter(
        (g) => g.leaderId === user.id || g.id === user.groupId
      );
    } else if (user?.role === USER_ROLES.CELL_LEADER) {
      allGroups = allGroups.filter((g) => g.id === user.groupId);
    } else if (user?.role === USER_ROLES.MEMBER) {
      // Members can only see their own group
      allGroups = allGroups.filter((g) => g.id === user.groupId);
    }
    // Superadmins can see all groups

    const total = allGroups.length;

    // Paginate
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedGroups = allGroups.slice(start, end);

    return paginatedResponse(paginatedGroups, total, page, pageSize);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/groups - Create group (Superadmin and leadership roles)
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

    // Validate input
    const validation = createGroupSchema.safeParse(body);
    if (!validation.success) {
      return badRequestResponse("Invalid input data");
    }

    const data = validation.data;

    // Permission checks
    if (user?.role === USER_ROLES.ZONAL_LEADER && data.zoneId !== user.zoneId) {
      return badRequestResponse(
        "Zonal leaders can only create groups in their own zone"
      );
    }

    if (
      user?.role === USER_ROLES.CAMPUS_ADMIN &&
      data.campusId !== user.campusId
    ) {
      return badRequestResponse(
        "Campus admins can only create groups in their own campus"
      );
    }

    if (user?.role === USER_ROLES.HOD && data.campusId !== user.campusId) {
      return badRequestResponse(
        "HODs can only create groups in their own campus"
      );
    }

    if (
      user?.role === USER_ROLES.SMALL_GROUP_LEADER &&
      data.leaderId !== user.id
    ) {
      return badRequestResponse(
        "Small group leaders can only create groups where they are the leader"
      );
    }

    // Create group
    const newGroup = groupDb.create({
      ...data,
      meetingFrequency: data.meetingFrequency as MeetingFrequency,
    });

    return successResponse(newGroup, "Group created successfully", 201);
  } catch (error) {
    return handleApiError(error);
  }
}
