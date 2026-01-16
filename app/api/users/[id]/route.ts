import { NextRequest } from "next/server";
import { userDb } from "@/lib/data/database";
import { getAuthenticatedUser, requireRole } from "@/lib/utils/middleware";
import { userToAuthUser } from "@/lib/utils/auth";
import { updateUserSchema } from "@/lib/utils/validation";
import {
  successResponse,
  notFoundResponse,
  forbiddenResponse,
  badRequestResponse,
  handleApiError,
} from "@/lib/utils/api";
import { sendRoleAssignmentNotification } from "@/lib/utils/notificationHelpers";
import { USER_ROLES } from "@/lib/constants";

// GET /api/users/[id] - Get user by ID
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user: currentUser, error } = await getAuthenticatedUser();
    if (error) return error;

    const { id } = await params;
    const user = userDb.findById(id);

    if (!user) {
      return notFoundResponse("User not found");
    }

    // Check permissions: users can view their own profile, leaders can view group members, superadmins can view all
    const canView =
      currentUser?.id === id ||
      currentUser?.role === USER_ROLES.SUPERADMIN ||
      (currentUser?.role === USER_ROLES.LEADER &&
        currentUser?.groupId === user.groupId);

    if (!canView) {
      return forbiddenResponse("You don't have permission to view this user");
    }

    return successResponse(userToAuthUser(user));
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/users/[id] - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user: currentUser, error } = await getAuthenticatedUser();
    if (error) return error;

    const { id } = await params;
    const body = await request.json();

    // Validate input
    const validation = updateUserSchema.safeParse(body);
    if (!validation.success) {
      return badRequestResponse("Invalid input data");
    }

    const user = userDb.findById(id);
    if (!user) {
      return notFoundResponse("User not found");
    }

    // Check permissions: users can update their own profile, superadmins can update any profile
    const canUpdate =
      currentUser?.id === id || currentUser?.role === USER_ROLES.SUPERADMIN;

    if (!canUpdate) {
      return forbiddenResponse("You don't have permission to update this user");
    }

    // Check if role is being changed (only superadmin can do this)
    const isRoleChange =
      validation.data.role && validation.data.role !== user.role;

    // Update user
    const updatedUser = userDb.update(id, {
      ...validation.data,
      maritalStatus: validation.data.maritalStatus as MaritalStatus | undefined,
      employmentStatus: validation.data.employmentStatus as
        | EmploymentStatus
        | undefined,
    } as UpdateUserInput);
    if (!updatedUser) {
      return notFoundResponse("User not found");
    }

    // Send notification if role was changed
    if (isRoleChange && currentUser?.role === USER_ROLES.SUPERADMIN) {
      await sendRoleAssignmentNotification(
        id,
        validation.data.role!,
        currentUser.id
      );
    }

    return successResponse(
      userToAuthUser(updatedUser),
      "User updated successfully"
    );
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/users/[id] - Deactivate user (Superadmin only)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireRole([USER_ROLES.SUPERADMIN as UserRole]);
    if (error) return error;

    const { id } = await params;
    const user = userDb.findById(id);

    if (!user) {
      return notFoundResponse("User not found");
    }

    // Deactivate user instead of deleting
    const deactivatedUser = userDb.update(id, { isActive: false });
    if (!deactivatedUser) {
      return notFoundResponse("User not found");
    }

    return successResponse(null, "User deactivated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
