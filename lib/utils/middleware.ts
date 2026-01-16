import { NextRequest } from "next/server";
import { getAccessToken, verifyAccessToken } from "@/lib/utils/auth";
import { userDb } from "@/lib/data/database";
import { unauthorizedResponse } from "@/lib/utils/api";

export async function getAuthenticatedUser(_request?: NextRequest) {
  const token = await getAccessToken();
  if (!token) {
    return {
      success: false,
      message: "No access token provided.",
      error: unauthorizedResponse("No access token provided"),
    };
  }
  const decoded = verifyAccessToken(token);
  if (!decoded || (decoded as any).success === false) {
    return {
      success: false,
      message: (decoded as any)?.message || "Invalid or expired access token.",
      error: unauthorizedResponse("Invalid or expired access token"),
    };
  }
  const user = userDb.findById((decoded as any).userId);
  if (!user || !user.isActive) {
    return {
      success: false,
      message: "User not found or inactive.",
      error: unauthorizedResponse("User not found or inactive"),
    };
  }
  return { success: true, user };
}

export async function requireRole(roles: UserRole[], request?: NextRequest) {
  const authResult = await getAuthenticatedUser(request);
  if (!authResult.success)
    return { error: authResult.error, message: authResult.message };
  const user = authResult.user;
  if (!user)
    return {
      error: unauthorizedResponse("User not found"),
      message: "User not found",
    };
  if (!roles.includes(user.role)) {
    return {
      error: unauthorizedResponse(
        "You do not have permission to perform this action"
      ),
      message: "You do not have permission to perform this action",
    };
  }
  return { user };
}
