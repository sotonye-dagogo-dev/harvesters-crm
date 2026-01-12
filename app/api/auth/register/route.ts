import { NextRequest } from "next/server";
import { userDb } from "@/lib/data/database";
import { registerSchema } from "@/lib/utils/validation";
import {
  hashPassword,
  generateTokens,
  setAuthCookies,
  userToAuthUser,
} from "@/lib/utils/auth";
import {
  successResponse,
  badRequestResponse,
  conflictResponse,
  handleApiError,
} from "@/lib/utils/api";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors;
      const errorMessage =
        Object.values(errors).flat()[0] || "Invalid input data";
      return badRequestResponse(errorMessage);
    }

    const data = validation.data;

    // Check if user already exists
    const existingUser = userDb.findByEmail(data.email);
    if (existingUser) {
      return conflictResponse("User with this email already exists");
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    // Create user with all required fields
    const newUser = userDb.create({
      email: data.email,
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      whatsappPhone: data.whatsappPhone || data.phone,
      location: data.address,
      age: undefined,
      maritalStatus: data.maritalStatus,
      employmentStatus: data.employmentStatus,
      interests: data.interests || [],
      groupId: data.groupId,
    });

    // Generate tokens
    const authUser = userToAuthUser(newUser);
    const tokens = generateTokens(authUser);

    // Set cookies
    await setAuthCookies(tokens);

    // Return user without password
    return successResponse(
      {
        user: authUser,
        tokens,
      },
      "Registration successful",
      201
    );
  } catch (error) {
    console.error("Registration error:", error);
    return handleApiError(error);
  }
}
