import { NextRequest } from "next/server";
import { db } from "@/lib/data/database";
import { requireRole } from "@/lib/utils/middleware";
import {
    successResponse,
    handleApiError,
} from "@/lib/utils/api";
import { USER_ROLES } from "@/lib/constants";
import { UserRole } from "@/lib/types";

// Roles that can view report analytics
const ANALYTICS_ROLES: UserRole[] = [
    USER_ROLES.SUPERADMIN as UserRole,
    USER_ROLES.GROUP_PASTOR as UserRole,
    USER_ROLES.GROUP_ADMIN as UserRole,
    USER_ROLES.CAMPUS_PASTOR as UserRole,
    USER_ROLES.CAMPUS_ADMIN as UserRole,
    USER_ROLES.ZONAL_LEADER as UserRole,
    USER_ROLES.HOD as UserRole,
    USER_ROLES.SMALL_GROUP_LEADER as UserRole,
    USER_ROLES.CELL_LEADER as UserRole,
];

// GET /api/analytics/reports — Get report analytics dashboard data
export async function GET(request: NextRequest) {
    try {
        const { user, error } = await requireRole(ANALYTICS_ROLES);
        if (error) return error;

        const { searchParams } = new URL(request.url);
        const campusId = searchParams.get("campusId") || undefined;
        const periodYear = searchParams.get("periodYear") ? parseInt(searchParams.get("periodYear")!) : undefined;
        const periodMonth = searchParams.get("periodMonth") ? parseInt(searchParams.get("periodMonth")!) : undefined;
        const metricName = searchParams.get("metricName") || undefined;

        const role = user!.role as UserRole;

        // Campus-scoped roles can only see their own campus analytics
        let effectiveCampusId = campusId;
        if (
            role === (USER_ROLES.CAMPUS_PASTOR as UserRole) ||
            role === (USER_ROLES.CAMPUS_ADMIN as UserRole)
        ) {
            effectiveCampusId = user!.campusId || campusId;
        }

        // Gather all analytics data
        const dashboardStats = db.reportAnalytics.getDashboardStats(
            effectiveCampusId
        );

        const complianceSummary = db.reportAnalytics.getComplianceSummary();

        // Filter compliance by campus if needed
        const filteredCompliance = effectiveCampusId
            ? complianceSummary.filter((c) => c.campusId === effectiveCampusId)
            : complianceSummary;

        // Optionally get metric aggregates
        let metricAggregates = null;
        if (metricName || periodYear || periodMonth) {
            metricAggregates = db.reportAnalytics.getMetricAggregates({
                campusId: effectiveCampusId,
                periodYear,
                periodMonth,
                metricName,
            });
        }

        return successResponse({
            dashboard: dashboardStats,
            compliance: filteredCompliance,
            ...(metricAggregates && { metricAggregates }),
        });
    } catch (err) {
        return handleApiError(err);
    }
}
