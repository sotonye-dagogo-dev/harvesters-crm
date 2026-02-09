import { NextRequest } from "next/server";
import { inviteLinkDb, inviteLinkVisitDb } from "@/lib/data/database";
import { getAuthenticatedUser } from "@/lib/utils/middleware";
import {
  successResponse,
  notFoundResponse,
  badRequestResponse,
  handleApiError,
} from "@/lib/utils/api";

// POST /api/invite-links/[code]/convert - Mark invite link as converted
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error) return error;

    const { code } = await params;
    const body = await request.json();

    const link = inviteLinkDb.findByCode(code);
    if (!link) {
      return notFoundResponse("Invite link not found");
    }

    // Validate required fields
    if (!body.visitId) {
      return badRequestResponse("Missing required field: visitId");
    }

    // Mark visit as converted
    const updatedVisit = inviteLinkVisitDb.markConverted(
      body.visitId,
      user!.id
    );
    if (!updatedVisit) {
      return notFoundResponse("Visit not found");
    }

    // Increment conversion count
    inviteLinkDb.incrementConversion(link.id);

    return successResponse(
      { link, visit: updatedVisit },
      "Invite link conversion tracked successfully"
    );
  } catch (error) {
    return handleApiError(error);
  }
}
