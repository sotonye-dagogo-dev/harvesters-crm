import { NextRequest } from "next/server";
import {
  reportAnalyticsDb,
  reportSubmissionDb,
  reportTypeDb,
} from "@/lib/data/database";
import { getAuthenticatedUser } from "@/lib/utils/middleware";
import { USER_ROLES } from "@/lib/constants";
import {
  successResponse,
  forbiddenResponse,
  handleApiError,
} from "@/lib/utils/api";
import { ReportStatus, UserRole } from "@/lib/types";

// GET /api/analytics/reports —Get reporting system analytics
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error) return error;
    if (!user) return forbiddenResponse("Authentication required.");

    // Only leadership roles can access report analytics
    const allowedRoles: UserRole[] = [
      USER_ROLES.SUPERADMIN,
      USER_ROLES.ZONAL_LEADER,
      USER_ROLES.CAMPUS_ADMIN,
      USER_ROLES.HOD,
    ];
    if (!allowedRoles.includes(user.role)) {
      return forbiddenResponse(
        "You don't have permission to access report analytics."
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const reportYear = searchParams.get("reportYear")
      ? parseInt(searchParams.get("reportYear") ?? "0", 10)
      : new Date().getFullYear();
    const reportMonth = searchParams.get("reportMonth")
      ? parseInt(searchParams.get("reportMonth") ?? "0", 10)
      : undefined;
    const reportTypeId = searchParams.get("reportTypeId") ?? undefined;
    const campusId = searchParams.get("campusId") ?? undefined;

    // Build submission filters based on user role
    const filters: ReportSubmissionFilters = { reportYear };
    if (reportMonth) filters.reportMonth = reportMonth;
    if (reportTypeId) filters.reportTypeId = reportTypeId;

    // Role-based scope
    if (user.role === USER_ROLES.CAMPUS_ADMIN) {
      filters.organizationalUnitId = campusId ?? user.campusId ?? undefined;
    } else if (user.role === USER_ROLES.HOD) {
      filters.submittedById = user.id;
    } else if (campusId) {
      filters.organizationalUnitId = campusId;
    }

    // Get submissions matching filters
    const allSubmissions = reportSubmissionDb.findAll(filters);

    // Get compliance metrics (uses different filter structure)
    const complianceFilters = {
      organizationalUnitId: filters.organizationalUnitId,
      reportYear,
      reportMonth,
    };
    const complianceMetrics =
      reportAnalyticsDb.getComplianceMetrics(complianceFilters);

    // Get overview (no parameters)
    const overview = reportAnalyticsDb.getOverview();

    // Report type breakdown
    const reportTypes = reportTypeDb.findAll({});
    const typeBreakdown = reportTypes
      .map((rt) => {
        const typeSubmissions = allSubmissions.filter(
          (s) => s.reportTypeId === rt.id
        );
        const approved = typeSubmissions.filter(
          (s) =>
            s.status === ReportStatus.APPROVED ||
            s.status === ReportStatus.REVIEWED ||
            s.status === ReportStatus.FINALIZED
        ).length;
        const pending = typeSubmissions.filter(
          (s) => s.status === ReportStatus.SUBMITTED
        ).length;
        const drafts = typeSubmissions.filter(
          (s) => s.status === ReportStatus.DRAFT
        ).length;
        const requiresEdits = typeSubmissions.filter(
          (s) => s.status === ReportStatus.REQUIRES_EDITS
        ).length;

        return {
          reportTypeId: rt.id,
          reportTypeName: rt.name,
          reportTypeCode: rt.code,
          total: typeSubmissions.length,
          approved,
          pending,
          drafts,
          requiresEdits,
          avgCompletionRate:
            typeSubmissions.length > 0
              ? Math.round((approved / typeSubmissions.length) * 100 * 10) / 10
              : 0,
        };
      })
      .filter((tb) => tb.total > 0);

    // Monthly trend (last 6 months)
    const now = new Date();
    const monthlyTrend = Array.from({ length: 6 }, (_, i) => {
      const month = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const monthNum = month.getMonth() + 1;
      const yearNum = month.getFullYear();
      const monthSubmissions = allSubmissions.filter(
        (s) => s.reportMonth === monthNum && s.reportYear === yearNum
      );
      return {
        month: monthNum,
        year: yearNum,
        label: month.toLocaleString("default", {
          month: "short",
          year: "numeric",
        }),
        total: monthSubmissions.length,
        approved: monthSubmissions.filter(
          (s) =>
            s.status === ReportStatus.APPROVED ||
            s.status === ReportStatus.REVIEWED ||
            s.status === ReportStatus.FINALIZED
        ).length,
        submitted: monthSubmissions.filter(
          (s) => s.status === ReportStatus.SUBMITTED
        ).length,
      };
    });

    return successResponse({
      compliance: complianceMetrics,
      overview,
      typeBreakdown,
      monthlyTrend,
      filters: {
        reportYear,
        reportMonth,
        reportTypeId,
        organizationalUnitId: filters.organizationalUnitId,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
