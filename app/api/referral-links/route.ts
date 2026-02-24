import { NextRequest } from "next/server";
import { referralLinkDb } from "@/lib/data/database";
import { getAuthenticatedUser, requireRole } from "@/lib/utils/middleware";
import {
  successResponse,
  paginatedResponse,
  createdResponse,
  badRequestResponse,
  notFoundResponse,
  forbiddenResponse,
  handleApiError,
} from "@/lib/utils/api";
import { USER_ROLES } from "@/lib/constants";
import { UserRole, OrganizationalLevel } from "@/lib/types";

// GET /api/referral-links — List referral links
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error) return error;
    if (!user) return forbiddenResponse("Authentication required.");

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const isActive = searchParams.get("isActive");
    const isUsed = searchParams.get("isUsed");

    const filters: { createdById?: string; isActive?: boolean; isUsed?: boolean } = {};

    // Non-admin users only see their own links
    if (user.role !== USER_ROLES.SUPERADMIN) {
      filters.createdById = user.id;
    }

    if (isActive !== null) filters.isActive = isActive === "true";
    if (isUsed !== null) filters.isUsed = isUsed === "true";

    const allLinks = referralLinkDb.findAll(filters);
    const total = allLinks.length;
    const start = (page - 1) * pageSize;
    const paginated = allLinks.slice(start, start + pageSize);

    return paginatedResponse(paginated, total, page, pageSize);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/referral-links — Create a referral link
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await requireRole([
      USER_ROLES.SUPERADMIN as UserRole,
      USER_ROLES.ZONAL_LEADER as UserRole,
      USER_ROLES.CAMPUS_ADMIN as UserRole,
      USER_ROLES.HOD as UserRole,
    ]);
    if (error) return error;
    if (!user) return forbiddenResponse("Authentication required.");

    const body = await request.json();
    const { assignedRole, organizationalLevelType, organizationalUnitId, expiresInDays } = body as {
      assignedRole?: string;
      organizationalLevelType?: OrganizationalLevel;
      organizationalUnitId?: string;
      expiresInDays?: number;
    };

    if (!assignedRole) {
      return badRequestResponse("Assigned role is required.");
    }

    const link = referralLinkDb.create({
      assignedRole,
      organizationalLevelType,
      organizationalUnitId,
      expiresInDays,
      createdById: user.id,
      createdByRole: user.role,
    });

    return createdResponse(link, "Referral link created successfully.");
  } catch (error) {
    return handleApiError(error);
  }
}
