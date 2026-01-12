import { NextRequest } from "next/server";
import { meetingDb, groupDb } from "@/lib/data/database";
import { getAuthenticatedUser, requireRole } from "@/lib/utils/middleware";
import { createMeetingSchema } from "@/lib/utils/validation";
import {
  successResponse,
  paginatedResponse,
  badRequestResponse,
  forbiddenResponse,
  handleApiError,
} from "@/lib/utils/api";
import { scheduleMeetingReminder } from "@/lib/utils/notificationHelpers";

// GET /api/meetings - List meetings
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser(request);
    if (error) return error;

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const groupId = searchParams.get("groupId") || undefined;
    const dateFrom = searchParams.get("dateFrom") || undefined;
    const dateTo = searchParams.get("dateTo") || undefined;

    // Build filters
    const filters: MeetingFilters = {
      groupId,
      dateFrom,
      dateTo,
    };

    // Get meetings based on role
    let allMeetings = meetingDb.findAll(filters);

    // Filter by permission
    if (user?.role === UserRole.MEMBER) {
      // Members can only see meetings from their group
      allMeetings = allMeetings.filter((m) => m.groupId === user.groupId);
    } else if (user?.role === UserRole.LEADER) {
      // Leaders can see meetings from groups they lead or are members of
      const leaderGroups = groupDb.findAll({ leaderId: user.id });
      const leaderGroupIds = leaderGroups.map((g) => g.id);
      allMeetings = allMeetings.filter(
        (m) => leaderGroupIds.includes(m.groupId) || m.groupId === user.groupId
      );
    }
    // Superadmins can see all meetings

    const total = allMeetings.length;

    // Paginate
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedMeetings = allMeetings.slice(start, end);

    return paginatedResponse(paginatedMeetings, total, page, pageSize);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/meetings - Create meeting (Leader/Superadmin)
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await requireRole(
      [UserRole.LEADER, UserRole.SUPERADMIN],
      request
    );
    if (error) return error;

    const body = await request.json();

    // Validate input
    const validation = createMeetingSchema.safeParse(body);
    if (!validation.success) {
      return badRequestResponse("Invalid input data");
    }

    const data = validation.data;

    // Check if group exists
    const group = groupDb.findById(data.groupId);
    if (!group) {
      return badRequestResponse("Group not found");
    }

    // Check permissions - leader can only create meetings for their group
    if (user?.role === UserRole.LEADER && group.leaderId !== user.id) {
      return forbiddenResponse(
        "You can only create meetings for groups you lead"
      );
    }

    // Create meeting
    const newMeeting = meetingDb.create(data, user!.id);

    // Schedule meeting reminder notification (24 hours before)
    scheduleMeetingReminder(
      newMeeting.id,
      newMeeting.groupId,
      new Date(newMeeting.date)
    );

    return successResponse(newMeeting, "Meeting created successfully", 201);
  } catch (error) {
    return handleApiError(error);
  }
}
