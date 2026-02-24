// ============================================================================
// SHARED NAVIGATION ITEMS
// ============================================================================

import { UserRole } from "../types";

/** Master list — comment out any line to temporarily disable it from ALL leader navbars */
const SHARED_LEADER_BASE_NAV: RoleNavItem[] = [
    { key: "dashboard", label: "Dashboard", icon: "DashboardOutlined", path: "/leader/dashboard" },
    { key: "members", label: "Members", icon: "TeamOutlined", path: "/leader/members" },
    { key: "meetings", label: "Meetings", icon: "CalendarOutlined", path: "/leader/meetings" },
    { key: "reports", label: "Reports", icon: "FileTextOutlined", path: "/leader/reports" },
    { key: "analytics", label: "Analytics", icon: "BarChartOutlined", path: "/leader/analytics" },
    { key: "referrals", label: "Referrals", icon: "LinkOutlined", path: "/leader/referrals" },
    { key: "inbox", label: "Inbox", icon: "InboxOutlined", path: "/leader/inbox" },
];

/** Safely get a nav item from the base list by key — returns [] if commented out or missing */
function getBaseNavItem(key: string): RoleNavItem[] {
    const item = SHARED_LEADER_BASE_NAV.find((n) => n.key === key);
    return item ? [item] : [];
}

/** Optional add-on items — comment out individually to disable per-role extras */
const ADDON_NAV_ITEMS = {
    interactions: { key: "interactions", label: "Interactions", icon: "MessageOutlined", path: "/leader/interactions" } as RoleNavItem,
    followUps: { key: "follow-ups", label: "Follow-ups", icon: "PhoneOutlined", path: "/leader/follow-ups" } as RoleNavItem,
};

/** Group-level nav items — comment out to disable */
const GROUP_NAV_ITEMS = {
    groups: { key: "groups", label: "Groups", icon: "ApartmentOutlined", path: "/leader/groups" } as RoleNavItem,
    myGroup: { key: "my-group", label: "My Group", icon: "ApartmentOutlined", path: "/leader/my-group" } as RoleNavItem,
    myDepartment: { key: "my-group", label: "My Department", icon: "ApartmentOutlined", path: "/leader/my-group" } as RoleNavItem,
    myCell: { key: "my-group", label: "My Cell", icon: "ApartmentOutlined", path: "/leader/my-group" } as RoleNavItem,
};

/**
 * Build a leader navbar from the shared base.
 * - `groupItem`  — optional group/cell/department link inserted after dashboard
 * - `extras`     — optional items keyed to insertion points within the base order
 *
 * Insertion order:
 *   dashboard → [groupItem] → members → meetings → [afterMeetings]
 *   → reports → [afterReports] → analytics → referrals → inbox
 */
function buildLeaderNav(
    groupItem?: RoleNavItem,
    extras: {
        afterMeetings?: RoleNavItem[];
        afterReports?: RoleNavItem[];
    } = {}
): RoleNavItem[] {
    return [
        ...getBaseNavItem("dashboard"),
        ...(groupItem ? [groupItem] : []),
        ...getBaseNavItem("members"),
        ...getBaseNavItem("meetings"),
        ...(extras.afterMeetings ?? []),
        ...getBaseNavItem("reports"),
        ...(extras.afterReports ?? []),
        ...getBaseNavItem("analytics"),
        ...getBaseNavItem("referrals"),
        ...getBaseNavItem("inbox"),
    ];
}

// ============================================================================
// ROLE CONFIG MAP
// ============================================================================

export const ROLE_CONFIG: Record<UserRole, RoleConfig> = {
    [UserRole.SUPERADMIN]: {
        role: UserRole.SUPERADMIN,
        label: "Super Admin",
        hierarchyOrder: 0,
        dashboardRoute: "/superadmin/dashboard",
        canCreateReports: true,
        canReviewReports: true,
        canApproveReports: true,
        canManageTemplates: true,
        canDataEntry: true,
        reportVisibilityScope: "all",
        isLeadership: true,
        routePrefix: "/superadmin",
        navItems: [
            { key: "dashboard", label: "Dashboard", icon: "DashboardOutlined", path: "/superadmin/dashboard" },
            { key: "users", label: "Users", icon: "TeamOutlined", path: "/superadmin/users" },
            { key: "groups", label: "Groups", icon: "ApartmentOutlined", path: "/superadmin/groups" },
            { key: "members", label: "Members", icon: "UserOutlined", path: "/superadmin/members" },
            { key: "meetings", label: "Meetings", icon: "CalendarOutlined", path: "/superadmin/meetings/broadcast" },
            { key: "schedule", label: "Schedule", icon: "ScheduleOutlined", path: "/superadmin/schedule" },
            {
                key: "reports",
                label: "Reports",
                icon: "FileTextOutlined",
                path: "/superadmin/reports",
                children: [
                    { key: "reports-all", label: "All Reports", icon: "FileTextOutlined", path: "/superadmin/reports" },
                    { key: "reports-new", label: "New Report", icon: "PlusCircleOutlined", path: "/superadmin/reports/new" },
                    { key: "reports-data-entry", label: "Data Entry", icon: "HistoryOutlined", path: "/superadmin/reports/data-entry" },
                    { key: "reports-templates", label: "Templates", icon: "FormOutlined", path: "/superadmin/reports/templates" },
                    { key: "reports-update-requests", label: "Update Requests", icon: "PullRequestOutlined", path: "/superadmin/reports/update-requests" },
                    { key: "reports-analytics", label: "Report Analytics", icon: "BarChartOutlined", path: "/superadmin/reports/analytics" },
                ],
            },
            { key: "analytics", label: "Analytics", icon: "BarChartOutlined", path: "/superadmin/analytics" },
            { key: "referrals", label: "Referrals", icon: "LinkOutlined", path: "/superadmin/referrals" },
            { key: "inbox", label: "Inbox", icon: "InboxOutlined", path: "/superadmin/inbox" },
        ],
    },

    [UserRole.GROUP_PASTOR]: {
        role: UserRole.GROUP_PASTOR,
        label: "Group Pastor",
        hierarchyOrder: 1,
        dashboardRoute: "/leader/dashboard",
        canCreateReports: false,
        canReviewReports: true,
        canApproveReports: false,
        canManageTemplates: false,
        canDataEntry: false,
        reportVisibilityScope: "group",
        isLeadership: true,
        routePrefix: "/leader",
        navItems: buildLeaderNav(GROUP_NAV_ITEMS.groups),
    },

    [UserRole.GROUP_ADMIN]: {
        role: UserRole.GROUP_ADMIN,
        label: "Group Admin",
        hierarchyOrder: 2,
        dashboardRoute: "/leader/dashboard",
        canCreateReports: false,
        canReviewReports: true,
        canApproveReports: false,
        canManageTemplates: false,
        canDataEntry: false,
        reportVisibilityScope: "group",
        isLeadership: true,
        routePrefix: "/leader",
        navItems: buildLeaderNav(GROUP_NAV_ITEMS.groups),
    },

    [UserRole.CAMPUS_PASTOR]: {
        role: UserRole.CAMPUS_PASTOR,
        label: "Campus Pastor",
        hierarchyOrder: 3,
        dashboardRoute: "/leader/dashboard",
        canCreateReports: false,
        canReviewReports: true,
        canApproveReports: true,
        canManageTemplates: false,
        canDataEntry: false,
        reportVisibilityScope: "campus",
        isLeadership: true,
        routePrefix: "/leader",
        navItems: buildLeaderNav(GROUP_NAV_ITEMS.groups),
    },

    [UserRole.CAMPUS_ADMIN]: {
        role: UserRole.CAMPUS_ADMIN,
        label: "Campus Admin",
        hierarchyOrder: 4,
        dashboardRoute: "/leader/dashboard",
        canCreateReports: true,
        canReviewReports: false,
        canApproveReports: false,
        canManageTemplates: false,
        canDataEntry: false,
        reportVisibilityScope: "campus",
        isLeadership: true,
        routePrefix: "/leader",
        navItems: buildLeaderNav(GROUP_NAV_ITEMS.groups, {
            afterReports: [ADDON_NAV_ITEMS.interactions],
        }),
    },

    [UserRole.ZONAL_LEADER]: {
        role: UserRole.ZONAL_LEADER,
        label: "Zonal Leader",
        hierarchyOrder: 5,
        dashboardRoute: "/leader/dashboard",
        canCreateReports: false,
        canReviewReports: false,
        canApproveReports: false,
        canManageTemplates: false,
        canDataEntry: false,
        reportVisibilityScope: "campus",
        isLeadership: true,
        routePrefix: "/leader",
        navItems: buildLeaderNav(GROUP_NAV_ITEMS.myGroup, {
            afterReports: [ADDON_NAV_ITEMS.interactions],
        }),
    },

    [UserRole.HOD]: {
        role: UserRole.HOD,
        label: "Head of Department",
        hierarchyOrder: 6,
        dashboardRoute: "/leader/dashboard",
        canCreateReports: true,
        canReviewReports: false,
        canApproveReports: false,
        canManageTemplates: false,
        canDataEntry: false,
        reportVisibilityScope: "own",
        isLeadership: true,
        routePrefix: "/leader",
        navItems: buildLeaderNav(GROUP_NAV_ITEMS.myDepartment, {
            afterReports: [ADDON_NAV_ITEMS.interactions],
        }),
    },

    [UserRole.SMALL_GROUP_LEADER]: {
        role: UserRole.SMALL_GROUP_LEADER,
        label: "Small Group Leader",
        hierarchyOrder: 7,
        dashboardRoute: "/leader/dashboard",
        canCreateReports: true,
        canReviewReports: false,
        canApproveReports: false,
        canManageTemplates: false,
        canDataEntry: false,
        reportVisibilityScope: "own",
        isLeadership: true,
        routePrefix: "/leader",
        navItems: buildLeaderNav(GROUP_NAV_ITEMS.myGroup, {
            afterReports: [ADDON_NAV_ITEMS.interactions, ADDON_NAV_ITEMS.followUps],
        }),
    },

    [UserRole.CELL_LEADER]: {
        role: UserRole.CELL_LEADER,
        label: "Cell Leader",
        hierarchyOrder: 8,
        dashboardRoute: "/leader/dashboard",
        canCreateReports: true,
        canReviewReports: false,
        canApproveReports: false,
        canManageTemplates: false,
        canDataEntry: false,
        reportVisibilityScope: "own",
        isLeadership: true,
        routePrefix: "/leader",
        // Cell leaders have no analytics — override by passing a custom exclusion
        navItems: buildLeaderNav(GROUP_NAV_ITEMS.myCell, {
            afterReports: [ADDON_NAV_ITEMS.interactions, ADDON_NAV_ITEMS.followUps],
        }).filter((item) => item.key !== "analytics"),
    },

    [UserRole.DATA_ENTRY]: {
        role: UserRole.DATA_ENTRY,
        label: "Data Entry",
        hierarchyOrder: 9,
        dashboardRoute: "/leader/dashboard",
        canCreateReports: true,
        canReviewReports: false,
        canApproveReports: false,
        canManageTemplates: false,
        canDataEntry: true,
        reportVisibilityScope: "all",
        isLeadership: false,
        routePrefix: "/leader",
        // Intentionally narrow nav — not using buildLeaderNav
        navItems: [
            ...getBaseNavItem("dashboard"),
            ...getBaseNavItem("reports"),
            { key: "data-entry", label: "Data Entry", icon: "FormOutlined", path: "/leader/reports/data-entry" },
            ...getBaseNavItem("inbox"),
        ],
    },

    [UserRole.MEMBER]: {
        role: UserRole.MEMBER,
        label: "Member",
        hierarchyOrder: 10,
        dashboardRoute: "/member/dashboard",
        canCreateReports: false,
        canReviewReports: false,
        canApproveReports: false,
        canManageTemplates: false,
        canDataEntry: false,
        reportVisibilityScope: "none",
        isLeadership: false,
        routePrefix: "/member",
        navItems: [
            { key: "dashboard", label: "Dashboard", icon: "DashboardOutlined", path: "/member/dashboard" },
            { key: "my-group", label: "My Group", icon: "ApartmentOutlined", path: "/member/my-group" },
            { key: "history", label: "History", icon: "HistoryOutlined", path: "/member/history" },
            { key: "inbox", label: "Inbox", icon: "InboxOutlined", path: "/member/inbox" },
        ],
    },
};

// ============================================================================
// ROLE CONFIG HELPERS
// ============================================================================

/** Get the full configuration for a role */
export function getRoleConfig(role: UserRole): RoleConfig {
    return ROLE_CONFIG[role];
}

/** Check if a role can perform an action */
export function canRolePerformAction(
    role: UserRole,
    action: keyof Pick<
        RoleConfig,
        | "canCreateReports"
        | "canReviewReports"
        | "canApproveReports"
        | "canManageTemplates"
        | "canDataEntry"
    >
): boolean {
    return ROLE_CONFIG[role][action];
}

/** Get the navigation items for a role */
export function getRoleNavItems(role: UserRole): RoleNavItem[] {
    return ROLE_CONFIG[role].navItems;
}

/** Get the report permissions for a role */
export function getRoleReportPermissions(role: UserRole) {
    const config = ROLE_CONFIG[role];
    return {
        canCreate: config.canCreateReports,
        canReview: config.canReviewReports,
        canApprove: config.canApproveReports,
        canManageTemplates: config.canManageTemplates,
        canDataEntry: config.canDataEntry,
        visibilityScope: config.reportVisibilityScope,
    };
}

/** Get the dashboard route for a role */
export function getDashboardRoute(role: UserRole): string {
    return ROLE_CONFIG[role].dashboardRoute;
}

/** Check if a role is a leadership role */
export function isRoleLeadership(role: UserRole): boolean {
    return ROLE_CONFIG[role].isLeadership;
}

// ============================================================================
// ORGANIZATIONAL HIERARCHY CONFIGURATION
// ============================================================================
// Data-driven org structure: Cell → Zone → Area → Community → District → Campus → Group
// Adding a new level means adding one entry here, not modifying 50 files.
// ============================================================================

export const ORG_HIERARCHY_CONFIG: OrgLevelConfig[] = [
    {
        level: "CELL",
        label: "Cell",
        pluralLabel: "Cells",
        parentLevel: "ZONE",
        childLevel: null,
        membersPerUnit: 10,
        leaderRole: UserRole.CELL_LEADER,
        hasAdmin: false,
        hasPastor: false,
        hasLocation: false,
        hasMeetingFrequency: true,
        hasInviteCode: true,
        hasMemberCount: true,
        hasDepartment: false,
        hasCountry: false,
        hasRegion: false,
    },
    {
        level: "ZONE",
        label: "Zone",
        pluralLabel: "Zones",
        parentLevel: "AREA",
        childLevel: "CELL",
        membersPerUnit: 4,
        leaderRole: UserRole.ZONAL_LEADER,
        hasAdmin: false,
        hasPastor: false,
        hasLocation: false,
        hasMeetingFrequency: false,
        hasInviteCode: false,
        hasMemberCount: true,
        hasDepartment: false,
        hasCountry: false,
        hasRegion: false,
    },
    {
        level: "AREA",
        label: "Area",
        pluralLabel: "Areas",
        parentLevel: "COMMUNITY",
        childLevel: "ZONE",
        membersPerUnit: 4,
        leaderRole: null,
        hasAdmin: false,
        hasPastor: false,
        hasLocation: false,
        hasMeetingFrequency: false,
        hasInviteCode: false,
        hasMemberCount: true,
        hasDepartment: false,
        hasCountry: false,
        hasRegion: false,
    },
    {
        level: "COMMUNITY",
        label: "Community",
        pluralLabel: "Communities",
        parentLevel: "DISTRICT",
        childLevel: "AREA",
        membersPerUnit: 4,
        leaderRole: null,
        hasAdmin: false,
        hasPastor: false,
        hasLocation: false,
        hasMeetingFrequency: false,
        hasInviteCode: false,
        hasMemberCount: true,
        hasDepartment: false,
        hasCountry: false,
        hasRegion: false,
    },
    {
        level: "DISTRICT",
        label: "District",
        pluralLabel: "Districts",
        parentLevel: "CAMPUS",
        childLevel: "COMMUNITY",
        membersPerUnit: 4,
        leaderRole: null,
        hasAdmin: false,
        hasPastor: false,
        hasLocation: false,
        hasMeetingFrequency: false,
        hasInviteCode: false,
        hasMemberCount: true,
        hasDepartment: false,
        hasCountry: false,
        hasRegion: false,
    },
    {
        level: "CAMPUS",
        label: "Campus",
        pluralLabel: "Campuses",
        parentLevel: "GROUP",
        childLevel: "DISTRICT",
        membersPerUnit: 0,
        leaderRole: UserRole.CAMPUS_ADMIN,
        hasAdmin: true,
        hasPastor: true,
        hasLocation: true,
        hasMeetingFrequency: false,
        hasInviteCode: false,
        hasMemberCount: true,
        hasDepartment: true,
        hasCountry: true,
        hasRegion: true,
    },
    {
        level: "GROUP",
        label: "Group",
        pluralLabel: "Groups",
        parentLevel: null,
        childLevel: "CAMPUS",
        membersPerUnit: 0,
        leaderRole: UserRole.GROUP_ADMIN,
        hasAdmin: true,
        hasPastor: true,
        hasLocation: false,
        hasMeetingFrequency: false,
        hasInviteCode: false,
        hasMemberCount: true,
        hasDepartment: false,
        hasCountry: false,
        hasRegion: false,
    },
];

// ============================================================================
// ORG HIERARCHY HELPERS
// ============================================================================

/** Get the config for an org level */
export function getOrgLevelConfig(level: string): OrgLevelConfig | undefined {
    return ORG_HIERARCHY_CONFIG.find((c) => c.level === level);
}

/** Get the parent level of a given org level */
export function getParentLevel(level: string): string | null {
    return getOrgLevelConfig(level)?.parentLevel ?? null;
}

/** Get the child level of a given org level */
export function getChildLevel(level: string): string | null {
    return getOrgLevelConfig(level)?.childLevel ?? null;
}

/** Get the leader role for an org level */
export function getLeaderRoleForLevel(level: string): UserRole | null {
    return getOrgLevelConfig(level)?.leaderRole ?? null;
}

/** Get all org levels between two levels (inclusive) */
export function getLevelsBetween(low: string, high: string): string[] {
    const lowIdx = ORG_HIERARCHY_CONFIG.findIndex((c) => c.level === low);
    const highIdx = ORG_HIERARCHY_CONFIG.findIndex((c) => c.level === high);
    if (lowIdx === -1 || highIdx === -1) return [];
    const start = Math.min(lowIdx, highIdx);
    const end = Math.max(lowIdx, highIdx);
    return ORG_HIERARCHY_CONFIG.slice(start, end + 1).map((c) => c.level);
}

/** Get the full hierarchy chain from bottom to top */
export function getHierarchyChain(): string[] {
    return ORG_HIERARCHY_CONFIG.map((c) => c.level);
}

// ============================================================================
// DEPARTMENT CONFIGURATION
// ============================================================================
// Single registry of all department types used across the ministry.
// mockData.ts and UI components reference these keys instead of hardcoding.
// To add a new department: add one entry here. The rest propagates.
// ============================================================================

export const DEPARTMENT_CONFIG: DepartmentConfig[] = [
    {
        key: "worship",
        name: "Worship & Arts",
        description: "Music, worship leading, choir, and creative arts ministry.",
        icon: "SoundOutlined",
        isGlobal: true,
    },
    {
        key: "ushering",
        name: "Ushering & Protocol",
        description: "Ushering, crowd management, and protocol services during services and events.",
        icon: "TeamOutlined",
        isGlobal: true,
    },
    {
        key: "media",
        name: "Media & Communications",
        description: "Audio-visual production, social media, graphic design, and church communications.",
        icon: "VideoCameraOutlined",
        isGlobal: true,
    },
    {
        key: "children",
        name: "Children's Ministry",
        description: "Teaching, mentoring, and caring for children from toddlers to pre-teens.",
        icon: "SmileOutlined",
        isGlobal: true,
    },
    {
        key: "hospitality",
        name: "Hospitality",
        description: "Welcoming guests, event hosting, and refreshments coordination.",
        icon: "CoffeeOutlined",
        isGlobal: true,
    },
    {
        key: "prayer",
        name: "Prayer Ministry",
        description: "Intercessory prayer, prayer walks, and spiritual warfare coordination.",
        icon: "HeartOutlined",
        isGlobal: true,
    },
    {
        key: "outreach",
        name: "Outreach & Evangelism",
        description: "Community outreach, evangelistic campaigns, and mission trips.",
        icon: "GlobalOutlined",
        isGlobal: true,
    },
    {
        key: "welfare",
        name: "Welfare & Benevolence",
        description: "Caring for the needy, welfare programs, and community support.",
        icon: "GiftOutlined",
        isGlobal: true,
    },
];

// ============================================================================
// DEPARTMENT CONFIG HELPERS
// ============================================================================

/** Get a department config by key */
export function getDepartmentConfig(key: string): DepartmentConfig | undefined {
    return DEPARTMENT_CONFIG.find((d) => d.key === key);
}

/** Get all global departments (available at every campus) */
export function getGlobalDepartments(): DepartmentConfig[] {
    return DEPARTMENT_CONFIG.filter((d) => d.isGlobal);
}

/** Get all department keys */
export function getDepartmentKeys(): string[] {
    return DEPARTMENT_CONFIG.map((d) => d.key);
}

/** Check if an org level supports a given feature via OrgLevelConfig flags */
export function orgLevelHasFeature(
    level: string,
    feature: keyof Pick<
        OrgLevelConfig,
        | "hasLocation"
        | "hasMeetingFrequency"
        | "hasInviteCode"
        | "hasMemberCount"
        | "hasDepartment"
        | "hasCountry"
        | "hasRegion"
    >
): boolean {
    const config = getOrgLevelConfig(level);
    return config ? config[feature] : false;
}
