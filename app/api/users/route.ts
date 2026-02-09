import { NextRequest } from "next/server";
import { userDb } from "@/lib/data/database";
import { requireRole } from "@/lib/utils/middleware";
import { userToAuthUser } from "@/lib/utils/auth";
import { USER_ROLES } from "@/lib/constants";
import { paginatedResponse, handleApiError } from "@/lib/utils/api";
import { UserRole } from "@/lib/types";

// GET /api/users - List all users (Superadmin only)
export async function GET(request: NextRequest) {
  try {
    // Require superadmin role
    const { error } = await requireRole([USER_ROLES.SUPERADMIN as UserRole]);
    if (error) return error;

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const role = searchParams.get("role") as UserRole | null;
    const groupId = searchParams.get("groupId");
    const cellId = searchParams.get("cellId");
    const campusId = searchParams.get("campusId");
    const zoneId = searchParams.get("zoneId");
    const departmentId = searchParams.get("departmentId");
    const search = searchParams.get("search") || undefined;
    const isActive = searchParams.get("isActive");

    // Build filters
    const filters: UserFilters = {
      role: role || undefined,
      groupId: groupId || undefined,
      cellId: cellId || undefined,
      campusId: campusId || undefined,
      zoneId: zoneId || undefined,
      departmentId: departmentId || undefined,
      search,
      isActive: isActive ? isActive === "true" : undefined,
    };

    // Get users
    const allUsers = userDb.findAll(filters);
    const total = allUsers.length;

    // Paginate
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedUsers = allUsers.slice(start, end);

    // Convert to auth users (remove passwords)
    const authUsers = paginatedUsers.map(userToAuthUser);

    return paginatedResponse(authUsers, total, page, pageSize);
  } catch (error) {
    return handleApiError(error);
  }
}
