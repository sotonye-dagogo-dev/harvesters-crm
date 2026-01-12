import { NextRequest } from "next/server";
import { groupDb } from "@/lib/data/database";
import { getAuthenticatedUser, requireRole } from "@/lib/utils/middleware";
import { createGroupSchema } from "@/lib/utils/validation";
import {
  successResponse,
  paginatedResponse,
  badRequestResponse,
  handleApiError,
} from "@/lib/utils/api";

// GET /api/groups - List groups
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser(request);
    if (error) return error;

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const search = searchParams.get("search") || undefined;
    const leaderId = searchParams.get("leaderId") || undefined;

    // Build filters
    const filters: GroupFilters = {
      search,
      leaderId,
    };

    // Get groups based on role
    let allGroups = groupDb.findAll(filters);

    // Filter by permission
    if (user?.role === UserRole.MEMBER) {
      // Members can only see their own group
      allGroups = allGroups.filter((g) => g.id === user.groupId);
    } else if (user?.role === UserRole.LEADER) {
      // Leaders can see their own group and available groups
      allGroups = allGroups.filter(
        (g) => g.leaderId === user.id || g.id === user.groupId
      );
    }
    // Superadmins can see all groups

    const total = allGroups.length;

    // Paginate
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedGroups = allGroups.slice(start, end);

    return paginatedResponse(paginatedGroups, total, page, pageSize);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/groups - Create group (Superadmin/Leader)
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await requireRole(
      [UserRole.SUPERADMIN, UserRole.LEADER],
      request
    );
    if (error) return error;

    const body = await request.json();

    // Validate input
    const validation = createGroupSchema.safeParse(body);
    if (!validation.success) {
      return badRequestResponse("Invalid input data");
    }

    const data = validation.data;

    // If leader is creating, they must be the leader of the new group
    if (user?.role === UserRole.LEADER && data.leaderId !== user.id) {
      return badRequestResponse(
        "Leaders can only create groups where they are the leader"
      );
    }

    // Create group
    const newGroup = groupDb.create({
      ...data,
      meetingFrequency: data.meetingFrequency as MeetingFrequency,
    });

    return successResponse(newGroup, "Group created successfully", 201);
  } catch (error) {
    return handleApiError(error);
  }
}
