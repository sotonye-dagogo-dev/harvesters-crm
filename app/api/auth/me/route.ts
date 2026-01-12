import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/utils/middleware";
import { successResponse, handleApiError } from "@/lib/utils/api";

// GET /api/auth/me - Get current authenticated user
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser(request);
    if (error) return error;

    // Return user without sensitive data
    const { password: _, ...userWithoutPassword } = user!;

    return successResponse(userWithoutPassword);
  } catch (error) {
    return handleApiError(error);
  }
}
