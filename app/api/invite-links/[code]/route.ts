import { NextRequest } from "next/server";
import { inviteLinkDb, inviteLinkVisitDb } from "@/lib/data/database";
import {
  successResponse,
  notFoundResponse,
  badRequestResponse,
  handleApiError,
} from "@/lib/utils/api";

// GET /api/invite-links/[code] - Get invite link by code (public - no auth required)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const link = inviteLinkDb.findByCode(code);

    if (!link) {
      return notFoundResponse("Invite link not found");
    }

    // Check if link is still active
    if (!link.isActive) {
      return badRequestResponse("This invite link is no longer active");
    }

    // Check if link has expired
    if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
      return badRequestResponse("This invite link has expired");
    }

    // Check if max uses reached
    if (link.maxUses && link.visitCount >= link.maxUses) {
      return badRequestResponse(
        "This invite link has reached its maximum uses"
      );
    }

    // Track the visit
    const searchParams = request.nextUrl.searchParams;
    const visitorInfo = {
      referrer: searchParams.get("referrer") || undefined,
      userAgent: request.headers.get("user-agent") || undefined,
      ip:
        request.headers.get("x-forwarded-for") ||
        request.headers.get("x-real-ip") ||
        undefined,
    };

    inviteLinkVisitDb.create({
      inviteLinkId: link.id,
      referrer: visitorInfo.referrer,
      userAgent: visitorInfo.userAgent,
      ipAddress: visitorInfo.ip,
      converted: false,
    });

    // Increment visit count
    inviteLinkDb.incrementVisit(link.id);

    return successResponse(link);
  } catch (error) {
    return handleApiError(error);
  }
}
