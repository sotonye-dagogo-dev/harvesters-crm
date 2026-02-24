import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/data/database";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    // Get user from cookies
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current password and new password are required" },
        { status: 400 }
      );
    }

    // Get user
    const user = db.users.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify current password
    const isValid = await db.users.comparePassword(
      currentPassword,
      user.password
    );
    if (!isValid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      );
    }

    // Validate new password
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    // Update user with all required fields
    const updatedUser: UpdateUserInput = {
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      whatsappPhone: user.whatsappPhone,
      location: user.location,
      age: user.age,
      maritalStatus: user.maritalStatus,
      employmentStatus: user.employmentStatus,
      interests: user.interests,
    };

    db.users.update(user.id, updatedUser);

    // Update password in the mock data directly
    const userIndex = (db.users as any)
      .findAll()
      .findIndex((u: User) => u.id === user.id);
    if (userIndex !== -1) {
      (db.users as any).findAll()[userIndex].password = hashedPassword;
    }

    return NextResponse.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
