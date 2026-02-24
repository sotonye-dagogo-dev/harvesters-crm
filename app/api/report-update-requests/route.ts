import { NextRequest } from "next/server";
import { db } from "@/lib/data/database";
import { getAuthenticatedUser } from "@/lib/utils/middleware";
import {
    successResponse,
    paginatedResponse,
    badRequestResponse,
    forbiddenResponse,
    handleApiError,
} from "@/lib/utils/api";
import { USER_ROLES } from "@/lib/constants";
import {
    createReportUpdateRequestSchema,
} from "@/lib/utils/validation";
import { UserRole, ReportStatus } from "@/lib/types";
import { sendReportUpdateRequestSubmittedNotification } from "@/lib/utils/notificationHelpers";

// Roles with wide visibility (can see all update requests)
const WIDE_VIEW_ROLES: UserRole[] = [
    USER_ROLES.SUPERADMIN as UserRole,
    USER_ROLES.GROUP_PASTOR as UserRole,
    USER_ROLES.GROUP_ADMIN as UserRole,
];

// Roles that can create update requests (report owners)
const REPORT_CREATORS: UserRole[] = [
    USER_ROLES.CAMPUS_PASTOR as UserRole,
    USER_ROLES.CAMPUS_ADMIN as UserRole,
    USER_ROLES.ZONAL_LEADER as UserRole,
    USER_ROLES.HOD as UserRole,
    USER_ROLES.SMALL_GROUP_LEADER as UserRole,
    USER_ROLES.CELL_LEADER as UserRole,
    USER_ROLES.DATA_ENTRY as UserRole,
];

// GET /api/report-update-requests — List update requests (role-scoped)
export async function GET(request: NextRequest) {
    try {
        const { user, error } = await getAuthenticatedUser();
        if (error) return error;

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const pageSize = parseInt(searchParams.get("pageSize") || "20");
        const status = searchParams.get("status") || undefined;
        const reportId = searchParams.get("reportId") || undefined;

        // Get all update requests
        let requests = db.reportUpdateRequests.findAll();

        // Role-based filtering
        const role = user!.role as UserRole;
        if (!WIDE_VIEW_ROLES.includes(role)) {
            // Non-wide-view users can only see their own requests
            requests = requests.filter((r) => r.requestedById === user!.id);
        }

        // Apply filters
        if (status) {
            requests = requests.filter((r) => r.status === status);
        }
        if (reportId) {
            requests = requests.filter((r) => r.reportId === reportId);
        }

        // Sort by most recent first
        requests.sort(
            (a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        // Paginate
        const total = requests.length;
        const start = (page - 1) * pageSize;
        const paginatedItems = requests.slice(start, start + pageSize);

        return paginatedResponse(paginatedItems, total, page, pageSize);
    } catch (err) {
        return handleApiError(err);
    }
}

// POST /api/report-update-requests — Create an update request for a locked/reviewed report
export async function POST(request: NextRequest) {
    try {
        const { user, error } = await getAuthenticatedUser();
        if (error) return error;

        const role = user!.role as UserRole;

        // Only report creators and superadmin can create update requests
        if (
            role !== (USER_ROLES.SUPERADMIN as UserRole) &&
            !REPORT_CREATORS.includes(role)
        ) {
            return forbiddenResponse(
                "You do not have permission to create update requests"
            );
        }

        const body = await request.json();
        const parsed = createReportUpdateRequestSchema.safeParse(body);
        if (!parsed.success) {
            return badRequestResponse(
                parsed.error.issues.map((i: { message: string }) => i.message).join(", ")
            );
        }

        // Verify report exists and is in a locked/reviewed/approved state
        const report = db.reports.findById(parsed.data.reportId);
        if (!report) {
            return badRequestResponse("Report not found");
        }

        const allowedStatuses: ReportStatus[] = [
            ReportStatus.APPROVED,
            ReportStatus.REVIEWED,
            ReportStatus.LOCKED,
        ];
        if (!allowedStatuses.includes(report.status as ReportStatus)) {
            return badRequestResponse(
                "Update requests can only be created for approved, reviewed, or locked reports"
            );
        }

        // Non-superadmin users can only request updates for their own reports
        if (
            role !== (USER_ROLES.SUPERADMIN as UserRole) &&
            report.submittedById !== user!.id
        ) {
            return forbiddenResponse(
                "You can only create update requests for your own reports"
            );
        }

        const created = db.reportUpdateRequests.create({
            reportId: parsed.data.reportId,
            requestedById: user!.id,
            reason: parsed.data.reason,
            sections: parsed.data.sections || [],
        });

        // Notify approvers about the new update request
        await sendReportUpdateRequestSubmittedNotification(created.id, user!.id);

        return successResponse(created, "Update request created successfully", 201);
    } catch (err) {
        return handleApiError(err);
    }
}
