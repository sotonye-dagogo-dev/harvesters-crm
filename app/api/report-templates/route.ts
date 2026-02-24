import { NextRequest } from "next/server";
import { reportTemplateDb } from "@/lib/data/database";
import { getAuthenticatedUser, requireRole } from "@/lib/utils/middleware";
import {
    successResponse,
    paginatedResponse,
    badRequestResponse,
    handleApiError,
} from "@/lib/utils/api";
import { USER_ROLES } from "@/lib/constants";
import {
    createReportTemplateSchema,
} from "@/lib/utils/validation";
import { UserRole } from "@/lib/types";

// GET /api/report-templates — List all templates
export async function GET(request: NextRequest) {
    try {
        const { error } = await getAuthenticatedUser();
        if (error) return error;

        const sp = request.nextUrl.searchParams;
        const page = parseInt(sp.get("page") || "1");
        const pageSize = parseInt(sp.get("pageSize") || "20");
        const search = sp.get("search") || undefined;
        const isActive = sp.get("isActive")
            ? sp.get("isActive") === "true"
            : undefined;

        const templates = reportTemplateDb.findAll({ isActive, search });
        const total = templates.length;
        const start = (page - 1) * pageSize;
        const paginated = templates.slice(start, start + pageSize);

        return paginatedResponse(paginated, total, page, pageSize);
    } catch (err) {
        return handleApiError(err);
    }
}

// POST /api/report-templates — Create a new template (superadmin only)
export async function POST(request: NextRequest) {
    try {
        const { user, error } = await requireRole([
            USER_ROLES.SUPERADMIN as UserRole,
        ]);
        if (error) return error;

        const body = await request.json();
        const parsed = createReportTemplateSchema.safeParse(body);
        if (!parsed.success) {
            return badRequestResponse(
                parsed.error.issues.map((i) => i.message).join(", ")
            );
        }

        const template = reportTemplateDb.create(parsed.data, user!.id);
        return successResponse(template, "Report template created successfully", 201);
    } catch (err) {
        return handleApiError(err);
    }
}
