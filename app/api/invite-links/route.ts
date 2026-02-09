import { NextRequest } from "next/server";
import { InviteLinkType } from "@/lib/types";
import { inviteLinkDb } from "@/lib/data/database";
import { getAuthenticatedUser } from "@/lib/utils/middleware";
import {
  successResponse,
  paginatedResponse,
  badRequestResponse,
  handleApiError,
} from "@/lib/utils/api";
import { USER_ROLES } from "@/lib/constants";

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

// POST /api/invite-links - Create invite link
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error) return error;

    const body = await request.json();

    // Validate required fields
    if (!body.type || !body.targetId) {
      return badRequestResponse("Missing required fields: type, targetId");
    }

    // Create invite link
    const newLink = inviteLinkDb.create({
      type: body.type as InviteLinkType,
      targetId: body.targetId,
      createdById: user!.id,
      expiresAt: body.expiresAt,
      maxUses: body.maxUses,
      isActive: true,
    });

    return successResponse(newLink, "Invite link created successfully", 201);
  } catch (error) {
    return handleApiError(error);
  }
}
