import { NextRequest } from "next/server";
import { MeetingLevel } from "@/lib/types";
import {
  meetingDb,
  groupDb,
  cellDb,
  campusDb,
  zoneDb,
  departmentDb,
} from "@/lib/data/database";
import { getAuthenticatedUser } from "@/lib/utils/middleware";
import { createMeetingSchema } from "@/lib/utils/validation";
import {
  successResponse,
  paginatedResponse,
  badRequestResponse,
  forbiddenResponse,
  handleApiError,
} from "@/lib/utils/api";
import { scheduleMeetingReminder } from "@/lib/utils/notificationHelpers";
import { USER_ROLES, MEETING_LEVEL_PERMISSIONS } from "@/lib/constants";

// GET /api/meetings - List meetings
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error) return error;

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const level = searchParams.get("level") as MeetingLevel | undefined;
    const groupId = searchParams.get("groupId") || undefined;
    const cellId = searchParams.get("cellId") || undefined;
    const campusId = searchParams.get("campusId") || undefined;
    const zoneId = searchParams.get("zoneId") || undefined;
    const departmentId = searchParams.get("departmentId") || undefined;
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;

    // Build filters
    const filters: MeetingFilters = {
      level,
      groupId,
      cellId,
      campusId,
      zoneId,
      departmentId,
      dateFrom: startDate || undefined,
      dateTo: endDate || undefined,
    };

    // Get meetings based on role
    let allMeetings = meetingDb.findAll(filters);

    // Filter by permission based on role
    if (user?.role === USER_ROLES.ZONAL_LEADER) {
      allMeetings = allMeetings.filter(
        (m) => !m.zoneId || m.zoneId === user.zoneId
      );
    } else if (user?.role === USER_ROLES.CAMPUS_ADMIN) {
      allMeetings = allMeetings.filter(
        (m) => !m.campusId || m.campusId === user.campusId
      );
    } else if (user?.role === USER_ROLES.HOD) {
      allMeetings = allMeetings.filter(
        (m) => !m.campusId || m.campusId === user.campusId
      );
    } else if (user?.role === USER_ROLES.SMALL_GROUP_LEADER) {
      allMeetings = allMeetings.filter(
        (m) =>
          !m.groupId ||
          m.groupId === user.groupId ||
          m.campusId === user.campusId
      );
    } else if (user?.role === USER_ROLES.CELL_LEADER) {
      allMeetings = allMeetings.filter(
        (m) =>
          m.cellId === user.cellId ||
          m.groupId === user.groupId ||
          m.campusId === user.campusId
      );
    } else if (user?.role === USER_ROLES.MEMBER) {
      allMeetings = allMeetings.filter(
        (m) =>
          m.cellId === user.cellId ||
          m.groupId === user.groupId ||
          m.campusId === user.campusId ||
          m.level === MeetingLevel.ALL
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

// POST /api/meetings - Create meeting (Leadership roles)
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error) return error;

    const body = await request.json();

    // Validate input
    const validation = createMeetingSchema.safeParse(body);
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors;
      const errorMessage =
        Object.values(errors).flat()[0] || "Invalid input data";
      return badRequestResponse(errorMessage);
    }

    const data = validation.data;

    // Check if user has permission to create meetings at this level
    const userPermissions = MEETING_LEVEL_PERMISSIONS[user!.role];
    if (
      !userPermissions ||
      !userPermissions.includes(data.level as MeetingLevel)
    ) {
      return forbiddenResponse(
        `You don't have permission to create ${data.level} level meetings`
      );
    }

    // Validate organizational context based on level
    if (data.level === "ZONE" && data.zoneId) {
      const zone = zoneDb.findById(data.zoneId);
      if (!zone) {
        return badRequestResponse("Zone not found");
      }
      // Check if user has access to this zone
      if (
        user?.role === USER_ROLES.ZONAL_LEADER &&
        user.zoneId !== data.zoneId
      ) {
        return forbiddenResponse(
          "You can only create meetings for your own zone"
        );
      }
    }

    if (data.level === "CAMPUS" && data.campusId) {
      const campus = campusDb.findById(data.campusId);
      if (!campus) {
        return badRequestResponse("Campus not found");
      }
      // Check if user has access to this campus
      if (
        user?.role === USER_ROLES.CAMPUS_ADMIN &&
        user.campusId !== data.campusId
      ) {
        return forbiddenResponse(
          "You can only create meetings for your own campus"
        );
      }
    }

    if (data.level === "DEPARTMENT" && data.departmentId) {
      const department = departmentDb.findById(data.departmentId);
      if (!department) {
        return badRequestResponse("Department not found");
      }
      // Check if user has access to this department
      if (
        user?.role === USER_ROLES.HOD &&
        user.departmentId !== data.departmentId
      ) {
        return forbiddenResponse(
          "You can only create meetings for your own department"
        );
      }
    }

    if (data.level === "SMALL_GROUP" && data.groupId) {
      const group = groupDb.findById(data.groupId);
      if (!group) {
        return badRequestResponse("Group not found");
      }
      // Check if user has access to this group
      if (
        user?.role === USER_ROLES.SMALL_GROUP_LEADER &&
        group.leaderId !== user.id
      ) {
        return forbiddenResponse(
          "You can only create meetings for groups you lead"
        );
      }
    }

    if (data.level === "CELL" && data.cellId) {
      const cell = cellDb.findById(data.cellId);
      if (!cell) {
        return badRequestResponse("Cell not found");
      }
      // Check if user has access to this cell
      if (user?.role === USER_ROLES.CELL_LEADER && cell.leaderId !== user.id) {
        return forbiddenResponse(
          "You can only create meetings for cells you lead"
        );
      }
    }

    // Create meeting
    const newMeeting = meetingDb.create({
      title: data.title,
      level: data.level as MeetingLevel,
      groupId: data.groupId,
      cellId: data.cellId,
      campusId: data.campusId,
      zoneId: data.zoneId,
      departmentId: data.departmentId,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      topic: data.topic,
      attendeeCount: data.attendeeCount || 0,
      attendeeIds: data.attendeeIds || [],
      notes: data.notes,
      screenshotUrl: data.screenshotUrl,
      campusNotes: data.campusNotes,
      createdById: user!.id,
    });

    // Schedule meeting reminder notification (24 hours before)
    if (data.groupId || data.cellId) {
      scheduleMeetingReminder(
        newMeeting.id,
        data.groupId || data.cellId || "",
        new Date(newMeeting.date)
      );
    }

    return successResponse(newMeeting, "Meeting created successfully", 201);
  } catch (error) {
    return handleApiError(error);
  }
}
