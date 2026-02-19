import { NextRequest } from "next/server";
import {
  reportSubmissionDb,
  reportTypeDb,
  reportNotificationDb,
} from "@/lib/data/database";
import { getAuthenticatedUser } from "@/lib/utils/middleware";
import {
  successResponse,
  paginatedResponse,
  badRequestResponse,
  createdResponse,
  forbiddenResponse,
  handleApiError,
} from "@/lib/utils/api";
import { USER_ROLES } from "@/lib/constants";
import {
  ReportStatus,
  OrganizationalLevel,
  ReportNotificationKind,
} from "@/lib/types";

// GET /api/reports - List report submissions
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error) return error;

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const reportTypeId = searchParams.get("reportTypeId") || undefined;
    const reportTypeCode = searchParams.get("reportTypeCode") || undefined;
    const status = searchParams.get("status") as ReportStatus | null;
    const submittedById = searchParams.get("submittedById") || undefined;
    const organizationalLevelType = searchParams.get(
      "organizationalLevelType"
    ) as OrganizationalLevel | null;
    const organizationalUnitId =
      searchParams.get("organizationalUnitId") || undefined;
    const reportYear = searchParams.get("reportYear");
    const reportMonth = searchParams.get("reportMonth");
    const reportWeek = searchParams.get("reportWeek");
    const search = searchParams.get("search") || undefined;

    const filters: ReportSubmissionFilters = {
      reportTypeId,
      reportTypeCode,
      status: status || undefined,
      submittedById,
      organizationalLevelType: organizationalLevelType || undefined,
      organizationalUnitId,
      reportYear: reportYear ? parseInt(reportYear) : undefined,
      reportMonth: reportMonth ? parseInt(reportMonth) : undefined,
      reportWeek: reportWeek ? parseInt(reportWeek) : undefined,
      search,
    };

    let allSubmissions = reportSubmissionDb.findAll(filters);

    // Role-based filtering
    if (user) {
      switch (user.role) {
        case USER_ROLES.SUPERADMIN:
          // Can see all submissions
          break;
        case USER_ROLES.ZONAL_LEADER:
          // Can see submissions from their zone's campuses
          allSubmissions = allSubmissions.filter(
            (rs) =>
              rs.submittedById === user.id ||
              rs.reviewedById === user.id ||
              rs.approvedById === user.id
          );
          break;
        case USER_ROLES.CAMPUS_ADMIN:
          // Can see submissions from their campus
          allSubmissions = allSubmissions.filter(
            (rs) =>
              rs.organizationalUnitId === user.campusId ||
              rs.submittedById === user.id
          );
          break;
        case USER_ROLES.HOD:
          // Can see submissions they created
          allSubmissions = allSubmissions.filter(
            (rs) => rs.submittedById === user.id
          );
          break;
        default:
          // Members see nothing unless specifically assigned
          allSubmissions = allSubmissions.filter(
            (rs) => rs.submittedById === user.id
          );
          break;
      }
    }

    const total = allSubmissions.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginated = allSubmissions.slice(start, end);

    // Enrich with report type information
    const enriched = paginated.map((rs) => {
      const reportType = reportTypeDb.findById(rs.reportTypeId);
      return {
        ...rs,
        reportTypeName: reportType?.name ?? "Unknown",
        reportTypeCode: reportType?.code ?? "UNKNOWN",
      };
    });

    return paginatedResponse(enriched, total, page, pageSize);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/reports - Create a report submission
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error) return error;
    if (!user) return forbiddenResponse("Authentication required.");

    const body = await request.json();
    const {
      reportTypeId,
      reportYear,
      reportMonth,
      reportWeek,
      periodStartDate,
      periodEndDate,
      organizationalLevelType,
      organizationalUnitId,
      formData,
    } = body;

    // Validate required fields
    if (
      !reportTypeId ||
      !reportYear ||
      !reportMonth ||
      !periodStartDate ||
      !periodEndDate ||
      !formData
    ) {
      return badRequestResponse(
        "Report type, year, month, period dates, and form data are required."
      );
    }

    // Verify report type exists
    const reportType = reportTypeDb.findById(reportTypeId);
    if (!reportType) {
      return badRequestResponse("Invalid report type.");
    }

    // Verify user is allowed to submit this report type
    if (
      !reportType.allowedSubmitterRoles.includes(user.role) &&
      user.role !== USER_ROLES.SUPERADMIN
    ) {
      return forbiddenResponse(
        "You are not authorized to submit this type of report."
      );
    }

    // Validate form data against form definition
    const validationErrors = validateFormData(
      reportType.formDefinition,
      formData
    );
    if (validationErrors.length > 0) {
      return badRequestResponse(
        `Form validation failed: ${validationErrors.join(", ")}`
      );
    }

    const submission = reportSubmissionDb.create({
      reportTypeId,
      reportYear,
      reportMonth,
      reportWeek,
      periodStartDate,
      periodEndDate,
      organizationalLevelType:
        organizationalLevelType || OrganizationalLevel.CAMPUS,
      organizationalUnitId: organizationalUnitId || user.campusId || "",
      formData,
      submittedById: user.id,
      submitterRole: user.role,
    });

    return createdResponse(submission, "Report created successfully.");
  } catch (error) {
    return handleApiError(error);
  }
}

// Validate form data against form definition
function validateFormData(
  formDefinition: FormDefinition,
  formData: Record<string, unknown>
): string[] {
  const errors: string[] = [];

  for (const section of formDefinition.sections) {
    for (const field of section.fields) {
      const value = formData[field.name];

      if (
        field.isRequired &&
        (value === undefined || value === null || value === "")
      ) {
        errors.push(`${field.label} is required`);
        continue;
      }

      if (value !== undefined && value !== null && value !== "") {
        if (field.type === "NUMBER" && typeof value === "number") {
          if (field.minValue !== undefined && value < field.minValue) {
            errors.push(`${field.label} must be at least ${field.minValue}`);
          }
          if (field.maxValue !== undefined && value > field.maxValue) {
            errors.push(`${field.label} must be at most ${field.maxValue}`);
          }
        }
      }
    }
  }

  return errors;
}
