import { clearAuthCookies } from "@/lib/utils/auth";
import { successResponse, handleApiError } from "@/lib/utils/api";

export async function POST() {
  try {
    // Clear cookies
    await clearAuthCookies();

    return successResponse(null, "Logout successful");
  } catch (error) {
    return handleApiError(error);
  }
}
