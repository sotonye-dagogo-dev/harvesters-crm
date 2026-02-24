import { getAuthenticatedUser } from "@/lib/utils/middleware";
import { successResponse, handleApiError } from "@/lib/utils/api";
import { UserRole } from "@/lib/types";
import { USER_ROLES } from "@/lib/constants";

// Role hierarchy for referral link generation (mirrors invite-links/route.ts)
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

// GET /api/invite-links/allowed-roles — Get roles the current user can assign
export async function GET() {
    try {
        const { user, error } = await getAuthenticatedUser();
        if (error) return error;

        const allowedRoles = REFERRAL_ROLE_HIERARCHY[user!.role] ?? [];

        return successResponse({
            currentRole: user!.role,
            allowedRoles,
        });
    } catch (error) {
        return handleApiError(error);
    }
}
