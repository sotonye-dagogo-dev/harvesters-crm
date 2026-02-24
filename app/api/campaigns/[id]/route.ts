import { NextRequest } from "next/server";
import { MeetingLevel, CampaignStatus } from "@/lib/types";
import { campaignDb } from "@/lib/data/database";
import { getAuthenticatedUser } from "@/lib/utils/middleware";
import {
  successResponse,
  notFoundResponse,
  forbiddenResponse,
  handleApiError,
} from "@/lib/utils/api";
import { USER_ROLES } from "@/lib/constants";

// GET /api/campaigns/[id] - Get campaign by ID
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error) return error;

    const { id } = await params;
    const campaign = campaignDb.findById(id);

    if (!campaign) {
      return notFoundResponse("Campaign not found");
    }

    // Check permissions
    const canView =
      user?.role === USER_ROLES.SUPERADMIN ||
      campaign.createdById === user?.id ||
      (user?.role === USER_ROLES.ZONAL_LEADER &&
        (!campaign.targetZoneId || campaign.targetZoneId === user.zoneId)) ||
      (user?.role === USER_ROLES.CAMPUS_ADMIN &&
        (!campaign.targetCampusId ||
          campaign.targetCampusId === user.campusId)) ||
      !campaign.targetCampusId ||
      campaign.targetCampusId === user?.campusId;

    if (!canView) {
      return forbiddenResponse(
        "You don't have permission to view this campaign"
      );
    }

    return successResponse(campaign);
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/campaigns/[id] - Update campaign
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error) return error;

    const { id } = await params;
    const body = await request.json();

    const campaign = campaignDb.findById(id);
    if (!campaign) {
      return notFoundResponse("Campaign not found");
    }

    // Check permissions - only creator or superadmin can update
    const canUpdate =
      user?.role === USER_ROLES.SUPERADMIN || campaign.createdById === user?.id;

    if (!canUpdate) {
      return forbiddenResponse(
        "You don't have permission to update this campaign"
      );
    }

    // Build update data
    const updateData: Partial<Campaign> = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined)
      updateData.description = body.description;
    if (body.media !== undefined)
      updateData.media = body.media as CampaignMedia[];
    if (body.targetLevel !== undefined)
      updateData.targetLevel = body.targetLevel as MeetingLevel;
    if (body.targetCampusId !== undefined)
      updateData.targetCampusId = body.targetCampusId;
    if (body.targetZoneId !== undefined)
      updateData.targetZoneId = body.targetZoneId;
    if (body.targetDepartmentId !== undefined)
      updateData.targetDepartmentId = body.targetDepartmentId;
    if (body.targetGroupId !== undefined)
      updateData.targetGroupId = body.targetGroupId;
    if (body.targetCellId !== undefined)
      updateData.targetCellId = body.targetCellId;
    if (body.ctaText !== undefined) updateData.ctaText = body.ctaText;
    if (body.ctaUrl !== undefined) updateData.ctaUrl = body.ctaUrl;
    if (body.status !== undefined)
      updateData.status = body.status as CampaignStatus;
    if (body.expiresAt !== undefined) updateData.expiresAt = body.expiresAt;

    // Update campaign
    const updatedCampaign = campaignDb.update(id, updateData);
    if (!updatedCampaign) {
      return notFoundResponse("Campaign not found");
    }

    return successResponse(updatedCampaign, "Campaign updated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/campaigns/[id] - Delete campaign
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error) return error;

    const { id } = await params;
    const campaign = campaignDb.findById(id);

    if (!campaign) {
      return notFoundResponse("Campaign not found");
    }

    // Check permissions - only creator or superadmin can delete
    const canDelete =
      user?.role === USER_ROLES.SUPERADMIN || campaign.createdById === user?.id;

    if (!canDelete) {
      return forbiddenResponse(
        "You don't have permission to delete this campaign"
      );
    }

    const success = campaignDb.delete(id);
    if (!success) {
      return notFoundResponse("Campaign not found");
    }

    return successResponse(null, "Campaign deleted successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
