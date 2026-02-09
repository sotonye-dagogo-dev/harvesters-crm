import { NextRequest } from "next/server";
import { UserRole } from "@/lib/types";
import { zoneDb } from "@/lib/data/database";
import { getAuthenticatedUser, requireRole } from "@/lib/utils/middleware";
import {
  successResponse,
  notFoundResponse,
  forbiddenResponse,
  handleApiError,
} from "@/lib/utils/api";
import { USER_ROLES } from "@/lib/constants";

// GET /api/zones/[id] - Get zone by ID
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error) return error;

    const { id } = await params;
    const zone = zoneDb.findById(id);

    if (!zone) {
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

    return successResponse(zone);
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/zones/[id] - Update zone (Superadmin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireRole([USER_ROLES.SUPERADMIN as UserRole]);
    if (error) return error;

    const { id } = await params;
    const body = await request.json();

    const zone = zoneDb.findById(id);
    if (!zone) {
      return notFoundResponse("Zone not found");
    }

    // Build update data
    const updateData: UpdateZoneInput = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined)
      updateData.description = body.description;
    if (body.leaderId !== undefined) updateData.leaderId = body.leaderId;
    if (body.region !== undefined) updateData.region = body.region;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    // Update zone
    const updatedZone = zoneDb.update(id, updateData);
    if (!updatedZone) {
      return notFoundResponse("Zone not found");
    }

    return successResponse(updatedZone, "Zone updated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/zones/[id] - Delete zone (Superadmin only)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireRole([USER_ROLES.SUPERADMIN as UserRole]);
    if (error) return error;

    const { id } = await params;
    const success = zoneDb.delete(id);

    if (!success) {
      return notFoundResponse("Zone not found");
    }

    return successResponse(null, "Zone deleted successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
