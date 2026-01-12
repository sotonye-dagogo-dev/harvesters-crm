import { NextRequest, NextResponse } from "next/server";
import { validateResetToken } from "../forgot-password/route";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { valid: false, error: "Token is required" },
        { status: 400 }
      );
    }

    const email = validateResetToken(token);

    if (!email) {
      return NextResponse.json(
        { valid: false, error: "Invalid or expired token" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      message: "Token is valid",
    });
  } catch (error) {
    console.error("Verify reset token error:", error);
    return NextResponse.json(
      { valid: false, error: "Failed to verify token" },
      { status: 500 }
    );
  }
}
