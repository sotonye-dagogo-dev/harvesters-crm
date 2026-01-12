import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/data/database";
import { getAuthenticatedUser } from "@/lib/utils/middleware";
import {
  handleApiError,
  successResponse,
  badRequestResponse,
} from "@/lib/utils/api";

// In-memory storage for follow-ups (replace with database in production)
export const followUps: Array<{
  id: string;
  leaderId: string;
  memberId: string;
  type: "CALL" | "VISIT" | "MESSAGE";
  scheduledDate: Date;
  notes: string;
  status: "PENDING" | "COMPLETED" | "OVERDUE";
  outcome?: string;
  createdAt: Date;
  completedAt: Date | null;
}> = [];

let followUpIdCounter = 1;

// GET /api/follow-ups - List all follow-ups for the leader
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser(request);
    if (error) return error;

    if (user?.role !== "LEADER" && user?.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Filter follow-ups for this leader
    let userFollowUps = followUps.filter((f) => f.leaderId === user.id);

    // Update overdue status
    const now = new Date();
    userFollowUps = userFollowUps.map((followUp) => {
      if (
        followUp.status === "PENDING" &&
        new Date(followUp.scheduledDate) < now
      ) {
        return { ...followUp, status: "OVERDUE" as const };
      }
      return followUp;
    });

    // Enrich with member names
    const enrichedFollowUps = userFollowUps.map((followUp) => {
      const member = db.users.findById(followUp.memberId);
      return {
        ...followUp,
        memberName: member
          ? `${member.firstName} ${member.lastName}`
          : "Unknown Member",
      };
    });

    return successResponse({ followUps: enrichedFollowUps });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/follow-ups - Create a new follow-up
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser(request);
    if (error) return error;

    if (user?.role !== "LEADER" && user?.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { memberId, type, scheduledDate, notes } = body;

    if (!memberId || !type || !scheduledDate || !notes) {
      return badRequestResponse("Missing required fields");
    }

    // Verify member exists and belongs to leader's group
    const member = db.users.findById(memberId);
    if (!member) {
      return badRequestResponse("Member not found");
    }

    if (user.role === "LEADER" && member.groupId !== user.groupId) {
      return NextResponse.json(
        { error: "Can only create follow-ups for your group members" },
        { status: 403 }
      );
    }

    const newFollowUp = {
      id: `followup_${followUpIdCounter++}`,
      leaderId: user.id,
      memberId,
      type,
      scheduledDate: new Date(scheduledDate),
      notes,
      status: "PENDING" as const,
      createdAt: new Date(),
      completedAt: null,
    };

    followUps.push(newFollowUp);

    return successResponse(
      newFollowUp,
      "Follow-up scheduled successfully",
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}
