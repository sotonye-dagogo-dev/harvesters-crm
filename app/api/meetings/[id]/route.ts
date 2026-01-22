import { NextRequest } from "next/server";
import { meetingDb, groupDb, userDb } from "@/lib/data/database";
import { getAuthenticatedUser } from "@/lib/utils/middleware";
import { updateMeetingSchema } from "@/lib/utils/validation";
import {
  successResponse,
  notFoundResponse,
  forbiddenResponse,
  badRequestResponse,
  handleApiError,
} from "@/lib/utils/api";
import { USER_ROLES } from "@/lib/constants";

// GET /api/meetings/[id] - Get meeting by ID
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error) return error;

    const { id } = await params;
    const meeting = meetingDb.findById(id);

    if (!meeting) {
      return notFoundResponse("Meeting not found");
    }

    // Check permissions
    const group = groupDb.findById(meeting.groupId);
    const canView =
      user?.role === USER_ROLES.SUPERADMIN ||
      group?.leaderId === user?.id ||
      user?.groupId === meeting.groupId;

    if (!canView) {
      return forbiddenResponse(
        "You don't have permission to view this meeting"
      );
    }

    // Build MeetingWithDetails response
    const leader = group?.leaderId ? userDb.findById(group.leaderId) : null;
    const creator = meeting.createdById
      ? userDb.findById(meeting.createdById)
      : null;

    const meetingWithDetails = {
      ...meeting,
      group: group
        ? {
            id: group.id,
            name: group.name,
            leaderId: group.leaderId,
            leader: leader
              ? {
                  id: leader.id,
                  name: leader.firstName + " " + leader.lastName,
                }
              : undefined,
          }
        : undefined,
      createdBy: creator
        ? {
            id: creator.id,
            firstName: creator.firstName,
            lastName: creator.lastName,
            email: creator.email,
          }
        : undefined,
    };

    return successResponse(meetingWithDetails);
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/meetings/[id] - Update meeting
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error) return error;

    const { id } = await params;
    const body = await request.json();

    // Validate input
    const validation = updateMeetingSchema.safeParse(body);
    if (!validation.success) {
      return badRequestResponse("Invalid input data");
    }

    const meeting = meetingDb.findById(id);
    if (!meeting) {
      return notFoundResponse("Meeting not found");
    }

    // Check permissions
    const group = groupDb.findById(meeting.groupId);
    const canUpdate =
      user?.role === USER_ROLES.SUPERADMIN ||
      group?.leaderId === user?.id ||
      meeting.createdById === user?.id;

    if (!canUpdate) {
      return forbiddenResponse(
        "You don't have permission to update this meeting"
      );
    }

    // Update meeting
    const updatedMeeting = meetingDb.update(id, validation.data);
    if (!updatedMeeting) {
      return notFoundResponse("Meeting not found");
    }

    return successResponse(updatedMeeting, "Meeting updated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/meetings/[id] - Delete meeting
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error) return error;

    const { id } = await params;
    const meeting = meetingDb.findById(id);

    if (!meeting) {
      return notFoundResponse("Meeting not found");
    }

    // Check permissions
    const group = groupDb.findById(meeting.groupId);
    const canDelete =
      user?.role === USER_ROLES.SUPERADMIN ||
      group?.leaderId === user?.id ||
      meeting.createdById === user?.id;

    if (!canDelete) {
      return forbiddenResponse(
        "You don't have permission to delete this meeting"
      );
    }

    const success = meetingDb.delete(id);
    if (!success) {
      return notFoundResponse("Meeting not found");
    }

    return successResponse(null, "Meeting deleted successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
