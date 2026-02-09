import { NextRequest } from "next/server";
import { UserRole } from "@/lib/types";
import { departmentDb } from "@/lib/data/database";
import { getAuthenticatedUser, requireRole } from "@/lib/utils/middleware";
import {
  successResponse,
  notFoundResponse,
  forbiddenResponse,
  handleApiError,
} from "@/lib/utils/api";
import { USER_ROLES } from "@/lib/constants";

// GET /api/departments/[id] - Get department by ID
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error) return error;

    const { id } = await params;
    const department = departmentDb.findById(id);

    if (!department) {
      return notFoundResponse("Department not found");
    }

    // Check permissions
    const canView =
      user?.role === USER_ROLES.SUPERADMIN ||
      (user?.role === USER_ROLES.ZONAL_LEADER &&
        user?.zoneId === department.zoneId) ||
      (user?.role === USER_ROLES.CAMPUS_ADMIN &&
        user?.campusId === department.campusId) ||
      (user?.role === USER_ROLES.HOD && user?.departmentId === id) ||
      user?.campusId === department.campusId;

    if (!canView) {
      return forbiddenResponse(
        "You don't have permission to view this department"
      );
    }

    return successResponse(department);
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/departments/[id] - Update department (Superadmin, Zonal Leader, Campus Admin)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await requireRole([
      USER_ROLES.SUPERADMIN as UserRole,
      USER_ROLES.ZONAL_LEADER as UserRole,
      USER_ROLES.CAMPUS_ADMIN as UserRole,
    ]);
    if (error) return error;

    const { id } = await params;
    const body = await request.json();

    const department = departmentDb.findById(id);
    if (!department) {
      return notFoundResponse("Department not found");
    }

    // Check permissions
    const canUpdate =
      user?.role === USER_ROLES.SUPERADMIN ||
      (user?.role === USER_ROLES.ZONAL_LEADER &&
        user?.zoneId === department.zoneId) ||
      (user?.role === USER_ROLES.CAMPUS_ADMIN &&
        user?.campusId === department.campusId);

    if (!canUpdate) {
      return forbiddenResponse(
        "You don't have permission to update this department"
      );
    }

    // Build update data
    const updateData: UpdateDepartmentInput = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined)
      updateData.description = body.description;
    if (body.campusId !== undefined) updateData.campusId = body.campusId;
    if (body.hodId !== undefined) updateData.hodId = body.hodId;
    if (body.zoneId !== undefined) updateData.zoneId = body.zoneId;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    // Update department
    const updatedDepartment = departmentDb.update(id, updateData);
    if (!updatedDepartment) {
      return notFoundResponse("Department not found");
    }

    return successResponse(
      updatedDepartment,
      "Department updated successfully"
    );
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/departments/[id] - Delete department (Superadmin only)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireRole([USER_ROLES.SUPERADMIN as UserRole]);
    if (error) return error;

    const { id } = await params;
    const success = departmentDb.delete(id);

    if (!success) {
      return notFoundResponse("Department not found");
    }

    return successResponse(null, "Department deleted successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
