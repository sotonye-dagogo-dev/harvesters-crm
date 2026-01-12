import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/data/database";
import crypto from "crypto";

// Mock password reset tokens storage (in-memory for mock backend)
const resetTokens = new Map<string, { email: string; expiresAt: number }>();

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if user exists
    const user = db.users.findByEmail(email);

    // Always return success even if user doesn't exist (security best practice)
    // This prevents email enumeration attacks

    if (user) {
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString("hex");
      const expiresAt = Date.now() + 3600000; // 1 hour from now

      // Store token (in production, this would be in database)
      resetTokens.set(resetToken, { email, expiresAt });

      // In production, send email with reset link
      // For now, we'll just log it
      const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;

      console.log("=".repeat(60));
      console.log("PASSWORD RESET REQUEST");
      console.log("=".repeat(60));
      console.log(`Email: ${email}`);
      console.log(`Reset Link: ${resetLink}`);
      console.log(`Token: ${resetToken}`);
      console.log(`Expires: ${new Date(expiresAt).toISOString()}`);
      console.log("=".repeat(60));

      // In production, use a service like SendGrid, AWS SES, or Nodemailer
      // await sendPasswordResetEmail(email, resetLink);
    }

    return NextResponse.json({
      success: true,
      message:
        "If an account exists with that email, a reset link has been sent",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}

// Helper function to get reset tokens (for testing/debugging)
export function getResetToken(email: string): string | null {
  for (const [token, data] of resetTokens.entries()) {
    if (data.email === email && data.expiresAt > Date.now()) {
      return token;
    }
  }
  return null;
}

// Helper function to validate token (used by other endpoints)
export function validateResetToken(token: string): string | null {
  const data = resetTokens.get(token);

  if (!data) {
    return null;
  }

  if (data.expiresAt < Date.now()) {
    resetTokens.delete(token);
    return null;
  }

  return data.email;
}

// Helper function to delete token after use
export function deleteResetToken(token: string): void {
  resetTokens.delete(token);
}
