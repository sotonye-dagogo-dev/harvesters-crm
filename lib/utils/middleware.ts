import { NextRequest } from "next/server";
import { getAccessToken, verifyAccessToken } from "@/lib/utils/auth";
import { userDb } from "@/lib/data/database";
import { unauthorizedResponse } from "@/lib/utils/api";

export async function getAuthenticatedUser(_request?: NextRequest) {
  const token = await getAccessToken();
  if (!token) {
    return { error: unauthorizedResponse("No access token provided") };
  }

  const decoded = verifyAccessToken(token);
  if (!decoded) {
    return { error: unauthorizedResponse("Invalid or expired access token") };
  }

  const user = userDb.findById(decoded.userId);
  if (!user || !user.isActive) {
    return { error: unauthorizedResponse("User not found or inactive") };
  }

  return { user };
}

export async function requireRole(roles: UserRole[], request?: NextRequest) {
  const { user, error } = await getAuthenticatedUser(request);
  if (error) return { error };
  if (!user) return { error: unauthorizedResponse("User not found") };

  if (!roles.includes(user.role)) {
    return {
      error: unauthorizedResponse(
        "You do not have permission to perform this action"
      ),
    };
  }

  return { user };
}
