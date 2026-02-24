import { NextRequest } from "next/server";
import { referralLinkDb } from "@/lib/data/database";
import { getAuthenticatedUser } from "@/lib/utils/middleware";
import {
  successResponse,
  notFoundResponse,
  badRequestResponse,
  handleApiError,
} from "@/lib/utils/api";

interface RouteParams {
  params: Promise<{ code: string }>;
}

// GET /api/referral-links/validate/[code] — Validate a referral code
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { code } = await params;
    const result = referralLinkDb.validate(code);

    if (!result.valid) {
      return badRequestResponse(result.error ?? "Invalid referral code.");
    }

    // Return only safe fields (not the full link)
    return successResponse({
      valid: true,
      assignedRole: result.link?.assignedRole,
      organizationalLevelType: result.link?.organizationalLevelType,
      organizationalUnitId: result.link?.organizationalUnitId,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
