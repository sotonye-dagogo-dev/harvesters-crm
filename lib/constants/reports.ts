// ============================================================================
// REPORT SYSTEM CONSTANTS
// ============================================================================

import { ReportStatus, UserRole, MetricFieldType, ReportPeriodType } from "../types";

// ============================================================================
// REPORT STATUS CONFIGURATION
// ============================================================================

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
    [ReportStatus.DRAFT]: "Draft",
    [ReportStatus.SUBMITTED]: "Submitted",
    [ReportStatus.REQUIRES_EDITS]: "Requires Edits",
    [ReportStatus.APPROVED]: "Approved",
    [ReportStatus.REVIEWED]: "Reviewed",
    [ReportStatus.LOCKED]: "Locked",
};

export const REPORT_STATUS_COLORS: Record<ReportStatus, string> = {
    [ReportStatus.DRAFT]: "default",
    [ReportStatus.SUBMITTED]: "processing",
    [ReportStatus.REQUIRES_EDITS]: "warning",
    [ReportStatus.APPROVED]: "success",
    [ReportStatus.REVIEWED]: "cyan",
    [ReportStatus.LOCKED]: "error",
};

/**
 * Defines valid status transitions and which roles can perform them.
 * Key = current status, value = array of possible transitions.
 */
export const REPORT_STATUS_TRANSITIONS: Record<
    ReportStatus,
    Array<{
        to: ReportStatus;
        requiredRoles: UserRole[];
        label: string;
    }>
> = {
    [ReportStatus.DRAFT]: [
        {
            to: ReportStatus.SUBMITTED,
            requiredRoles: [
                UserRole.CAMPUS_ADMIN,
                UserRole.DATA_ENTRY,
                UserRole.SUPERADMIN,
            ],
            label: "Submit Report",
        },
    ],
    [ReportStatus.SUBMITTED]: [
        {
            to: ReportStatus.APPROVED,
            requiredRoles: [UserRole.CAMPUS_PASTOR, UserRole.SUPERADMIN],
            label: "Approve Report",
        },
        {
            to: ReportStatus.REQUIRES_EDITS,
            requiredRoles: [UserRole.CAMPUS_PASTOR, UserRole.SUPERADMIN],
            label: "Request Edits",
        },
    ],
    [ReportStatus.REQUIRES_EDITS]: [
        {
            to: ReportStatus.SUBMITTED,
            requiredRoles: [
                UserRole.CAMPUS_ADMIN,
                UserRole.DATA_ENTRY,
                UserRole.SUPERADMIN,
            ],
            label: "Resubmit Report",
        },
    ],
    [ReportStatus.APPROVED]: [
        {
            to: ReportStatus.REVIEWED,
            requiredRoles: [
                UserRole.GROUP_ADMIN,
                UserRole.GROUP_PASTOR,
                UserRole.SUPERADMIN,
            ],
            label: "Mark as Reviewed",
        },
        {
            to: ReportStatus.LOCKED,
            requiredRoles: [UserRole.SUPERADMIN],
            label: "Lock Report",
        },
    ],
    [ReportStatus.REVIEWED]: [
        {
            to: ReportStatus.LOCKED,
            requiredRoles: [UserRole.SUPERADMIN, UserRole.GROUP_ADMIN],
            label: "Lock Report",
        },
    ],
    [ReportStatus.LOCKED]: [],
};

// ============================================================================
// REPORT DEADLINE CONFIGURATION
// ============================================================================

export const REPORT_DEADLINE_CONFIG = {
    /** Total hours for submission window after period ends */
    submissionWindowHours: 48,
    /** Hours before deadline to start sending reminders */
    reminderStartHours: 24,
    /** Interval between reminder notifications (hours) */
    reminderIntervalHours: 6,
    /** Whether to auto-approve reports when deadline passes without reviewer action (FR29) */
    autoApproveOnDeadline: true,
} as const;

// ============================================================================
// REPORT PERIOD CONFIGURATION
// ============================================================================

export const REPORT_PERIOD_CONFIG = {
    /** Day of week when weekly period starts (0=Sunday, 1=Monday, ...) */
    weekStartDay: 0,
    /** Default period type for new reports */
    defaultPeriodType: ReportPeriodType.WEEKLY,
} as const;

export const REPORT_PERIOD_LABELS: Record<ReportPeriodType, string> = {
    [ReportPeriodType.WEEKLY]: "Weekly",
    [ReportPeriodType.MONTHLY]: "Monthly",
    [ReportPeriodType.YEARLY]: "Yearly",
};

// ============================================================================
// METRIC FIELD TYPE CONFIGURATION
// ============================================================================

export const METRIC_FIELD_TYPE_LABELS: Record<MetricFieldType, string> = {
    [MetricFieldType.NUMBER]: "Number",
    [MetricFieldType.PERCENTAGE]: "Percentage",
    [MetricFieldType.TEXT]: "Text",
    [MetricFieldType.CURRENCY]: "Currency",
};

// ============================================================================
// DEFAULT REPORT TEMPLATE (Seeded into mock data as initial template)
// ============================================================================
// This is the 11-section template from the PRD report-types doc.
// It serves as the seed for the first ReportTemplate entity — NOT hardcoded into UI.
// ============================================================================

function makeMetric(
    name: string,
    order: number,
    opts?: {
        fieldType?: MetricFieldType;
        isRequired?: boolean;
        capturesGoal?: boolean;
        capturesAchieved?: boolean;
        capturesYoY?: boolean;
    }
): CreateTemplateMetricInput {
    return {
        name,
        fieldType: opts?.fieldType ?? MetricFieldType.NUMBER,
        isRequired: opts?.isRequired ?? true,
        order,
        capturesGoal: opts?.capturesGoal ?? true,
        capturesAchieved: opts?.capturesAchieved ?? true,
        capturesYoY: opts?.capturesYoY ?? true,
    };
}

export const DEFAULT_REPORT_TEMPLATE: CreateReportTemplateInput = {
    name: "Harvesters Weekly Campus Report",
    description:
        "Standard weekly report template for campus-level departmental leaders covering all strategic indicators and key metrics.",
    sections: [
        {
            name: "Report Summary – Special Programs",
            description:
                "Overview of special programs including Church Planting and key program metrics.",
            order: 1,
            isRequired: true,
            subSections: [
                {
                    name: "Church Planting",
                    description: "Church planting progress and metrics.",
                    order: 1,
                    metrics: [
                        makeMetric("Number of Church Plants", 1),
                        makeMetric("Church Plant Attendance", 2),
                        makeMetric("Church Plant Offerings", 3, { fieldType: MetricFieldType.CURRENCY }),
                    ],
                },
                {
                    name: "Program Metrics",
                    description: "Key program tracking numbers.",
                    order: 2,
                    metrics: [
                        makeMetric("Total Programs Held", 1),
                        makeMetric("Total Program Attendance", 2),
                        makeMetric("Special Events Count", 3),
                    ],
                },
            ],
            metrics: [],
        },
        {
            name: "Attendance & Quality of Program",
            description: "Track weekly attendance and quality scores.",
            order: 2,
            isRequired: true,
            metrics: [
                makeMetric("Sunday Service Attendance", 1),
                makeMetric("Midweek Service Attendance", 2),
                makeMetric("Average Program Quality Score", 3, {
                    fieldType: MetricFieldType.PERCENTAGE,
                }),
                makeMetric("Online Attendance", 4),
                makeMetric("Total Unique Attendees", 5),
            ],
        },
        {
            name: "NLP (New Life Program)",
            description: "New Life Program metrics tracking new believers integration.",
            order: 3,
            isRequired: true,
            metrics: [
                makeMetric("NLP Enrollees", 1),
                makeMetric("NLP Graduates", 2),
                makeMetric("NLP Attendance", 3),
                makeMetric("NLP Retention Rate", 4, { fieldType: MetricFieldType.PERCENTAGE }),
            ],
        },
        {
            name: "Salvation",
            description: "Souls won and salvation-related metrics.",
            order: 4,
            isRequired: true,
            metrics: [
                makeMetric("Salvations (Altar Call)", 1),
                makeMetric("Salvations (Small Group)", 2),
                makeMetric("Salvations (Outreach)", 3),
                makeMetric("Total Salvations", 4),
                makeMetric("First Timer Follow-ups", 5),
            ],
        },
        {
            name: "Small Group / Cell",
            description: "Small group and cell meeting metrics.",
            order: 5,
            isRequired: true,
            metrics: [
                makeMetric("Total Cells Active", 1),
                makeMetric("Total Cell Meetings Held", 2),
                makeMetric("Total Cell Attendance", 3),
                makeMetric("Average Cell Attendance", 4),
                makeMetric("New Cells Started", 5),
                makeMetric("Cell Leaders Trained", 6),
            ],
        },
        {
            name: "Discipleship / Assimilation",
            description: "Discipleship and member assimilation tracking.",
            order: 6,
            isRequired: true,
            metrics: [
                makeMetric("New Members Assimilated", 1),
                makeMetric("Discipleship Classes Enrollment", 2),
                makeMetric("Discipleship Classes Completion", 3),
                makeMetric("Mentoring Pairs Active", 4),
                makeMetric("Water Baptism Count", 5),
            ],
        },
        {
            name: "Next Gen (Kid-Zone + Stir House)",
            description: "Children's ministry (Kid-Zone) and youth ministry (Stir House) metrics.",
            order: 7,
            isRequired: true,
            subSections: [
                {
                    name: "Kid-Zone",
                    description: "Children's ministry metrics.",
                    order: 1,
                    metrics: [
                        makeMetric("Kid-Zone Attendance", 1),
                        makeMetric("Kid-Zone New Registrations", 2),
                        makeMetric("Kid-Zone Volunteers", 3),
                        makeMetric("Kid-Zone Salvations", 4),
                    ],
                },
                {
                    name: "Stir House",
                    description: "Youth ministry metrics.",
                    order: 2,
                    metrics: [
                        makeMetric("Stir House Attendance", 1),
                        makeMetric("Stir House New Members", 2),
                        makeMetric("Stir House Salvations", 3),
                        makeMetric("Stir House Small Groups", 4),
                    ],
                },
            ],
            metrics: [],
        },
        {
            name: "Partnership",
            description: "Partnership and giving metrics.",
            order: 8,
            isRequired: true,
            metrics: [
                makeMetric("Total Partners", 1),
                makeMetric("New Partners This Week", 2),
                makeMetric("Partnership Amount", 3, { fieldType: MetricFieldType.CURRENCY }),
                makeMetric("Partnership Retention Rate", 4, { fieldType: MetricFieldType.PERCENTAGE }),
            ],
        },
        {
            name: "HAEF (Harvesters Advancement & Empowerment Fund)",
            description: "HAEF contributions and disbursement tracking.",
            order: 9,
            isRequired: true,
            metrics: [
                makeMetric("HAEF Contributions", 1, { fieldType: MetricFieldType.CURRENCY }),
                makeMetric("HAEF Disbursements", 2, { fieldType: MetricFieldType.CURRENCY }),
                makeMetric("HAEF Beneficiaries", 3),
                makeMetric("HAEF New Contributors", 4),
            ],
        },
        {
            name: "Spiritual",
            description: "Spiritual growth and prayer-related metrics.",
            order: 10,
            isRequired: false,
            metrics: [
                makeMetric("Prayer Chain Participants", 1),
                makeMetric("Fasting Participants", 2),
                makeMetric("Prophetic Words Received", 3, { isRequired: false }),
                makeMetric("Healing Testimonies", 4, { isRequired: false }),
                makeMetric("Spiritual Growth Score", 5, {
                    fieldType: MetricFieldType.PERCENTAGE,
                    isRequired: false,
                }),
            ],
        },
        {
            name: "Relationship Breakthrough",
            description: "Relationship and family ministry metrics.",
            order: 11,
            isRequired: false,
            metrics: [
                makeMetric("Marriage Counseling Sessions", 1, { isRequired: false }),
                makeMetric("Pre-Marital Counseling Sessions", 2, { isRequired: false }),
                makeMetric("Singles Ministry Attendance", 3, { isRequired: false }),
                makeMetric("Family Reconciliations", 4, { isRequired: false }),
                makeMetric("Relationship Workshops Held", 5, { isRequired: false }),
            ],
        },
    ],
    isDefault: true,
};

// ============================================================================
// REPORT VALIDATION
// ============================================================================

export const REPORT_VALIDATION = {
    /** Maximum number of sections a template can have */
    MAX_TEMPLATE_SECTIONS: 30,
    /** Maximum number of metrics a section can have */
    MAX_SECTION_METRICS: 50,
    /** Maximum number of sub-sections a section can have */
    MAX_SUB_SECTIONS: 10,
    /** Maximum notes length */
    MAX_NOTES_LENGTH: 2000,
    /** Maximum reason length for edits/requests */
    MAX_REASON_LENGTH: 1000,
} as const;
