import { NextRequest } from "next/server";
import { db } from "@/lib/data/database";
import { getAuthenticatedUser } from "@/lib/utils/middleware";
import {
  successResponse,
  badRequestResponse,
  unauthorizedResponse,
  handleApiError,
} from "@/lib/utils/api";
import { USER_ROLES } from "@/lib/constants";

// POST /api/meetings/broadcast - Create broadcast meeting for multiple groups
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error) return error;

    // Only superadmins can create broadcast meetings
    if (user?.role !== USER_ROLES.SUPERADMIN) {
      return unauthorizedResponse(
        "Only superadmins can create broadcast meetings"
      );
    }

    const body = await request.json();
    const { groupIds, date, startTime, endTime, topic, notes, level } = body;

    // Validate required fields
    if (!groupIds || !Array.isArray(groupIds) || groupIds.length === 0) {
      return badRequestResponse("At least one group must be selected");
    }

    if (!date || !startTime || !endTime) {
      return badRequestResponse("Date, start time, and end time are required");
    }

    if (!topic) {
      return badRequestResponse("Meeting topic is required");
    }

    if (!level) {
      return badRequestResponse("Meeting level is required");
    }

    // Support "ALL" to create for all groups
    let targetGroupIds = groupIds;
    if (groupIds.includes("ALL")) {
      const allGroups = db.groups.findAll();
      targetGroupIds = allGroups.map((g) => g.id);
    }

    // Validate all groups exist
    const validGroups = [];
    for (const groupId of targetGroupIds) {
      const group = db.groups.findById(groupId);
      if (group) {
        validGroups.push(group);
      }
    }

    if (validGroups.length === 0) {
      return badRequestResponse("No valid groups found");
    }

    // Create template meetings for each group
    const createdMeetings = [];
    for (const group of validGroups) {
      const meeting = db.meetings.create({
        title: topic,
        level,
        groupId: group.id,
        date,
        startTime,
        endTime,
        topic,
        notes: notes || "",
        attendeeCount: 0,
        attendeeIds: [],
        isBroadcast: true,
        isTemplate: true,
        targetGroupIds: validGroups.map((g) => g.id),
        createdById: user!.id,
      });

      createdMeetings.push({
        ...meeting,
        groupName: group.name,
      });
    }

    return successResponse(
      {
        meetings: createdMeetings,
        count: createdMeetings.length,
        targetGroups: validGroups.map((g) => ({ id: g.id, name: g.name })),
      },
      `Broadcast meeting created for ${createdMeetings.length} group(s)`,
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}

// GET /api/meetings/broadcast - Get all broadcast meeting templates
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get("groupId");

    // Find template meetings
    let templateMeetings = db.meetings
      .findAll()
      .filter((m) => m.isTemplate === true);

    // Filter by group if specified
    if (groupId) {
      templateMeetings = templateMeetings.filter((m) => m.groupId === groupId);
    }

    // Only leaders can see templates for their group
    if (user?.role === USER_ROLES.SMALL_GROUP_LEADER && user.groupId) {
      templateMeetings = templateMeetings.filter(
        (m) => m.groupId === user.groupId
      );
    }

    // Enrich with group info
    const enrichedMeetings = templateMeetings.map((meeting) => {
      const group = meeting.groupId
        ? db.groups.findById(meeting.groupId)
        : null;
      return {
        ...meeting,
        group: group
          ? {
              id: group.id,
              name: group.name,
            }
          : null,
      };
    });

    return successResponse({
      meetings: enrichedMeetings,
      count: enrichedMeetings.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
