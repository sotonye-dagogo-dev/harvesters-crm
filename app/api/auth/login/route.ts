import { NextRequest } from "next/server";
import { userDb } from "@/lib/data/database";
import { loginSchema } from "@/lib/utils/validation";
import {
  verifyPassword,
  generateTokens,
  setAuthCookies,
  userToAuthUser,
} from "@/lib/utils/auth";
import {
  successResponse,
  badRequestResponse,
  unauthorizedResponse,
  handleApiError,
} from "@/lib/utils/api";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return badRequestResponse("Invalid input data");
    }

    const { email, password } = validation.data;

    // Find user
    const user = userDb.findByEmail(email);
    if (!user) {
      return unauthorizedResponse("Invalid email or password");
    }

    // Check if user is active
    if (!user.isActive) {
      return unauthorizedResponse("Account is deactivated");
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return unauthorizedResponse("Invalid email or password");
    }

    // Generate tokens
    const authUser = userToAuthUser(user);
    const tokens = generateTokens(authUser);

    // Set cookies
    await setAuthCookies(tokens);

    // Return user without password
    return successResponse(
      {
        user: authUser,
        tokens,
      },
      "Login successful"
    );
  } catch (error) {
    return handleApiError(error);
  }
}
