import { NextRequest } from "next/server";
import { UserRole, MeetingLevel, CampaignStatus } from "@/lib/types";
import { campaignDb } from "@/lib/data/database";
import { getAuthenticatedUser, requireRole } from "@/lib/utils/middleware";
import {
  successResponse,
  paginatedResponse,
  badRequestResponse,
  handleApiError,
} from "@/lib/utils/api";
import { USER_ROLES, CAMPAIGN_DURATION_MS } from "@/lib/constants";

// GET /api/campaigns - List campaigns
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error) return error;

    // First, expire any stale campaigns
    campaignDb.expireStale();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const search = searchParams.get("search") || undefined;
    const status = searchParams.get("status") as CampaignStatus | undefined;
    const targetLevel = searchParams.get("targetLevel") as
      | MeetingLevel
      | undefined;
    const targetCampusId = searchParams.get("targetCampusId") || undefined;
    const targetZoneId = searchParams.get("targetZoneId") || undefined;
    const createdById = searchParams.get("createdById") || undefined;

    // Build filters
    const filters = {
      search,
      status,
      targetLevel,
      targetCampusId,
      targetZoneId,
      createdById,
    };

    // Get campaigns based on role
    let allCampaigns = campaignDb.findAll(filters);

    // Filter by permission
    if (user?.role === USER_ROLES.ZONAL_LEADER) {
      allCampaigns = allCampaigns.filter(
        (c) => !c.targetZoneId || c.targetZoneId === user.zoneId
      );
    } else if (user?.role === USER_ROLES.CAMPUS_ADMIN) {
      allCampaigns = allCampaigns.filter(
        (c) => !c.targetCampusId || c.targetCampusId === user.campusId
      );
    } else if (
      user?.role === USER_ROLES.HOD ||
      user?.role === USER_ROLES.SMALL_GROUP_LEADER ||
      user?.role === USER_ROLES.CELL_LEADER ||
      user?.role === USER_ROLES.MEMBER
    ) {
      allCampaigns = allCampaigns.filter(
        (c) => !c.targetCampusId || c.targetCampusId === user.campusId
      );
    }
    // Superadmins can see all campaigns

    const total = allCampaigns.length;

    // Paginate
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedCampaigns = allCampaigns.slice(start, end);

    return paginatedResponse(paginatedCampaigns, total, page, pageSize);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/campaigns - Create campaign (Leadership roles)
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await requireRole([
      USER_ROLES.SUPERADMIN as UserRole,
      USER_ROLES.ZONAL_LEADER as UserRole,
      USER_ROLES.CAMPUS_ADMIN as UserRole,
      USER_ROLES.HOD as UserRole,
      USER_ROLES.SMALL_GROUP_LEADER as UserRole,
      USER_ROLES.CELL_LEADER as UserRole,
    ]);
    if (error) return error;

    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.description || !body.targetLevel || !body.media) {
      return badRequestResponse(
        "Missing required fields: title, description, targetLevel, media"
      );
    }

    // Permission checks for targeting
    if (
      user?.role === USER_ROLES.ZONAL_LEADER &&
      body.targetZoneId &&
      body.targetZoneId !== user.zoneId
    ) {
      return badRequestResponse(
        "Zonal leaders can only create campaigns in their own zone"
      );
    }

    if (
      (user?.role === USER_ROLES.CAMPUS_ADMIN ||
        user?.role === USER_ROLES.HOD ||
        user?.role === USER_ROLES.SMALL_GROUP_LEADER ||
        user?.role === USER_ROLES.CELL_LEADER) &&
      body.targetCampusId &&
      body.targetCampusId !== user.campusId
    ) {
      return badRequestResponse(
        "You can only create campaigns in your own campus"
      );
    }

    // Calculate expiry time (24 hours from now)
    const expiresAt = new Date(Date.now() + CAMPAIGN_DURATION_MS).toISOString();

    // Create campaign
    const newCampaign = campaignDb.create({
      title: body.title,
      description: body.description,
      content: body.content || body.description,
      media: body.media as CampaignMedia[],
      targetLevel: body.targetLevel as MeetingLevel,
      targetCampusId: body.targetCampusId,
      targetZoneId: body.targetZoneId,
      targetDepartmentId: body.targetDepartmentId,
      targetGroupId: body.targetGroupId,
      targetCellId: body.targetCellId,
      ctaText: body.ctaText,
      ctaUrl: body.ctaUrl,
      status: (body.status as CampaignStatus) || ("ACTIVE" as CampaignStatus),
      expiresAt,
      createdById: user!.id,
    });

    return successResponse(newCampaign, "Campaign created successfully", 201);
  } catch (error) {
    return handleApiError(error);
  }
}
