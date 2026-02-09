import { NextRequest } from "next/server";
import { campaignDb, campaignInteractionDb } from "@/lib/data/database";
import { getAuthenticatedUser } from "@/lib/utils/middleware";
import {
  successResponse,
  notFoundResponse,
  badRequestResponse,
  handleApiError,
} from "@/lib/utils/api";
import { CampaignInteractionType } from "@/lib/types";

// POST /api/campaigns/[id]/interact - Track campaign interaction (view/click/share)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error) return error;

    const { id: campaignId } = await params;
    const body = await request.json();

    // Validate required fields
    if (!body.type) {
      return badRequestResponse(
        "Missing required field: type (VIEW, CLICK, or SHARE)"
      );
    }

    const campaign = campaignDb.findById(campaignId);
    if (!campaign) {
      return notFoundResponse("Campaign not found");
    }

    // Create interaction record
    const interaction = campaignInteractionDb.create({
      campaignId,
      userId: user!.id,
      type: body.type as CampaignInteractionType,
      referralCode: body.referralCode,
    });

    // Update campaign counters
    if (body.type === "VIEW") {
      campaignDb.incrementCounter(campaignId, "viewCount");
    } else if (body.type === "CLICK") {
      campaignDb.incrementCounter(campaignId, "clickCount");
    } else if (body.type === "SHARE") {
      campaignDb.incrementCounter(campaignId, "shareCount");
    }

    return successResponse(
      interaction,
      "Interaction tracked successfully",
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}
