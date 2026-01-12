import { userDb } from "@/lib/data/database";
import {
  getRefreshToken,
  verifyRefreshToken,
  generateTokens,
  setAuthCookies,
  userToAuthUser,
} from "@/lib/utils/auth";
import {
  successResponse,
  unauthorizedResponse,
  handleApiError,
} from "@/lib/utils/api";

export async function POST() {
  try {
    // Get refresh token from cookies
    const refreshToken = await getRefreshToken();
    if (!refreshToken) {
      return unauthorizedResponse("No refresh token provided");
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return unauthorizedResponse("Invalid or expired refresh token");
    }

    // Find user
    const user = userDb.findById(decoded.userId);
    if (!user || !user.isActive) {
      return unauthorizedResponse("User not found or inactive");
    }

    // Generate new tokens
    const authUser = userToAuthUser(user);
    const tokens = generateTokens(authUser);

    // Set new cookies
    await setAuthCookies(tokens);

    return successResponse(
      {
        user: authUser,
        tokens,
      },
      "Token refreshed successfully"
    );
  } catch (error) {
    return handleApiError(error);
  }
}
