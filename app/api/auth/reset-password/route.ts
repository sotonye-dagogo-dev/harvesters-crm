import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/data/database";
import { validateResetToken, deleteResetToken } from "../forgot-password/route";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and password are required" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return NextResponse.json(
        { error: "Password must contain uppercase, lowercase, and number" },
        { status: 400 }
      );
    }

    // Validate token and get email
    const email = validateResetToken(token);

    if (!email) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    // Find user
    const user = db.users.findByEmail(email);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user password
    db.users.updatePassword(user.id, hashedPassword);

    // Delete the used token
    deleteResetToken(token);

    // Log password reset for security audit
    console.log("=".repeat(60));
    console.log("PASSWORD RESET SUCCESSFUL");
    console.log("=".repeat(60));
    console.log(`User: ${user.email}`);
    console.log(`User ID: ${user.id}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log("=".repeat(60));

    return NextResponse.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    );
  }
}
