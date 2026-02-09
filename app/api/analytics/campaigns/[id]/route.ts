import { NextRequest } from "next/server";
import { analyticsDb } from "@/lib/data/database";
import { getAuthenticatedUser } from "@/lib/utils/middleware";
import {
  successResponse,
  notFoundResponse,
  handleApiError,
} from "@/lib/utils/api";

// GET /api/analytics/campaigns/[id] - Get campaign analytics
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await getAuthenticatedUser();
    if (error) return error;

    const { id } = await params;
    const stats = analyticsDb.getCampaignStats(id);

    if (!stats) {
      return notFoundResponse("Campaign not found");
    }

    return successResponse(stats);
  } catch (error) {
    return handleApiError(error);
  }
}
