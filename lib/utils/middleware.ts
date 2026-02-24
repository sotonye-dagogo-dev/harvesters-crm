import { UserRole } from "@/lib/types";
import { getAccessToken, verifyAccessToken } from "@/lib/utils/auth";
import { userDb } from "@/lib/data/database";
import { unauthorizedResponse } from "@/lib/utils/api";

export async function getAuthenticatedUser() {
  const token = await getAccessToken();
  if (!token) {
    return {
      error: unauthorizedResponse(
        "No access token provided. Please log in to continue."
      ),
    };
  }

  const decoded = verifyAccessToken(token);

  // Check if decoded is an error response
  if (
    !decoded ||
    (typeof decoded === "object" &&
      "success" in decoded &&
      decoded.success === false)
  ) {
    const errorMessage =
      decoded && typeof decoded === "object" && "message" in decoded
        ? String(decoded.message)
        : "Invalid or expired access token. Please log in again.";
    return {
      error: unauthorizedResponse(errorMessage),
    };
  }

  // At this point, decoded should be the valid token payload
  const tokenPayload = decoded as {
    userId: string;
    email: string;
    role: UserRole;
  };

  const user = userDb.findById(tokenPayload.userId);
  if (!user) {
    return {
      error: unauthorizedResponse(
        "User account not found. Please contact support."
      ),
    };
  }

  if (!user.isActive) {
    return {
      error: unauthorizedResponse(
        "Your account has been deactivated. Please contact church leadership for assistance."
      ),
    };
  }

  return { user };
}

export async function requireRole(roles: UserRole[]) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return { error };
  if (!user) {
    return {
      error: unauthorizedResponse(
        "Authentication required. Please log in to continue."
      ),
    };
  }

  if (!roles.includes(user.role)) {
    const requiredRoles = roles.join(" or ");
    const userRoleName =
      user.role === UserRole.SUPERADMIN
        ? "Super Administrator"
        : user.role === UserRole.MEMBER
          ? "Member"
          : "Leader";

    return {
      error: unauthorizedResponse(
        `Access denied. This action requires ${requiredRoles} privileges. Your current role is ${userRoleName}.`
      ),
    };
  }

  return { user };
}
