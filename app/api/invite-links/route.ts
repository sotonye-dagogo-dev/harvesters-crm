import { NextRequest } from "next/server";
import { InviteLinkType, UserRole } from "@/lib/types";
import { inviteLinkDb } from "@/lib/data/database";
import { getAuthenticatedUser } from "@/lib/utils/middleware";
import {
  successResponse,
  paginatedResponse,
  badRequestResponse,
  handleApiError,
} from "@/lib/utils/api";
import { USER_ROLES } from "@/lib/constants";

// ── Role hierarchy for referral link generation (FR51) ───────────────────────
// Maps each role to the roles it is allowed to assign via referral links.
// Superadmin can assign any role. Group-level admins/pastors can assign
// lower roles within their scope. Leaders can invite members.
const REFERRAL_ROLE_HIERARCHY: Record<string, UserRole[]> = {
  [USER_ROLES.SUPERADMIN]: [
    UserRole.GROUP_PASTOR,
    UserRole.GROUP_ADMIN,
    UserRole.CAMPUS_PASTOR,
    UserRole.CAMPUS_ADMIN,
    UserRole.ZONAL_LEADER,
    UserRole.HOD,
    UserRole.SMALL_GROUP_LEADER,
    UserRole.CELL_LEADER,
    UserRole.DATA_ENTRY,
    UserRole.MEMBER,
  ],
  [USER_ROLES.GROUP_PASTOR]: [
    UserRole.CAMPUS_PASTOR,
    UserRole.CAMPUS_ADMIN,
    UserRole.ZONAL_LEADER,
    UserRole.HOD,
    UserRole.SMALL_GROUP_LEADER,
    UserRole.CELL_LEADER,
    UserRole.DATA_ENTRY,
    UserRole.MEMBER,
  ],
  [USER_ROLES.GROUP_ADMIN]: [
    UserRole.CAMPUS_ADMIN,
    UserRole.ZONAL_LEADER,
    UserRole.HOD,
    UserRole.SMALL_GROUP_LEADER,
    UserRole.CELL_LEADER,
    UserRole.DATA_ENTRY,
    UserRole.MEMBER,
  ],
  [USER_ROLES.CAMPUS_PASTOR]: [
    UserRole.ZONAL_LEADER,
    UserRole.HOD,
    UserRole.SMALL_GROUP_LEADER,
    UserRole.CELL_LEADER,
    UserRole.DATA_ENTRY,
    UserRole.MEMBER,
  ],
  [USER_ROLES.CAMPUS_ADMIN]: [
    UserRole.ZONAL_LEADER,
    UserRole.HOD,
    UserRole.SMALL_GROUP_LEADER,
    UserRole.CELL_LEADER,
    UserRole.DATA_ENTRY,
    UserRole.MEMBER,
  ],
  [USER_ROLES.ZONAL_LEADER]: [
    UserRole.SMALL_GROUP_LEADER,
    UserRole.CELL_LEADER,
    UserRole.MEMBER,
  ],
  [USER_ROLES.HOD]: [
    UserRole.SMALL_GROUP_LEADER,
    UserRole.CELL_LEADER,
    UserRole.MEMBER,
  ],
  [USER_ROLES.SMALL_GROUP_LEADER]: [UserRole.CELL_LEADER, UserRole.MEMBER],
  [USER_ROLES.CELL_LEADER]: [UserRole.MEMBER],
};

/**
 * Get the list of roles the current user can assign via referral links.
 */
function getAllowedRolesForUser(userRole: string): UserRole[] {
  return REFERRAL_ROLE_HIERARCHY[userRole] ?? [];
}

// GET /api/invite-links - List invite links
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error) return error;

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const type = searchParams.get("type") as InviteLinkType | undefined;
    const targetId = searchParams.get("targetId") || undefined;
    const createdById = searchParams.get("createdById") || undefined;
    const isActive = searchParams.get("isActive") === "true" ? true : undefined;

    // Build filters
    const filters = {
      type,
      targetId,
      createdById,
      isActive,
    };

    // Get invite links based on role
    let allLinks = inviteLinkDb.findAll(filters);

    // Filter by permission - users can only see their own links unless admin
    if (user?.role !== USER_ROLES.SUPERADMIN) {
      allLinks = allLinks.filter((l) => l.createdById === user?.id);
    }

    const total = allLinks.length;

    // Paginate
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedLinks = allLinks.slice(start, end);

    return paginatedResponse(paginatedLinks, total, page, pageSize);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/invite-links - Create invite link (FR48, FR51)
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error) return error;

    const body = await request.json();

    // Validate required fields
    if (!body.type || !body.targetId) {
      return badRequestResponse("Missing required fields: type, targetId");
    }

    // FR51: Enforce role hierarchy – if assignRole is specified, verify permission
    if (body.assignRole) {
      const allowedRoles = getAllowedRolesForUser(user!.role);
      if (!allowedRoles.includes(body.assignRole as UserRole)) {
        return badRequestResponse(
          `You do not have permission to assign the "${body.assignRole}" role. ` +
          `Your role (${user!.role}) can only assign: ${allowedRoles.join(", ") || "none"}`
        );
      }
    }

    // Create invite link
    const newLink = inviteLinkDb.create({
      type: body.type as InviteLinkType,
      targetId: body.targetId,
      assignRole: body.assignRole as UserRole | undefined,
      createdById: user!.id,
      expiresAt: body.expiresAt,
      maxUses: body.maxUses ?? 1, // FR57: Default to single-use
      isActive: true,
    });

    return successResponse(newLink, "Invite link created successfully", 201);
  } catch (error) {
    return handleApiError(error);
  }
}

// GET /api/invite-links/allowed-roles - Get roles the current user can assign
export { getAllowedRolesForUser };
