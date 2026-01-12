import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/utils/auth";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token.value);
    if (!decoded || decoded.role !== "LEADER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get("groupId");

    if (!groupId) {
      return NextResponse.json(
        { error: "Group ID is required" },
        { status: 400 }
      );
    }

    // Mock overdue follow-ups data for now
    // In production, this would query from database
    const overdueFollowUps: any[] = [];

    return NextResponse.json({
      success: true,
      overdueFollowUps,
      count: overdueFollowUps.length,
    });
  } catch (error) {
    console.error("Error fetching overdue follow-ups:", error);
    return NextResponse.json(
      { error: "Failed to fetch overdue follow-ups" },
      { status: 500 }
    );
  }
}
