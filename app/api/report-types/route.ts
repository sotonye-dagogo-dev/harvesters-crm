import { NextRequest } from "next/server";
import { reportTypeDb } from "@/lib/data/database";
import { getAuthenticatedUser, requireRole } from "@/lib/utils/middleware";
import {
  successResponse,
  paginatedResponse,
  badRequestResponse,
  createdResponse,
  handleApiError,
} from "@/lib/utils/api";
import { USER_ROLES } from "@/lib/constants";
import {
  UserRole,
  ReportCategory,
  ReportFrequency,
  OrganizationalLevel,
} from "@/lib/types";

// GET /api/report-types - List report types
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error) return error;

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "50");
    const category = searchParams.get("category") as ReportCategory | null;
    const frequency = searchParams.get("frequency") as ReportFrequency | null;
    const organizationalLevel = searchParams.get("organizationalLevel") as OrganizationalLevel | null;
    const isActive = searchParams.get("isActive");
    const search = searchParams.get("search") || undefined;

    const filters: ReportTypeFilters = {
      category: category || undefined,
      frequency: frequency || undefined,
      organizationalLevel: organizationalLevel || undefined,
      isActive: isActive !== null ? isActive === "true" : undefined,
      search,
    };

    let allTypes = reportTypeDb.findAll(filters);

    // Non-admin users only see report types matching their allowed roles
    if (user && user.role !== USER_ROLES.SUPERADMIN) {
      allTypes = allTypes.filter(
        (rt) =>
          rt.allowedSubmitterRoles.includes(user.role) ||
          rt.allowedReviewerRoles.includes(user.role)
      );
    }

    const total = allTypes.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginated = allTypes.slice(start, end);

    return paginatedResponse(paginated, total, page, pageSize);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/report-types - Create report type (Superadmin only)
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await requireRole([
      USER_ROLES.SUPERADMIN as UserRole,
    ]);
    if (error) return error;

    const body = await request.json();
    const {
      name,
      description,
      code,
      category,
      formDefinition,
      allowedSubmitterRoles,
      allowedReviewerRoles,
      frequency,
      organizationalLevel,
    } = body;

    // Validate required fields
    if (!name || !code || !category || !formDefinition || !frequency) {
      return badRequestResponse(
        "Name, code, category, form definition, and frequency are required."
      );
    }

    // Check code uniqueness
    const existing = reportTypeDb.findByCode(code);
    if (existing) {
      return badRequestResponse(`Report type with code "${code}" already exists.`);
    }

    // Validate category and frequency enums
    if (!Object.values(ReportCategory).includes(category)) {
      return badRequestResponse(`Invalid category: ${category}`);
    }
    if (!Object.values(ReportFrequency).includes(frequency)) {
      return badRequestResponse(`Invalid frequency: ${frequency}`);
    }

    const reportType = reportTypeDb.create({
      name,
      description: description || "",
      code,
      category,
      formDefinition,
      allowedSubmitterRoles: allowedSubmitterRoles || [user?.role],
      allowedReviewerRoles: allowedReviewerRoles || [UserRole.SUPERADMIN],
      frequency,
      organizationalLevel: organizationalLevel || undefined,
      isActive: true,
    });

    return createdResponse(reportType, "Report type created successfully.");
  } catch (error) {
    return handleApiError(error);
  }
}
