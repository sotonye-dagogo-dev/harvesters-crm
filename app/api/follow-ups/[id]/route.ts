import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/utils/middleware";
import {
  handleApiError,
  successResponse,
  notFoundResponse,
  badRequestResponse,
} from "@/lib/utils/api";
import { isLeadershipRole, USER_ROLES } from "@/lib/constants";

// Import followUps from parent route (in production, this would be from database)
// For now, we'll create a shared storage module
import { followUps } from "../route";

// PUT /api/follow-ups/[id] - Update follow-up status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error) return error;

    if (!isLeadershipRole(user?.role ?? '')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, outcome } = body;

    const followUpIndex = followUps.findIndex((f) => f.id === id);

    if (followUpIndex === -1) {
      return notFoundResponse("Follow-up not found");
    }

    const followUp = followUps[followUpIndex];

    // Verify ownership
    if (followUp.leaderId !== user.id && user.role !== USER_ROLES.SUPERADMIN) {
      return NextResponse.json(
        { error: "Can only update your own follow-ups" },
        { status: 403 }
      );
    }

    // Update follow-up
    if (status === "COMPLETED") {
      followUps[followUpIndex] = {
        ...followUp,
        status: "COMPLETED",
        outcome,
        completedAt: new Date(),
      };
    } else {
      return badRequestResponse("Invalid status");
    }

    return successResponse(
      followUps[followUpIndex],
      "Follow-up updated successfully"
    );
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/follow-ups/[id] - Delete a follow-up
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error) return error;

    if (!isLeadershipRole(user?.role ?? '')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const followUpIndex = followUps.findIndex((f) => f.id === id);

    if (followUpIndex === -1) {
      return notFoundResponse("Follow-up not found");
    }

    const followUp = followUps[followUpIndex];

    // Verify ownership
    if (followUp.leaderId !== user.id && user.role !== USER_ROLES.SUPERADMIN) {
      return NextResponse.json(
        { error: "Can only delete your own follow-ups" },
        { status: 403 }
      );
    }

    followUps.splice(followUpIndex, 1);

    return successResponse(null, "Follow-up deleted successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
