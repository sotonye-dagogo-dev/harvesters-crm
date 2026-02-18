import { NextRequest } from "next/server";
import { reportDb, reportTemplateDb } from "@/lib/data/database";
import { getAuthenticatedUser } from "@/lib/utils/middleware";
import {
    successResponse,
    paginatedResponse,
    badRequestResponse,
    handleApiError,
} from "@/lib/utils/api";
import { USER_ROLES } from "@/lib/constants";
import { createReportSchema } from "@/lib/utils/validation";
import { ReportStatus } from "@/lib/types";

// ── Roles allowed to create reports ──
const REPORT_CREATORS: string[] = [
    USER_ROLES.SUPERADMIN,
    USER_ROLES.GROUP_PASTOR,
    USER_ROLES.GROUP_ADMIN,
    USER_ROLES.CAMPUS_PASTOR,
    USER_ROLES.CAMPUS_ADMIN,
    USER_ROLES.ZONAL_LEADER,
    USER_ROLES.HOD,
    USER_ROLES.SMALL_GROUP_LEADER,
    USER_ROLES.CELL_LEADER,
    USER_ROLES.DATA_ENTRY,
];

// GET /api/reports — List reports (role-scoped)
export async function GET(request: NextRequest) {
    try {
        const { user, error } = await getAuthenticatedUser();
        if (error) return error;

        const sp = request.nextUrl.searchParams;
        const page = parseInt(sp.get("page") || "1");
        const pageSize = parseInt(sp.get("pageSize") || "20");
        const campusId = sp.get("campusId") || undefined;
        const status = (sp.get("status") as ReportStatus) || undefined;
        const periodYear = sp.get("periodYear")
            ? parseInt(sp.get("periodYear")!)
            : undefined;
        const periodMonth = sp.get("periodMonth")
            ? parseInt(sp.get("periodMonth")!)
            : undefined;
        const submittedById = sp.get("submittedById") || undefined;
        const isDataEntry = sp.get("isDataEntry")
            ? sp.get("isDataEntry") === "true"
            : undefined;
        const search = sp.get("search") || undefined;

        let results = reportDb.findAll({
            campusId,
            status,
            periodYear,
            periodMonth,
            submittedById,
            isDataEntry,
            search,
        });

        // Role-based scoping
        const role = user!.role;
        if (
            role === USER_ROLES.CAMPUS_ADMIN ||
            role === USER_ROLES.CAMPUS_PASTOR
        ) {
            results = results.filter((r) => r.campusId === user!.campusId);
        } else if (
            role === USER_ROLES.ZONAL_LEADER ||
            role === USER_ROLES.HOD
        ) {
            results = results.filter((r) => r.campusId === user!.campusId);
        } else if (
            role === USER_ROLES.SMALL_GROUP_LEADER ||
            role === USER_ROLES.CELL_LEADER
        ) {
            results = results.filter((r) => r.submittedById === user!.id);
        } else if (role === USER_ROLES.DATA_ENTRY) {
            results = results.filter(
                (r) => r.dataEntryById === user!.id || r.submittedById === user!.id
            );
        } else if (role === USER_ROLES.MEMBER) {
            // Members can only see their own campus reports that are approved+
            results = results.filter(
                (r) =>
                    r.campusId === user!.campusId &&
                    [
                        ReportStatus.APPROVED,
                        ReportStatus.REVIEWED,
                        ReportStatus.LOCKED,
                    ].includes(r.status)
            );
        }
        // SUPERADMIN, GROUP_PASTOR, GROUP_ADMIN see all (already unfiltered)

        const total = results.length;
        const start = (page - 1) * pageSize;
        const paginated = results.slice(start, start + pageSize);

        return paginatedResponse(paginated, total, page, pageSize);
    } catch (err) {
        return handleApiError(err);
    }
}

// POST /api/reports — Create a new report
export async function POST(request: NextRequest) {
    try {
        const { user, error } = await getAuthenticatedUser();
        if (error) return error;

        if (!REPORT_CREATORS.includes(user!.role)) {
            return badRequestResponse("You do not have permission to create reports.");
        }

        const body = await request.json();
        const parsed = createReportSchema.safeParse(body);
        if (!parsed.success) {
            return badRequestResponse(
                parsed.error.issues.map((i) => i.message).join(", ")
            );
        }

        const data = parsed.data;

        // Validate template exists
        const template = reportTemplateDb.findById(data.templateId);
        if (!template) {
            return badRequestResponse("Report template not found.");
        }

        // Determine deadline (48 hours from now if not provided)
        const deadline =
            data.deadline ||
            new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

        // Determine templateVersionId
        const templateVersionId =
            data.templateVersionId || `tv-${template.version}`;

        const report = reportDb.create({
            ...data,
            templateVersionId,
            deadline,
            submittedById: user!.id,
            dataEntryById: data.isDataEntry ? user!.id : undefined,
        });

        return successResponse(report, "Report created successfully", 201);
    } catch (err) {
        return handleApiError(err);
    }
}
