import { NextRequest } from "next/server";
import { departmentDb } from "@/lib/data/database";
import { getAuthenticatedUser, requireRole } from "@/lib/utils/middleware";
import {
  successResponse,
  paginatedResponse,
  badRequestResponse,
  handleApiError,
} from "@/lib/utils/api";
import { USER_ROLES } from "@/lib/constants";
import { UserRole } from "@/lib/types";

// GET /api/departments - List departments
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error) return error;

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const search = searchParams.get("search") || undefined;
    const campusId = searchParams.get("campusId") || undefined;
    const zoneId = searchParams.get("zoneId") || undefined;
    const isActive = searchParams.get("isActive") === "true" ? true : undefined;

    // Build filters
    const filters = {
      search,
      campusId,
      zoneId,
      isActive,
    };

    // Get departments based on role
    let allDepartments = departmentDb.findAll(filters);

    // Filter by permission
    if (user?.role === USER_ROLES.ZONAL_LEADER) {
      // Zonal leaders can see departments in their zone
      allDepartments = allDepartments.filter((d) => d.zoneId === user.zoneId);
    } else if (user?.role === USER_ROLES.CAMPUS_ADMIN) {
      // Campus admins can see departments in their campus
      allDepartments = allDepartments.filter(
        (d) => d.campusId === user.campusId
      );
    } else if (user?.role === USER_ROLES.HOD) {
      // HODs can see departments they manage
      allDepartments = allDepartments.filter(
        (d) => d.campusId === user.campusId
      );
    } else if (
      user?.role === USER_ROLES.SMALL_GROUP_LEADER ||
      user?.role === USER_ROLES.CELL_LEADER ||
      user?.role === USER_ROLES.MEMBER
    ) {
      // Lower roles can see departments in their campus
      allDepartments = allDepartments.filter(
        (d) => d.campusId === user.campusId
      );
    }
    // Superadmins can see all departments

    const total = allDepartments.length;

    // Paginate
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedDepartments = allDepartments.slice(start, end);

    return paginatedResponse(paginatedDepartments, total, page, pageSize);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/departments - Create department (Superadmin, Zonal Leader, Campus Admin)
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await requireRole([
      USER_ROLES.SUPERADMIN as UserRole,
      USER_ROLES.ZONAL_LEADER as UserRole,
      USER_ROLES.CAMPUS_ADMIN as UserRole,
    ]);
    if (error) return error;

    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.description || !body.campusId || !body.hodId) {
      return badRequestResponse(
        "Missing required fields: name, description, campusId, hodId"
      );
    }

    // If zonal leader is creating, department must be in their zone
    if (user?.role === USER_ROLES.ZONAL_LEADER && body.zoneId !== user.zoneId) {
      return badRequestResponse(
        "Zonal leaders can only create departments in their own zone"
      );
    }

    // If campus admin is creating, department must be in their campus
    if (
      user?.role === USER_ROLES.CAMPUS_ADMIN &&
      body.campusId !== user.campusId
    ) {
      return badRequestResponse(
        "Campus admins can only create departments in their own campus"
      );
    }

    // Create department
    const newDepartment = departmentDb.create({
      name: body.name,
      description: body.description,
      campusId: body.campusId,
      hodId: body.hodId,
      zoneId: body.zoneId,
    });

    return successResponse(
      newDepartment,
      "Department created successfully",
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}
