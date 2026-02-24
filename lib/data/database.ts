import bcrypt from "bcryptjs";
import {
  MembershipRequestStatus,
  CampaignStatus,
  MeetingLevel,
  CampaignInteractionType,
  InviteLinkType,
  ReportStatus,
  ReportEventType,
  ReportEditStatus,
  ReportUpdateRequestStatus,
} from "@/lib/types";
import { emitDbChange } from "@/lib/utils/dbEvents";
import {
  mockUsers,
  mockGroups,
  mockMeetings,
  mockInteractions,
  mockMembershipRequests,
  mockNotifications,
  mockCampuses,
  mockOrgGroups,
  mockDepartments,
  mockCells,
  mockCampaigns,
  mockCampaignInteractions,
  mockInviteLinks,
  mockInviteLinkVisits,
  mockReportTemplates,
  mockReportTemplateVersions,
  mockReports,
  mockReportEvents,
  mockReportVersions,
  mockReportEdits,
  mockReportUpdateRequests,
} from "./mockData";

// ============================================================================
// IN-MEMORY DATABASE (SINGLETON PATTERN)
// Uses globalThis to survive Next.js hot-reloads in development.
// ============================================================================

const cloneData = <T>(data: T): T => JSON.parse(JSON.stringify(data));

const globalForDb = globalThis as unknown as {
  dbStore?: {
    users: User[];
    groups: Group[];
    meetings: Meeting[];
    interactions: Interaction[];
    membershipRequests: MembershipRequest[];
    notifications: appNotification[];
    campuses: Campus[];
    zones: Zone[];
    orgGroups: OrgGroup[];
    departments: Department[];
    cells: Cell[];
    campaigns: Campaign[];
    campaignInteractions: CampaignInteraction[];
    inviteLinks: InviteLink[];
    inviteLinkVisits: InviteLinkVisit[];
    reportTemplates: ReportTemplate[];
    reportTemplateVersions: ReportTemplateVersion[];
    reports: PeriodicReport[];
    reportEvents: ReportEvent[];
    reportVersions: ReportVersion[];
    reportEdits: ReportEdit[];
    reportUpdateRequests: ReportUpdateRequest[];
  };
};

if (!globalForDb.dbStore) {
  globalForDb.dbStore = {
    users: cloneData(mockUsers),
    groups: cloneData(mockGroups),
    meetings: cloneData(mockMeetings),
    interactions: cloneData(mockInteractions),
    membershipRequests: cloneData(mockMembershipRequests),
    notifications: cloneData(mockNotifications),
    campuses: cloneData(mockCampuses),
    zones: cloneData(mockOrgGroups).map((g: OrgGroup): Zone => ({
      id: g.id,
      name: g.name,
      description: g.description,
      orgLevel: "ZONE" as const,
      parentId: null,
      parentLevel: null,
      region: g.region,
      leaderId: g.leaderId,
      isActive: g.isActive,
      createdAt: g.createdAt,
      updatedAt: g.updatedAt,
    })),
    orgGroups: cloneData(mockOrgGroups),
    departments: cloneData(mockDepartments),
    cells: cloneData(mockCells),
    campaigns: cloneData(mockCampaigns),
    campaignInteractions: cloneData(mockCampaignInteractions),
    inviteLinks: cloneData(mockInviteLinks),
    inviteLinkVisits: cloneData(mockInviteLinkVisits),
    reportTemplates: cloneData(mockReportTemplates),
    reportTemplateVersions: cloneData(mockReportTemplateVersions),
    reports: cloneData(mockReports),
    reportEvents: cloneData(mockReportEvents),
    reportVersions: cloneData(mockReportVersions),
    reportEdits: cloneData(mockReportEdits),
    reportUpdateRequests: cloneData(mockReportUpdateRequests),
  };
}

// ── Direct references into the singleton store ──────────────────────────────
// Using a getter-based approach ensures every read goes through GlobalForDb,
// so even if a module is re-evaluated we always hit the same arrays.
const store = () => globalForDb.dbStore!;

const users = store().users;
const groups = store().groups;
const meetings = store().meetings;
const interactions = store().interactions;
const membershipRequests = store().membershipRequests;
const notifications = store().notifications;
const campuses = store().campuses;
const zones = store().zones;
const orgGroups = store().orgGroups;
const departments = store().departments;
const cells = store().cells;
const campaigns = store().campaigns;
const campaignInteractions = store().campaignInteractions;
const inviteLinks = store().inviteLinks;
const inviteLinkVisits = store().inviteLinkVisits;
const reportTemplates = store().reportTemplates;
const reportTemplateVersions = store().reportTemplateVersions;
const reports = store().reports;
const reportEvents = store().reportEvents;
const reportVersions = store().reportVersions;
const reportEdits = store().reportEdits;
const reportUpdateRequests = store().reportUpdateRequests;

// ── Helpers ──────────────────────────────────────────────────────────────────
const generateId = () =>
  `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
const now = () => new Date().toISOString();
const generateCode = () =>
  Math.random().toString(36).substring(2, 10).toUpperCase();

/** Shared helper: convert User → UserProfile (strips password). */
const toProfile = (u: User): UserProfile => ({
  id: u.id,
  email: u.email,
  firstName: u.firstName,
  lastName: u.lastName,
  phone: u.phone,
  whatsappPhone: u.whatsappPhone,
  location: u.location,
  age: u.age,
  maritalStatus: u.maritalStatus,
  employmentStatus: u.employmentStatus,
  interests: u.interests,
  role: u.role,
  campusId: u.campusId,
  zoneId: u.zoneId,
  departmentId: u.departmentId,
  groupId: u.groupId,
  cellId: u.cellId,
  avatar: u.avatar,
  isActive: u.isActive,
  inviteCode: u.inviteCode,
  createdAt: u.createdAt,
  updatedAt: u.updatedAt,
});

// ============================================================================
// USER OPERATIONS
// ============================================================================

export const userDb = {
  findAll: (filters?: UserFilters): User[] => {
    let result = [...users];

    if (filters?.role) result = result.filter((u) => u.role === filters.role);
    if (filters?.groupId)
      result = result.filter((u) => u.groupId === filters.groupId);
    if (filters?.campusId)
      result = result.filter((u) => u.campusId === filters.campusId);
    if (filters?.zoneId)
      result = result.filter((u) => u.zoneId === filters.zoneId);
    if (filters?.departmentId)
      result = result.filter((u) => u.departmentId === filters.departmentId);
    if (filters?.cellId)
      result = result.filter((u) => u.cellId === filters.cellId);
    if (filters?.isActive !== undefined)
      result = result.filter((u) => u.isActive === filters.isActive);
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (u) =>
          u.firstName.toLowerCase().includes(q) ||
          u.lastName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.phone?.includes(q)
      );
    }

    return result;
  },

  findById: (id: string): User | undefined => users.find((u) => u.id === id),

  findByEmail: (email: string): User | undefined =>
    users.find((u) => u.email.toLowerCase() === email.toLowerCase()),

  findByInviteCode: (code: string): User | undefined =>
    users.find((u) => u.inviteCode === code),

  create: (data: Omit<User, "id" | "createdAt" | "updatedAt">): User => {
    const user: User = {
      ...data,
      id: generateId(),
      inviteCode: data.inviteCode || generateCode(),
      createdAt: now(),
      updatedAt: now(),
    };
    users.push(user);
    emitDbChange("users", "create", user.id);
    return user;
  },

  update: (id: string, data: Partial<User>): User | undefined => {
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) return undefined;
    users[idx] = { ...users[idx], ...data, updatedAt: now() };
    emitDbChange("users", "update", id);
    return users[idx];
  },

  delete: (id: string): boolean => {
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) return false;
    users.splice(idx, 1);
    emitDbChange("users", "delete", id);
    return true;
  },

  verifyPassword: async (plain: string, hashed: string): Promise<boolean> => {
    return bcrypt.compare(plain, hashed);
  },

  hashPassword: async (password: string): Promise<string> => {
    return bcrypt.hash(password, 10);
  },

  count: (filters?: UserFilters): number => userDb.findAll(filters).length,

  // Alias methods for compatibility
  comparePassword: async (plain: string, hashed: string): Promise<boolean> => {
    return bcrypt.compare(plain, hashed);
  },

  updatePassword: async (
    id: string,
    hashedPassword: string
  ): Promise<User | undefined> => {
    return userDb.update(id, { password: hashedPassword });
  },
};

// ============================================================================
// ZONE OPERATIONS (top-level org unit — contains campuses)
// ============================================================================

export const zoneDb = {
  findAll: (filters?: { isActive?: boolean; search?: string }): Zone[] => {
    let result = [...zones];
    if (filters?.isActive !== undefined)
      result = result.filter((z) => z.isActive === filters.isActive);
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (z) =>
          z.name.toLowerCase().includes(q) ||
          z.description.toLowerCase().includes(q) ||
          z.region?.toLowerCase().includes(q)
      );
    }
    return result;
  },

  findById: (id: string): Zone | undefined => zones.find((z) => z.id === id),

  create: (data: CreateZoneInput): Zone => {
    const zone: Zone = {
      id: generateId(),
      ...data,
      orgLevel: "ZONE",
      parentId: null,
      parentLevel: null,
      isActive: true,
      createdAt: now(),
      updatedAt: now(),
    };
    zones.push(zone);
    return zone;
  },

  update: (id: string, data: UpdateZoneInput): Zone | undefined => {
    const idx = zones.findIndex((z) => z.id === id);
    if (idx === -1) return undefined;
    zones[idx] = { ...zones[idx], ...data, updatedAt: now() };
    return zones[idx];
  },

  delete: (id: string): boolean => {
    const idx = zones.findIndex((z) => z.id === id);
    if (idx === -1) return false;
    zones.splice(idx, 1);
    return true;
  },

  getWithDetails: (id: string): ZoneWithDetails | undefined => {
    const zone = zones.find((z) => z.id === id);
    if (!zone) return undefined;

    const leader = users.find((u) => u.id === zone.leaderId);
    const zoneCampuses = campuses.filter((c) => c.parentId === zone.id);
    const zoneDepts = departments.filter((d) => d.zoneId === zone.id);
    const zoneMembers = users.filter((u) => u.zoneId === zone.id);
    const zoneGroups = groups.filter((g) => g.zoneId === zone.id);

    return {
      ...zone,
      leader: leader ? toProfile(leader) : undefined,
      campuses: zoneCampuses,
      departments: zoneDepts,
      groups: zoneGroups,
      totalCampuses: zoneCampuses.length,
      totalDepartments: zoneDepts.length,
      totalMembers: zoneMembers.length,
    };
  },

  count: (): number => zones.length,
};

// ============================================================================
// ORG GROUP OPERATIONS (top-level org entity in hierarchy)
// ============================================================================

export const orgGroupDb = {
  findAll: (filters?: { isActive?: boolean; country?: string; search?: string }): OrgGroup[] => {
    let result = [...orgGroups];
    if (filters?.isActive !== undefined)
      result = result.filter((g) => g.isActive === filters.isActive);
    if (filters?.country)
      result = result.filter((g) => g.country === filters.country);
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (g) =>
          g.name.toLowerCase().includes(q) ||
          g.description.toLowerCase().includes(q) ||
          g.country?.toLowerCase().includes(q)
      );
    }
    return result;
  },

  findById: (id: string): OrgGroup | undefined =>
    orgGroups.find((g) => g.id === id),

  create: (data: CreateOrgGroupInput): OrgGroup => {
    const group: OrgGroup = {
      id: generateId(),
      orgLevel: "GROUP",
      parentId: null,
      parentLevel: null,
      ...data,
      isActive: true,
      createdAt: now(),
      updatedAt: now(),
    };
    orgGroups.push(group);
    return group;
  },

  update: (id: string, data: UpdateOrgGroupInput): OrgGroup | undefined => {
    const idx = orgGroups.findIndex((g) => g.id === id);
    if (idx === -1) return undefined;
    orgGroups[idx] = { ...orgGroups[idx], ...data, updatedAt: now() };
    return orgGroups[idx];
  },

  delete: (id: string): boolean => {
    const idx = orgGroups.findIndex((g) => g.id === id);
    if (idx === -1) return false;
    orgGroups.splice(idx, 1);
    return true;
  },

  getWithDetails: (id: string): OrgGroupWithDetails | undefined => {
    const group = orgGroups.find((g) => g.id === id);
    if (!group) return undefined;

    const leader = users.find((u) => u.id === group.leaderId);
    const groupCampuses = campuses.filter((c) => c.parentId === group.id);
    const groupMembers = users.filter((u) => u.zoneId === group.id);

    return {
      ...group,
      leader: leader ? toProfile(leader) : undefined,
      campuses: groupCampuses,
      totalCampuses: groupCampuses.length,
      totalMembers: groupMembers.length,
    };
  },

  count: (): number => orgGroups.length,
};

// ============================================================================
// CAMPUS OPERATIONS (belong to org groups via parentId)
// ============================================================================

export const campusDb = {
  findAll: (filters?: {
    parentId?: string;
    isActive?: boolean;
    search?: string;
  }): Campus[] => {
    let result = [...campuses];
    if (filters?.parentId)
      result = result.filter((c) => c.parentId === filters.parentId);
    if (filters?.isActive !== undefined)
      result = result.filter((c) => c.isActive === filters.isActive);
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q)
      );
    }
    return result;
  },

  findById: (id: string): Campus | undefined =>
    campuses.find((c) => c.id === id),

  create: (data: CreateCampusInput): Campus => {
    const campus: Campus = {
      id: generateId(),
      ...data,
      orgLevel: "CAMPUS",
      parentId: data.parentId,
      parentLevel: "GROUP",
      isActive: true,
      createdAt: now(),
      updatedAt: now(),
    };
    campuses.push(campus);
    return campus;
  },

  update: (id: string, data: UpdateCampusInput): Campus | undefined => {
    const idx = campuses.findIndex((c) => c.id === id);
    if (idx === -1) return undefined;
    campuses[idx] = { ...campuses[idx], ...data, updatedAt: now() };
    return campuses[idx];
  },

  delete: (id: string): boolean => {
    const idx = campuses.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    campuses.splice(idx, 1);
    return true;
  },

  getWithDetails: (id: string): CampusWithDetails | undefined => {
    const campus = campuses.find((c) => c.id === id);
    if (!campus) return undefined;

    const orgGroup = orgGroups.find((g) => g.id === campus.parentId);
    const admin = users.find((u) => u.id === campus.adminId);
    const campusDepts = departments.filter((d) => d.campusId === campus.id);
    const campusGroups = groups.filter((g) => g.campusId === campus.id);
    const campusCells = cells.filter((c) => c.campusId === campus.id);
    const campusMembers = users.filter((u) => u.campusId === campus.id);

    return {
      ...campus,
      orgGroup: orgGroup,
      admin: admin ? toProfile(admin) : undefined,
      departments: campusDepts,
      groups: campusGroups,
      cells: campusCells,
      totalDepartments: campusDepts.length,
      totalGroups: campusGroups.length,
      totalCells: campusCells.length,
      totalMembers: campusMembers.length,
    };
  },

  count: (filters?: { parentId?: string }): number =>
    campusDb.findAll(filters).length,
};

// ============================================================================
// DEPARTMENT OPERATIONS (belong to campuses)
// ============================================================================

export const departmentDb = {
  findAll: (filters?: {
    campusId?: string;
    zoneId?: string;
    isActive?: boolean;
    search?: string;
  }): Department[] => {
    let result = [...departments];
    if (filters?.campusId)
      result = result.filter((d) => d.campusId === filters.campusId);
    if (filters?.zoneId)
      result = result.filter((d) => d.zoneId === filters.zoneId);
    if (filters?.isActive !== undefined)
      result = result.filter((d) => d.isActive === filters.isActive);
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q)
      );
    }
    return result;
  },

  findById: (id: string): Department | undefined =>
    departments.find((d) => d.id === id),

  create: (data: CreateDepartmentInput): Department => {
    const dept: Department = {
      id: generateId(),
      ...data,
      orgLevel: "DEPARTMENT",
      parentId: data.campusId,
      parentLevel: "CAMPUS",
      isActive: true,
      createdAt: now(),
      updatedAt: now(),
    };
    departments.push(dept);
    return dept;
  },

  update: (id: string, data: UpdateDepartmentInput): Department | undefined => {
    const idx = departments.findIndex((d) => d.id === id);
    if (idx === -1) return undefined;
    departments[idx] = { ...departments[idx], ...data, updatedAt: now() };
    return departments[idx];
  },

  delete: (id: string): boolean => {
    const idx = departments.findIndex((d) => d.id === id);
    if (idx === -1) return false;
    departments.splice(idx, 1);
    return true;
  },

  getWithDetails: (id: string): DepartmentWithDetails | undefined => {
    const dept = departments.find((d) => d.id === id);
    if (!dept) return undefined;

    const campus = campuses.find((c) => c.id === dept.campusId);
    const hod = users.find((u) => u.id === dept.hodId);
    const deptGroups = groups.filter((g) => g.departmentId === dept.id);
    const deptMembers = users.filter((u) => u.departmentId === dept.id);

    return {
      ...dept,
      campus: campus as Campus,
      hod: hod ? toProfile(hod) : undefined,
      groups: deptGroups,
      totalGroups: deptGroups.length,
      totalMembers: deptMembers.length,
    };
  },

  count: (filters?: { campusId?: string; zoneId?: string }): number =>
    departmentDb.findAll(filters).length,
};

// ============================================================================
// GROUP OPERATIONS (small groups)
// ============================================================================

export const groupDb = {
  findAll: (filters?: GroupFilters): Group[] => {
    let result = [...groups];
    if (filters?.campusId)
      result = result.filter((g) => g.campusId === filters.campusId);
    if (filters?.zoneId)
      result = result.filter((g) => g.zoneId === filters.zoneId);
    if (filters?.departmentId)
      result = result.filter((g) => g.departmentId === filters.departmentId);
    if (filters?.leaderId)
      result = result.filter((g) => g.leaderId === filters.leaderId);
    if (filters?.isActive !== undefined)
      result = result.filter((g) => g.isActive === filters.isActive);
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (g) =>
          g.name.toLowerCase().includes(q) ||
          g.description.toLowerCase().includes(q)
      );
    }
    return result;
  },

  findById: (id: string): Group | undefined => groups.find((g) => g.id === id),

  findByInviteCode: (code: string): Group | undefined =>
    groups.find((g) => g.inviteCode === code),

  create: (data: CreateGroupInput): Group => {
    const group: Group = {
      id: generateId(),
      ...data,
      orgLevel: "SMALL_GROUP",
      parentId: data.campusId || null,
      parentLevel: "CAMPUS",
      campusId: data.campusId || "",
      zoneId: data.zoneId || "",
      departmentId: data.departmentId || undefined,
      memberCount: 0,
      inviteCode: generateCode(),
      isActive: true,
      createdAt: now(),
      updatedAt: now(),
    };
    groups.push(group);
    emitDbChange("groups", "create", group.id);
    return group;
  },

  update: (id: string, data: Partial<Group>): Group | undefined => {
    const idx = groups.findIndex((g) => g.id === id);
    if (idx === -1) return undefined;
    groups[idx] = { ...groups[idx], ...data, updatedAt: now() };
    emitDbChange("groups", "update", id);
    return groups[idx];
  },

  delete: (id: string): boolean => {
    const idx = groups.findIndex((g) => g.id === id);
    if (idx === -1) return false;
    groups.splice(idx, 1);
    emitDbChange("groups", "delete", id);
    return true;
  },

  getMembers: (groupId: string): User[] =>
    users.filter((u) => u.groupId === groupId),

  count: (filters?: GroupFilters): number => groupDb.findAll(filters).length,
};

// ============================================================================
// CELL OPERATIONS
// ============================================================================

export const cellDb = {
  findAll: (filters?: {
    groupId?: string;
    campusId?: string;
    zoneId?: string;
    departmentId?: string;
    leaderId?: string;
    isActive?: boolean;
    search?: string;
  }): Cell[] => {
    let result = [...cells];
    if (filters?.groupId)
      result = result.filter((c) => c.groupId === filters.groupId);
    if (filters?.campusId)
      result = result.filter((c) => c.campusId === filters.campusId);
    if (filters?.zoneId)
      result = result.filter((c) => c.zoneId === filters.zoneId);
    if (filters?.departmentId)
      result = result.filter((c) => c.departmentId === filters.departmentId);
    if (filters?.leaderId)
      result = result.filter((c) => c.leaderId === filters.leaderId);
    if (filters?.isActive !== undefined)
      result = result.filter((c) => c.isActive === filters.isActive);
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q)
      );
    }
    return result;
  },

  findById: (id: string): Cell | undefined => cells.find((c) => c.id === id),

  findByInviteCode: (code: string): Cell | undefined =>
    cells.find((c) => c.inviteCode === code),

  create: (data: CreateCellInput): Cell => {
    const cell: Cell = {
      id: generateId(),
      ...data,
      orgLevel: "CELL",
      parentId: data.groupId,
      parentLevel: "SMALL_GROUP",
      memberCount: 0,
      inviteCode: generateCode(),
      isActive: true,
      createdAt: now(),
      updatedAt: now(),
    };
    cells.push(cell);
    return cell;
  },

  update: (id: string, data: Partial<Cell>): Cell | undefined => {
    const idx = cells.findIndex((c) => c.id === id);
    if (idx === -1) return undefined;
    cells[idx] = { ...cells[idx], ...data, updatedAt: now() };
    return cells[idx];
  },

  delete: (id: string): boolean => {
    const idx = cells.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    cells.splice(idx, 1);
    return true;
  },

  getMembers: (cellId: string): User[] =>
    users.filter((u) => u.cellId === cellId),

  count: (filters?: { groupId?: string; campusId?: string }): number =>
    cellDb.findAll(filters).length,
};

// ============================================================================
// MEETING OPERATIONS (hierarchy-level aware)
// ============================================================================

export const meetingDb = {
  findAll: (filters?: MeetingFilters): Meeting[] => {
    let result = [...meetings];

    if (filters?.groupId)
      result = result.filter((m) => m.groupId === filters.groupId);
    if (filters?.campusId)
      result = result.filter((m) => m.campusId === filters.campusId);
    if (filters?.zoneId)
      result = result.filter((m) => m.zoneId === filters.zoneId);
    if (filters?.departmentId)
      result = result.filter((m) => m.departmentId === filters.departmentId);
    if (filters?.cellId)
      result = result.filter((m) => m.cellId === filters.cellId);
    if (filters?.level)
      result = result.filter((m) => m.level === filters.level);
    if (filters?.createdById)
      result = result.filter((m) => m.createdById === filters.createdById);
    if (filters?.startDate)
      result = result.filter((m) => m.date >= filters.startDate!);
    if (filters?.endDate)
      result = result.filter((m) => m.date <= filters.endDate!);
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (m) =>
          m.title?.toLowerCase().includes(q) ||
          m.topic?.toLowerCase().includes(q)
      );
    }

    // Most recent first
    result.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    return result;
  },

  findById: (id: string): Meeting | undefined =>
    meetings.find((m) => m.id === id),

  create: (data: Omit<Meeting, "id" | "createdAt" | "updatedAt">): Meeting => {
    const meeting: Meeting = {
      ...data,
      id: generateId(),
      createdAt: now(),
      updatedAt: now(),
    };
    meetings.push(meeting);
    emitDbChange("meetings", "create", meeting.id);
    return meeting;
  },

  update: (id: string, data: Partial<Meeting>): Meeting | undefined => {
    const idx = meetings.findIndex((m) => m.id === id);
    if (idx === -1) return undefined;
    meetings[idx] = { ...meetings[idx], ...data, updatedAt: now() };
    emitDbChange("meetings", "update", id);
    return meetings[idx];
  },

  delete: (id: string): boolean => {
    const idx = meetings.findIndex((m) => m.id === id);
    if (idx === -1) return false;
    meetings.splice(idx, 1);
    emitDbChange("meetings", "delete", id);
    return true;
  },

  count: (filters?: MeetingFilters): number =>
    meetingDb.findAll(filters).length,
};

// ============================================================================
// INTERACTION OPERATIONS
// ============================================================================

export const interactionDb = {
  findAll: (filters?: InteractionFilters): Interaction[] => {
    let result = [...interactions];
    if (filters?.leaderId)
      result = result.filter((i) => i.leaderId === filters.leaderId);
    if (filters?.memberId)
      result = result.filter((i) => i.memberId === filters.memberId);
    if (filters?.type) result = result.filter((i) => i.type === filters.type);
    if (filters?.startDate)
      result = result.filter((i) => i.timestamp >= filters.startDate!);
    if (filters?.endDate)
      result = result.filter((i) => i.timestamp <= filters.endDate!);

    result.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    return result;
  },

  findById: (id: string): Interaction | undefined =>
    interactions.find((i) => i.id === id),

  create: (data: Omit<Interaction, "id" | "createdAt">): Interaction => {
    const interaction: Interaction = {
      ...data,
      id: generateId(),
      createdAt: now(),
    };
    interactions.push(interaction);
    emitDbChange("interactions", "create", interaction.id);
    return interaction;
  },

  update: (id: string, data: Partial<Interaction>): Interaction | undefined => {
    const idx = interactions.findIndex((i) => i.id === id);
    if (idx === -1) return undefined;
    interactions[idx] = { ...interactions[idx], ...data };
    emitDbChange("interactions", "update", id);
    return interactions[idx];
  },

  delete: (id: string): boolean => {
    const idx = interactions.findIndex((i) => i.id === id);
    if (idx === -1) return false;
    interactions.splice(idx, 1);
    emitDbChange("interactions", "delete", id);
    return true;
  },

  count: (filters?: InteractionFilters): number =>
    interactionDb.findAll(filters).length,
};

// ============================================================================
// MEMBERSHIP REQUEST OPERATIONS
// ============================================================================

export const membershipRequestDb = {
  findAll: (filters?: {
    memberId?: string;
    toGroupId?: string;
    toCellId?: string;
    toCampusId?: string;
    toZoneId?: string;
    status?: string;
  }): MembershipRequest[] => {
    let result = [...membershipRequests];
    if (filters?.memberId)
      result = result.filter((r) => r.memberId === filters.memberId);
    if (filters?.toGroupId)
      result = result.filter((r) => r.toGroupId === filters.toGroupId);
    if (filters?.toCellId)
      result = result.filter((r) => r.toCellId === filters.toCellId);
    if (filters?.toCampusId)
      result = result.filter((r) => r.toCampusId === filters.toCampusId);
    if (filters?.toZoneId)
      result = result.filter((r) => r.toZoneId === filters.toZoneId);
    if (filters?.status)
      result = result.filter((r) => r.status === filters.status);

    result.sort(
      (a, b) =>
        new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
    );
    return result;
  },

  findById: (id: string): MembershipRequest | undefined =>
    membershipRequests.find((r) => r.id === id),

  create: (
    data: Omit<
      MembershipRequest,
      "id" | "requestedAt" | "respondedAt" | "respondedById" | "responseMessage"
    >
  ): MembershipRequest => {
    const request: MembershipRequest = {
      ...data,
      id: generateId(),
      requestedAt: now(),
      respondedAt: undefined,
      respondedById: undefined,
      responseMessage: undefined,
    };
    membershipRequests.push(request);
    emitDbChange("membershipRequests", "create", request.id);
    return request;
  },

  update: (
    id: string,
    data: Partial<MembershipRequest>
  ): MembershipRequest | undefined => {
    const idx = membershipRequests.findIndex((r) => r.id === id);
    if (idx === -1) return undefined;
    membershipRequests[idx] = { ...membershipRequests[idx], ...data };
    emitDbChange("membershipRequests", "update", id);
    return membershipRequests[idx];
  },

  respond: (
    id: string,
    status: MembershipRequestStatus,
    respondedById: string,
    responseMessage?: string
  ): MembershipRequest | undefined => {
    const idx = membershipRequests.findIndex((r) => r.id === id);
    if (idx === -1) return undefined;
    membershipRequests[idx] = {
      ...membershipRequests[idx],
      status,
      respondedAt: now(),
      respondedById,
      responseMessage,
    };
    emitDbChange("membershipRequests", "update", id);
    return membershipRequests[idx];
  },

  count: (filters?: { toGroupId?: string; status?: string }): number =>
    membershipRequestDb.findAll(filters).length,

  delete: (id: string): boolean => {
    const idx = membershipRequests.findIndex((r) => r.id === id);
    if (idx === -1) return false;
    membershipRequests.splice(idx, 1);
    return true;
  },
};

// ============================================================================
// NOTIFICATION OPERATIONS
// ============================================================================

export const notificationDb = {
  findByUserId: (userId: string): appNotification[] =>
    notifications
      .filter((n) => n.userId === userId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),

  findById: (id: string): appNotification | undefined =>
    notifications.find((n) => n.id === id),

  create: (
    data: Omit<appNotification, "id" | "createdAt" | "read">
  ): appNotification => {
    // Look up the user's email for email simulation
    const recipientUser = users.find((u) => u.id === data.userId);
    const channel: NotificationChannel = data.channel || "both";
    const timestamp = now();

    const emailMeta: appNotification["emailMeta"] =
      (channel === "email" || channel === "both") && recipientUser
        ? {
          to: recipientUser.email,
          subject: data.title,
          body: `Dear ${recipientUser.firstName},\n\n${data.message}\n\n— Harvesters Small Groups CRM`,
          sentAt: timestamp,
        }
        : undefined;

    const notification: appNotification = {
      ...data,
      id: generateId(),
      read: false,
      createdAt: timestamp,
      channel,
      emailSent: !!emailMeta,
      emailMeta,
    };
    notifications.push(notification);
    emitDbChange("notifications", "create", notification.id);
    return notification;
  },

  markAsRead: (id: string): appNotification | undefined => {
    const idx = notifications.findIndex((n) => n.id === id);
    if (idx === -1) return undefined;
    notifications[idx] = { ...notifications[idx], read: true };
    emitDbChange("notifications", "update", id);
    return notifications[idx];
  },

  markAllAsRead: (userId: string): number => {
    let count = 0;
    for (let i = 0; i < notifications.length; i++) {
      if (notifications[i].userId === userId && !notifications[i].read) {
        notifications[i] = { ...notifications[i], read: true };
        count++;
      }
    }
    if (count > 0) emitDbChange("notifications", "update");
    return count;
  },

  delete: (id: string): boolean => {
    const idx = notifications.findIndex((n) => n.id === id);
    if (idx === -1) return false;
    notifications.splice(idx, 1);
    emitDbChange("notifications", "delete", id);
    return true;
  },

  unreadCount: (userId: string): number =>
    notifications.filter((n) => n.userId === userId && !n.read).length,
};

// ============================================================================
// CAMPAIGN OPERATIONS (24-hour status-like updates)
// ============================================================================

export const campaignDb = {
  findAll: (filters?: {
    status?: CampaignStatus;
    targetLevel?: MeetingLevel;
    targetCampusId?: string;
    targetZoneId?: string;
    createdById?: string;
    search?: string;
  }): Campaign[] => {
    let result = [...campaigns];
    if (filters?.status)
      result = result.filter((c) => c.status === filters.status);
    if (filters?.targetLevel)
      result = result.filter((c) => c.targetLevel === filters.targetLevel);
    if (filters?.targetCampusId)
      result = result.filter(
        (c) => c.targetCampusId === filters.targetCampusId
      );
    if (filters?.targetZoneId)
      result = result.filter((c) => c.targetZoneId === filters.targetZoneId);
    if (filters?.createdById)
      result = result.filter((c) => c.createdById === filters.createdById);
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q)
      );
    }

    result.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return result;
  },

  findById: (id: string): Campaign | undefined =>
    campaigns.find((c) => c.id === id),

  /** Return only campaigns currently visible (ACTIVE & not expired). */
  findActive: (filters?: {
    targetCampusId?: string;
    targetZoneId?: string;
  }): Campaign[] => {
    const rightNow = new Date().toISOString();
    let result = campaigns.filter(
      (c) =>
        c.status === ("ACTIVE" as CampaignStatus) &&
        (!c.expiresAt || c.expiresAt > rightNow)
    );
    if (filters?.targetCampusId)
      result = result.filter(
        (c) => !c.targetCampusId || c.targetCampusId === filters.targetCampusId
      );
    if (filters?.targetZoneId)
      result = result.filter(
        (c) => !c.targetZoneId || c.targetZoneId === filters.targetZoneId
      );
    return result;
  },

  create: (
    data: Omit<
      Campaign,
      | "id"
      | "viewCount"
      | "clickCount"
      | "shareCount"
      | "createdAt"
      | "updatedAt"
    >
  ): Campaign => {
    const campaign: Campaign = {
      ...data,
      id: generateId(),
      viewCount: 0,
      clickCount: 0,
      shareCount: 0,
      createdAt: now(),
      updatedAt: now(),
    };
    campaigns.push(campaign);
    return campaign;
  },

  update: (id: string, data: Partial<Campaign>): Campaign | undefined => {
    const idx = campaigns.findIndex((c) => c.id === id);
    if (idx === -1) return undefined;
    campaigns[idx] = { ...campaigns[idx], ...data, updatedAt: now() };
    return campaigns[idx];
  },

  delete: (id: string): boolean => {
    const idx = campaigns.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    campaigns.splice(idx, 1);
    return true;
  },

  /** Atomically increment view / click / share counters. */
  incrementCounter: (
    id: string,
    counter: "viewCount" | "clickCount" | "shareCount"
  ): Campaign | undefined => {
    const idx = campaigns.findIndex((c) => c.id === id);
    if (idx === -1) return undefined;
    campaigns[idx] = {
      ...campaigns[idx],
      [counter]: (campaigns[idx][counter] || 0) + 1,
      updatedAt: now(),
    };
    return campaigns[idx];
  },

  /** Auto-expire campaigns past their expiresAt. Returns count expired. */
  expireStale: (): number => {
    const rightNow = new Date().toISOString();
    let expired = 0;
    campaigns.forEach((c, idx) => {
      if (
        c.status === ("ACTIVE" as CampaignStatus) &&
        c.expiresAt &&
        c.expiresAt <= rightNow
      ) {
        campaigns[idx] = {
          ...c,
          status: "EXPIRED" as CampaignStatus,
          updatedAt: now(),
        };
        expired++;
      }
    });
    return expired;
  },

  count: (filters?: { status?: CampaignStatus }): number =>
    campaignDb.findAll(filters).length,
};

// ============================================================================
// CAMPAIGN INTERACTION OPERATIONS
// ============================================================================

export const campaignInteractionDb = {
  findAll: (filters?: {
    campaignId?: string;
    userId?: string;
    type?: CampaignInteractionType;
    referralCode?: string;
  }): CampaignInteraction[] => {
    let result = [...campaignInteractions];
    if (filters?.campaignId)
      result = result.filter((ci) => ci.campaignId === filters.campaignId);
    if (filters?.userId)
      result = result.filter((ci) => ci.userId === filters.userId);
    if (filters?.type) result = result.filter((ci) => ci.type === filters.type);
    if (filters?.referralCode)
      result = result.filter((ci) => ci.referralCode === filters.referralCode);
    return result;
  },

  create: (
    data: Omit<CampaignInteraction, "id" | "createdAt">
  ): CampaignInteraction => {
    const ci: CampaignInteraction = {
      ...data,
      id: generateId(),
      createdAt: now(),
    };
    campaignInteractions.push(ci);
    return ci;
  },

  countByCampaign: (
    campaignId: string,
    type?: CampaignInteractionType
  ): number => {
    let result = campaignInteractions.filter(
      (ci) => ci.campaignId === campaignId
    );
    if (type) result = result.filter((ci) => ci.type === type);
    return result.length;
  },
};

// ============================================================================
// INVITE LINK OPERATIONS
// ============================================================================

export const inviteLinkDb = {
  findAll: (filters?: {
    createdById?: string;
    type?: InviteLinkType;
    targetId?: string;
    isActive?: boolean;
  }): InviteLink[] => {
    let result = [...inviteLinks];
    if (filters?.createdById)
      result = result.filter((l) => l.createdById === filters.createdById);
    if (filters?.type) result = result.filter((l) => l.type === filters.type);
    if (filters?.targetId)
      result = result.filter((l) => l.targetId === filters.targetId);
    if (filters?.isActive !== undefined)
      result = result.filter((l) => l.isActive === filters.isActive);
    return result;
  },

  findById: (id: string): InviteLink | undefined =>
    inviteLinks.find((l) => l.id === id),

  findByCode: (code: string): InviteLink | undefined =>
    inviteLinks.find((l) => l.code === code),

  create: (
    data: Omit<
      InviteLink,
      | "id"
      | "code"
      | "visitCount"
      | "conversionCount"
      | "createdAt"
      | "updatedAt"
    >
  ): InviteLink => {
    const link: InviteLink = {
      ...data,
      id: generateId(),
      code: `INV-${generateCode()}`,
      visitCount: 0,
      conversionCount: 0,
      createdAt: now(),
      updatedAt: now(),
    };
    inviteLinks.push(link);
    return link;
  },

  update: (id: string, data: Partial<InviteLink>): InviteLink | undefined => {
    const idx = inviteLinks.findIndex((l) => l.id === id);
    if (idx === -1) return undefined;
    inviteLinks[idx] = { ...inviteLinks[idx], ...data, updatedAt: now() };
    return inviteLinks[idx];
  },

  incrementVisit: (id: string): InviteLink | undefined => {
    const idx = inviteLinks.findIndex((l) => l.id === id);
    if (idx === -1) return undefined;
    inviteLinks[idx] = {
      ...inviteLinks[idx],
      visitCount: inviteLinks[idx].visitCount + 1,
      updatedAt: now(),
    };
    return inviteLinks[idx];
  },

  incrementConversion: (id: string): InviteLink | undefined => {
    const idx = inviteLinks.findIndex((l) => l.id === id);
    if (idx === -1) return undefined;
    inviteLinks[idx] = {
      ...inviteLinks[idx],
      conversionCount: inviteLinks[idx].conversionCount + 1,
      updatedAt: now(),
    };
    return inviteLinks[idx];
  },

  delete: (id: string): boolean => {
    const idx = inviteLinks.findIndex((l) => l.id === id);
    if (idx === -1) return false;
    inviteLinks.splice(idx, 1);
    return true;
  },

  count: (filters?: { createdById?: string }): number =>
    inviteLinkDb.findAll(filters).length,
};

// ============================================================================
// INVITE LINK VISIT OPERATIONS
// ============================================================================

export const inviteLinkVisitDb = {
  findAll: (filters?: {
    inviteLinkId?: string;
    converted?: boolean;
  }): InviteLinkVisit[] => {
    let result = [...inviteLinkVisits];
    if (filters?.inviteLinkId)
      result = result.filter((v) => v.inviteLinkId === filters.inviteLinkId);
    if (filters?.converted !== undefined)
      result = result.filter((v) => v.converted === filters.converted);
    return result;
  },

  create: (
    data: Omit<InviteLinkVisit, "id" | "createdAt">
  ): InviteLinkVisit => {
    const visit: InviteLinkVisit = {
      ...data,
      id: generateId(),
      createdAt: now(),
    };
    inviteLinkVisits.push(visit);
    return visit;
  },

  markConverted: (
    id: string,
    convertedUserId: string
  ): InviteLinkVisit | undefined => {
    const idx = inviteLinkVisits.findIndex((v) => v.id === id);
    if (idx === -1) return undefined;
    inviteLinkVisits[idx] = {
      ...inviteLinkVisits[idx],
      converted: true,
      convertedUserId,
    };
    return inviteLinkVisits[idx];
  },
};

// ============================================================================
// ANALYTICS HELPERS
// ============================================================================

export const analyticsDb = {
  /** Church-wide overview stats */
  getOverview: () => ({
    totalMembers: users.filter((u) => u.isActive).length,
    totalZones: zones.filter((z) => z.isActive).length,
    totalCampuses: campuses.filter((c) => c.isActive).length,
    totalDepartments: departments.filter((d) => d.isActive).length,
    totalGroups: groups.filter((g) => g.isActive).length,
    totalCells: cells.filter((c) => c.isActive).length,
    totalMeetings: meetings.length,
    totalInteractions: interactions.length,
    activeCampaigns: campaigns.filter(
      (c) => c.status === ("ACTIVE" as CampaignStatus)
    ).length,
    pendingRequests: membershipRequests.filter(
      (r) => r.status === ("PENDING" as MembershipRequestStatus)
    ).length,
  }),

  /** Stats scoped to a specific zone */
  getZoneStats: (zoneId: string) => {
    const zoneCampuses = campuses.filter((c) => c.parentId === zoneId);
    const campusIds = zoneCampuses.map((c) => c.id);
    const zoneMembers = users.filter((u) => u.zoneId === zoneId && u.isActive);
    const zoneMeetings = meetings.filter((m) => m.zoneId === zoneId);
    const zoneGroups = groups.filter((g) => g.zoneId === zoneId);
    const zoneCellsList = cells.filter((c) => c.zoneId === zoneId);
    return {
      totalCampuses: zoneCampuses.length,
      totalMembers: zoneMembers.length,
      totalGroups: zoneGroups.length,
      totalCells: zoneCellsList.length,
      totalMeetings: zoneMeetings.length,
      campusIds,
    };
  },

  /** Stats scoped to a specific campus */
  getCampusStats: (campusId: string) => {
    const campusDepts = departments.filter((d) => d.campusId === campusId);
    const campusGroups = groups.filter((g) => g.campusId === campusId);
    const campusCells = cells.filter((c) => c.campusId === campusId);
    const campusMembers = users.filter(
      (u) => u.campusId === campusId && u.isActive
    );
    const campusMeetings = meetings.filter((m) => m.campusId === campusId);
    return {
      totalDepartments: campusDepts.length,
      totalGroups: campusGroups.length,
      totalCells: campusCells.length,
      totalMembers: campusMembers.length,
      totalMeetings: campusMeetings.length,
    };
  },

  /** Stats for a group — attendance rate, meeting count, etc. */
  getGroupStats: (groupId: string) => {
    const groupMeetings = meetings.filter((m) => m.groupId === groupId);
    const groupMembers = users.filter((u) => u.groupId === groupId);
    const groupInteractions = interactions.filter((i) =>
      groupMembers.some((m) => m.id === i.memberId)
    );
    const totalAttendance = groupMeetings.reduce(
      (sum, m) => sum + (m.attendeeCount || 0),
      0
    );
    const avgAttendance =
      groupMeetings.length > 0
        ? Math.round(totalAttendance / groupMeetings.length)
        : 0;
    const attendanceRate =
      groupMembers.length > 0 && groupMeetings.length > 0
        ? Math.round(
          (totalAttendance / (groupMembers.length * groupMeetings.length)) *
          100
        )
        : 0;
    return {
      memberCount: groupMembers.length,
      meetingCount: groupMeetings.length,
      interactionCount: groupInteractions.length,
      avgAttendance,
      attendanceRate: Math.min(attendanceRate, 100),
    };
  },

  /** Campaign analytics for a given campaign */
  getCampaignStats: (campaignId: string) => {
    const campaign = campaigns.find((c) => c.id === campaignId);
    if (!campaign) return null;
    const ciList = campaignInteractions.filter(
      (ci) => ci.campaignId === campaignId
    );
    const views = ciList.filter(
      (ci) => ci.type === ("VIEW" as CampaignInteractionType)
    ).length;
    const clicks = ciList.filter(
      (ci) => ci.type === ("CLICK" as CampaignInteractionType)
    ).length;
    const shares = ciList.filter(
      (ci) => ci.type === ("SHARE" as CampaignInteractionType)
    ).length;
    return {
      campaignId,
      title: campaign.title,
      status: campaign.status,
      totalViews: campaign.viewCount + views,
      totalClicks: campaign.clickCount + clicks,
      totalShares: campaign.shareCount + shares,
      engagementRate:
        campaign.viewCount + views > 0
          ? Math.round(
            ((campaign.clickCount + clicks) / (campaign.viewCount + views)) *
            100
          )
          : 0,
    };
  },

  /** Referral / invite link performance */
  getReferralStats: (userId: string): ReferralStats => {
    const userLinks = inviteLinks.filter((l) => l.createdById === userId);
    const totalVisits = userLinks.reduce((s, l) => s + l.visitCount, 0);
    const totalConversions = userLinks.reduce(
      (s, l) => s + l.conversionCount,
      0
    );
    const invitees = users
      .filter((u) => u.invitedById === userId)
      .map((u) => ({
        userId: u.id,
        name: `${u.firstName} ${u.lastName}`,
        joinedAt: u.createdAt,
        via: "CAMPAIGN" as InviteLinkType,
      }));

    return {
      userId,
      totalInvitesSent: userLinks.length,
      totalVisits,
      totalConversions,
      conversionRate:
        totalVisits > 0
          ? Math.round((totalConversions / totalVisits) * 100)
          : 0,
      topPerformingLink:
        userLinks.length > 0
          ? userLinks.sort((a, b) => b.conversionCount - a.conversionCount)[0]
          : undefined,
      invitees,
    };
  },

  /** Member engagement score (simple heuristic) */
  getMemberEngagement: (memberId: string) => {
    const memberMeetings = meetings.filter((m) =>
      m.attendeeIds?.includes(memberId)
    );
    const memberInteractions = interactions.filter(
      (i) => i.memberId === memberId
    );
    const recentMeetings = memberMeetings.filter(
      (m) => new Date(m.date).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000
    );
    // Score: meetings attended * 10 + interactions * 5 + recent bonus
    const score =
      memberMeetings.length * 10 +
      memberInteractions.length * 5 +
      recentMeetings.length * 15;
    return {
      memberId,
      totalMeetingsAttended: memberMeetings.length,
      totalInteractions: memberInteractions.length,
      recentActivity: recentMeetings.length,
      engagementScore: Math.min(score, 100),
    };
  },
};

// ============================================================================
// REPORT TEMPLATE OPERATIONS
// ============================================================================

export const reportTemplateDb = {
  findAll: (filters?: {
    isActive?: boolean;
    search?: string;
  }): ReportTemplate[] => {
    let result = [...reportTemplates];
    if (filters?.isActive !== undefined)
      result = result.filter((t) => t.isActive === filters.isActive);
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q)
      );
    }
    return result;
  },

  findById: (id: string): ReportTemplate | undefined =>
    reportTemplates.find((t) => t.id === id),

  findDefault: (): ReportTemplate | undefined =>
    reportTemplates.find((t) => t.isDefault && t.isActive),

  create: (data: CreateReportTemplateInput, createdById: string): ReportTemplate => {
    const id = generateId();
    const sections: ReportTemplateSection[] = (data.sections || []).map(
      (sec, si) => {
        const sectionId = `tsec-${id}-${si}`;
        return {
          id: sectionId,
          templateId: id,
          name: sec.name,
          description: sec.description,
          order: sec.order,
          isRequired: sec.isRequired ?? true,
          subSections: (sec.subSections || []).map((ss, ssi) => ({
            id: `tssec-${id}-${si}-${ssi}`,
            sectionId,
            name: ss.name,
            order: ss.order,
            metrics: (ss.metrics || []).map((m, mi) => ({
              id: `tm-${id}-${si}-${ssi}-${mi}`,
              sectionId,
              name: m.name,
              fieldType: m.fieldType,
              isRequired: m.isRequired ?? true,
              order: m.order,
              capturesGoal: m.capturesGoal ?? true,
              capturesAchieved: m.capturesAchieved ?? true,
              capturesYoY: m.capturesYoY ?? true,
            })),
          })),
          metrics: (sec.metrics || []).map((m, mi) => ({
            id: `tm-${id}-${si}-${mi}`,
            sectionId,
            name: m.name,
            fieldType: m.fieldType,
            isRequired: m.isRequired ?? true,
            order: m.order,
            capturesGoal: m.capturesGoal ?? true,
            capturesAchieved: m.capturesAchieved ?? true,
            capturesYoY: m.capturesYoY ?? true,
          })),
        };
      }
    );

    const template: ReportTemplate = {
      id,
      name: data.name,
      description: data.description,
      version: 1,
      sections,
      isActive: true,
      isDefault: data.isDefault ?? false,
      createdById,
      createdAt: now(),
      updatedAt: now(),
    };

    // If this is set as default, unset other defaults
    if (template.isDefault) {
      reportTemplates.forEach((t, idx) => {
        if (t.id !== id && t.isDefault) {
          reportTemplates[idx] = { ...t, isDefault: false, updatedAt: now() };
        }
      });
    }

    reportTemplates.push(template);

    // Create initial version snapshot
    reportTemplateVersionDb.create(id, 1, template, createdById, "Initial creation");

    return template;
  },

  update: (
    id: string,
    data: UpdateReportTemplateInput,
    updatedById: string
  ): ReportTemplate | undefined => {
    const idx = reportTemplates.findIndex((t) => t.id === id);
    if (idx === -1) return undefined;

    const existing = reportTemplates[idx];
    const newVersion = existing.version + 1;

    // Rebuild sections if provided
    let sections = existing.sections;
    if (data.sections) {
      sections = data.sections.map((sec, si) => {
        const sectionId = `tsec-${id}-v${newVersion}-${si}`;
        return {
          id: sectionId,
          templateId: id,
          name: sec.name,
          description: sec.description,
          order: sec.order,
          isRequired: sec.isRequired ?? true,
          subSections: (sec.subSections || []).map((ss, ssi) => ({
            id: `tssec-${id}-v${newVersion}-${si}-${ssi}`,
            sectionId,
            name: ss.name,
            order: ss.order,
            metrics: (ss.metrics || []).map((m, mi) => ({
              id: `tm-${id}-v${newVersion}-${si}-${ssi}-${mi}`,
              sectionId,
              name: m.name,
              fieldType: m.fieldType,
              isRequired: m.isRequired ?? true,
              order: m.order,
              capturesGoal: m.capturesGoal ?? true,
              capturesAchieved: m.capturesAchieved ?? true,
              capturesYoY: m.capturesYoY ?? true,
            })),
          })),
          metrics: (sec.metrics || []).map((m, mi) => ({
            id: `tm-${id}-v${newVersion}-${si}-${mi}`,
            sectionId,
            name: m.name,
            fieldType: m.fieldType,
            isRequired: m.isRequired ?? true,
            order: m.order,
            capturesGoal: m.capturesGoal ?? true,
            capturesAchieved: m.capturesAchieved ?? true,
            capturesYoY: m.capturesYoY ?? true,
          })),
        };
      });
    }

    const updated: ReportTemplate = {
      ...existing,
      name: data.name ?? existing.name,
      description: data.description ?? existing.description,
      version: newVersion,
      sections,
      isDefault: data.isDefault ?? existing.isDefault,
      updatedAt: now(),
    };

    // Unset other defaults if newly set as default
    if (data.isDefault && !existing.isDefault) {
      reportTemplates.forEach((t, i) => {
        if (t.id !== id && t.isDefault) {
          reportTemplates[i] = { ...t, isDefault: false, updatedAt: now() };
        }
      });
    }

    reportTemplates[idx] = updated;

    // Snapshot the new version
    reportTemplateVersionDb.create(
      id,
      newVersion,
      updated,
      updatedById,
      data.changeNotes || `Updated to version ${newVersion}`
    );

    return updated;
  },

  deactivate: (id: string): ReportTemplate | undefined => {
    const idx = reportTemplates.findIndex((t) => t.id === id);
    if (idx === -1) return undefined;
    reportTemplates[idx] = {
      ...reportTemplates[idx],
      isActive: false,
      updatedAt: now(),
    };
    return reportTemplates[idx];
  },

  delete: (id: string): boolean => {
    const idx = reportTemplates.findIndex((t) => t.id === id);
    if (idx === -1) return false;
    reportTemplates.splice(idx, 1);
    return true;
  },

  count: (filters?: { isActive?: boolean }): number =>
    reportTemplateDb.findAll(filters).length,
};

// ============================================================================
// REPORT TEMPLATE VERSION OPERATIONS
// ============================================================================

export const reportTemplateVersionDb = {
  findByTemplateId: (templateId: string): ReportTemplateVersion[] =>
    reportTemplateVersions
      .filter((v) => v.templateId === templateId)
      .sort((a, b) => b.versionNumber - a.versionNumber),

  findById: (id: string): ReportTemplateVersion | undefined =>
    reportTemplateVersions.find((v) => v.id === id),

  findByVersion: (
    templateId: string,
    versionNumber: number
  ): ReportTemplateVersion | undefined =>
    reportTemplateVersions.find(
      (v) => v.templateId === templateId && v.versionNumber === versionNumber
    ),

  create: (
    templateId: string,
    versionNumber: number,
    snapshot: ReportTemplate,
    createdById: string,
    changeNotes?: string
  ): ReportTemplateVersion => {
    const version: ReportTemplateVersion = {
      id: generateId(),
      templateId,
      versionNumber,
      snapshot: cloneData(snapshot),
      createdAt: now(),
      createdById,
      changeNotes,
    };
    reportTemplateVersions.push(version);
    return version;
  },
};

// ============================================================================
// REPORT OPERATIONS (core report CRUD + workflow)
// ============================================================================

export const reportDb = {
  findAll: (filters?: ReportFilters): PeriodicReport[] => {
    let result = [...reports];

    if (filters?.campusId)
      result = result.filter((r) => r.campusId === filters.campusId);
    if (filters?.groupId)
      result = result.filter((r) => r.groupId === filters.groupId);
    if (filters?.status)
      result = result.filter((r) => r.status === filters.status);
    if (filters?.periodType)
      result = result.filter((r) => r.periodType === filters.periodType);
    if (filters?.periodYear)
      result = result.filter((r) => r.periodYear === filters.periodYear);
    if (filters?.periodMonth)
      result = result.filter((r) => r.periodMonth === filters.periodMonth);
    if (filters?.periodWeek)
      result = result.filter((r) => r.periodWeek === filters.periodWeek);
    if (filters?.submittedById)
      result = result.filter((r) => r.submittedById === filters.submittedById);
    if (filters?.templateId)
      result = result.filter((r) => r.templateId === filters.templateId);
    if (filters?.isDataEntry !== undefined)
      result = result.filter((r) => r.isDataEntry === filters.isDataEntry);
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter((r) => {
        // Search in notes and ID
        if (r.notes?.toLowerCase().includes(q)) return true;
        if (r.id.toLowerCase().includes(q)) return true;
        // Search in related template name
        const tpl = reportTemplates.find((t) => t.id === r.templateId);
        if (tpl?.name.toLowerCase().includes(q)) return true;
        // Search in related campus name
        const cmp = campuses.find((c) => c.id === r.campusId);
        if (cmp?.name.toLowerCase().includes(q)) return true;
        // Search in submitter name
        const usr = users.find((u) => u.id === r.submittedById);
        if (
          usr &&
          `${usr.firstName} ${usr.lastName}`.toLowerCase().includes(q)
        )
          return true;
        return false;
      });
    }
    if (filters?.dateFrom) {
      const from = new Date(filters.dateFrom).getTime();
      result = result.filter(
        (r) => new Date(r.createdAt).getTime() >= from
      );
    }
    if (filters?.dateTo) {
      const to = new Date(filters.dateTo).getTime();
      result = result.filter(
        (r) => new Date(r.createdAt).getTime() <= to
      );
    }

    // Most recent first
    result.sort(
      (a, b) =>
        new Date(b.updatedAt || b.createdAt).getTime() -
        new Date(a.updatedAt || a.createdAt).getTime()
    );
    return result;
  },

  findById: (id: string): PeriodicReport | undefined =>
    reports.find((r) => r.id === id),

  getWithDetails: (id: string): ReportWithDetails | undefined => {
    const report = reports.find((r) => r.id === id);
    if (!report) return undefined;

    const template = reportTemplates.find((t) => t.id === report.templateId);
    const campus = campuses.find((c) => c.id === report.campusId);
    const submittedBy = users.find((u) => u.id === report.submittedById);
    const approvedBy = report.approvedById
      ? users.find((u) => u.id === report.approvedById)
      : undefined;
    const reviewedBy = report.reviewedById
      ? users.find((u) => u.id === report.reviewedById)
      : undefined;
    const events = reportEvents
      .filter((e) => e.reportId === id)
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    const edits = reportEdits.filter((e) => e.reportId === id);
    const updateRequests = reportUpdateRequests.filter(
      (ur) => ur.reportId === id
    );

    return {
      ...report,
      template,
      campus,
      submittedBy: submittedBy ? toProfile(submittedBy) : undefined,
      approvedBy: approvedBy ? toProfile(approvedBy) : undefined,
      reviewedBy: reviewedBy ? toProfile(reviewedBy) : undefined,
      events,
      edits,
      updateRequests,
    };
  },

  create: (data: CreateReportInput): PeriodicReport => {
    const id = generateId();

    // Build report sections from input
    const sections: ReportSection[] = (data.sections || []).map((sec, si) => {
      const sectionId = `rs-${id}-${si}`;
      return {
        id: sectionId,
        reportId: id,
        templateSectionId: sec.templateSectionId,
        sectionName: sec.sectionName,
        order: sec.order,
        metrics: (sec.metrics || []).map((m, mi) => ({
          id: `rm-${id}-${si}-${mi}`,
          reportSectionId: sectionId,
          templateMetricId: m.templateMetricId,
          metricName: m.metricName,
          fieldType: m.fieldType,
          monthlyGoal: m.monthlyGoal,
          monthlyAchieved: m.monthlyAchieved,
          yoyGoal: m.yoyGoal,
          computedPercentage:
            m.monthlyGoal && m.monthlyAchieved
              ? Math.round((m.monthlyAchieved / m.monthlyGoal) * 100)
              : undefined,
          isLocked: false,
          order: m.order,
        })),
      };
    });

    const report: PeriodicReport = {
      id,
      templateId: data.templateId,
      templateVersionId: data.templateVersionId,
      campusId: data.campusId,
      periodType: data.periodType,
      periodYear: data.periodYear,
      periodMonth: data.periodMonth,
      periodWeek: data.periodWeek,
      status: ReportStatus.DRAFT,
      submittedById: data.submittedById,
      deadline: data.deadline,
      isDataEntry: data.isDataEntry || false,
      dataEntryById: data.dataEntryById,
      dataEntryDate: data.dataEntryDate,
      notes: data.notes,
      sections,
      createdAt: now(),
      updatedAt: now(),
    };

    reports.push(report);
    emitDbChange("reports", "create", id);

    // Create audit event
    reportEventDb.create({
      reportId: id,
      eventType: data.isDataEntry
        ? ReportEventType.DATA_ENTRY_CREATED
        : ReportEventType.CREATED,
      actorId: data.submittedById,
      newStatus: ReportStatus.DRAFT,
      details: data.isDataEntry
        ? { dataEntryDate: data.dataEntryDate }
        : undefined,
    });

    return report;
  },

  update: (id: string, data: UpdateReportInput): PeriodicReport | undefined => {
    const idx = reports.findIndex((r) => r.id === id);
    if (idx === -1) return undefined;

    const existing = reports[idx];

    // Rebuild sections if provided
    let sections = existing.sections;
    if (data.sections) {
      sections = data.sections.map((sec, si) => {
        const sectionId = `rs-${id}-upd-${si}`;
        return {
          id: sectionId,
          reportId: id,
          templateSectionId: sec.templateSectionId,
          sectionName: sec.sectionName,
          order: sec.order,
          metrics: (sec.metrics || []).map((m, mi) => ({
            id: `rm-${id}-upd-${si}-${mi}`,
            reportSectionId: sectionId,
            templateMetricId: m.templateMetricId,
            metricName: m.metricName,
            fieldType: m.fieldType,
            monthlyGoal: m.monthlyGoal,
            monthlyAchieved: m.monthlyAchieved,
            yoyGoal: m.yoyGoal,
            computedPercentage:
              m.monthlyGoal && m.monthlyAchieved
                ? Math.round((m.monthlyAchieved / m.monthlyGoal) * 100)
                : undefined,
            isLocked: false,
            order: m.order,
          })),
        };
      });
    }

    reports[idx] = {
      ...existing,
      notes: data.notes ?? existing.notes,
      sections,
      updatedAt: now(),
    };

    emitDbChange("reports", "update", id);
    return reports[idx];
  },

  /** Submit a draft report for review */
  submit: (id: string, actorId: string): PeriodicReport | undefined => {
    const idx = reports.findIndex((r) => r.id === id);
    if (idx === -1) return undefined;
    if (reports[idx].status !== ReportStatus.DRAFT && reports[idx].status !== ReportStatus.REQUIRES_EDITS)
      return undefined;

    const previousStatus = reports[idx].status;
    reports[idx] = {
      ...reports[idx],
      status: ReportStatus.SUBMITTED,
      updatedAt: now(),
    };

    reportEventDb.create({
      reportId: id,
      eventType: ReportEventType.SUBMITTED,
      actorId,
      previousStatus,
      newStatus: ReportStatus.SUBMITTED,
    });

    // Create version snapshot
    reportVersionDb.create(id, reports[idx], actorId, "Submitted for review");

    emitDbChange("reports", "update", id);
    return reports[idx];
  },

  /** Approve a submitted report */
  approve: (id: string, actorId: string): PeriodicReport | undefined => {
    const idx = reports.findIndex((r) => r.id === id);
    if (idx === -1) return undefined;
    if (reports[idx].status !== ReportStatus.SUBMITTED) return undefined;

    reports[idx] = {
      ...reports[idx],
      status: ReportStatus.APPROVED,
      approvedById: actorId,
      updatedAt: now(),
    };

    reportEventDb.create({
      reportId: id,
      eventType: ReportEventType.APPROVED,
      actorId,
      previousStatus: ReportStatus.SUBMITTED,
      newStatus: ReportStatus.APPROVED,
    });

    emitDbChange("reports", "update", id);
    return reports[idx];
  },

  /** Request edits on a submitted report */
  requestEdits: (
    id: string,
    actorId: string,
    reason: string
  ): PeriodicReport | undefined => {
    const idx = reports.findIndex((r) => r.id === id);
    if (idx === -1) return undefined;
    if (reports[idx].status !== ReportStatus.SUBMITTED) return undefined;

    reports[idx] = {
      ...reports[idx],
      status: ReportStatus.REQUIRES_EDITS,
      reviewedById: actorId,
      updatedAt: now(),
    };

    reportEventDb.create({
      reportId: id,
      eventType: ReportEventType.EDIT_REQUESTED,
      actorId,
      previousStatus: ReportStatus.SUBMITTED,
      newStatus: ReportStatus.REQUIRES_EDITS,
      details: { reason },
    });

    return reports[idx];
  },

  /** Mark an approved report as reviewed */
  review: (id: string, actorId: string): PeriodicReport | undefined => {
    const idx = reports.findIndex((r) => r.id === id);
    if (idx === -1) return undefined;
    if (reports[idx].status !== ReportStatus.APPROVED) return undefined;

    reports[idx] = {
      ...reports[idx],
      status: ReportStatus.REVIEWED,
      reviewedById: actorId,
      updatedAt: now(),
    };

    reportEventDb.create({
      reportId: id,
      eventType: ReportEventType.REVIEWED,
      actorId,
      previousStatus: ReportStatus.APPROVED,
      newStatus: ReportStatus.REVIEWED,
    });

    return reports[idx];
  },

  /** Lock a reviewed report (final state) */
  lock: (id: string, actorId: string): PeriodicReport | undefined => {
    const idx = reports.findIndex((r) => r.id === id);
    if (idx === -1) return undefined;
    if (reports[idx].status !== ReportStatus.REVIEWED) return undefined;

    reports[idx] = {
      ...reports[idx],
      status: ReportStatus.LOCKED,
      lockedAt: now(),
      updatedAt: now(),
    };

    reportEventDb.create({
      reportId: id,
      eventType: ReportEventType.LOCKED,
      actorId,
      previousStatus: ReportStatus.REVIEWED,
      newStatus: ReportStatus.LOCKED,
    });

    return reports[idx];
  },

  /** Apply approved edit changes to the report */
  applyEdit: (reportId: string, editId: string): PeriodicReport | undefined => {
    const rIdx = reports.findIndex((r) => r.id === reportId);
    if (rIdx === -1) return undefined;

    const edit = reportEdits.find((e) => e.id === editId);
    if (!edit || edit.status !== ReportEditStatus.APPROVED) return undefined;

    // Snapshot before applying
    reportVersionDb.create(
      reportId,
      reports[rIdx],
      edit.submittedById,
      `Pre-edit snapshot before edit ${editId}`
    );

    // Merge edit sections into report
    for (const editSection of edit.sections) {
      const existingSectionIdx = reports[rIdx].sections.findIndex(
        (s) => s.templateSectionId === editSection.templateSectionId
      );
      if (existingSectionIdx !== -1) {
        // Update existing section metrics
        for (const editMetric of editSection.metrics) {
          const existingMetricIdx = reports[rIdx].sections[
            existingSectionIdx
          ].metrics.findIndex(
            (m) => m.templateMetricId === editMetric.templateMetricId
          );
          if (existingMetricIdx !== -1) {
            reports[rIdx].sections[existingSectionIdx].metrics[
              existingMetricIdx
            ] = {
              ...reports[rIdx].sections[existingSectionIdx].metrics[
              existingMetricIdx
              ],
              monthlyGoal: editMetric.monthlyGoal,
              monthlyAchieved: editMetric.monthlyAchieved,
              yoyGoal: editMetric.yoyGoal,
              computedPercentage:
                editMetric.monthlyGoal && editMetric.monthlyAchieved
                  ? Math.round(
                    (editMetric.monthlyAchieved / editMetric.monthlyGoal) *
                    100
                  )
                  : undefined,
            };
          }
        }
      }
    }

    reports[rIdx] = { ...reports[rIdx], updatedAt: now() };

    reportEventDb.create({
      reportId,
      eventType: ReportEventType.EDIT_APPLIED,
      actorId: edit.submittedById,
      details: { editId },
    });

    return reports[rIdx];
  },

  delete: (id: string): boolean => {
    const idx = reports.findIndex((r) => r.id === id);
    if (idx === -1) return false;
    reports.splice(idx, 1);
    return true;
  },

  /** Superadmin unlock specific metric fields on a report */
  unlockFields: (
    reportId: string,
    metricIds: string[],
    actorId: string,
    reason?: string
  ): PeriodicReport | undefined => {
    const idx = reports.findIndex((r) => r.id === reportId);
    if (idx === -1) return undefined;

    const report = reports[idx];

    // Unlock specified metrics
    for (const section of report.sections) {
      for (const metric of section.metrics) {
        if (metricIds.includes(metric.templateMetricId)) {
          metric.isLocked = false;
        }
      }
    }

    reports[idx] = { ...report, updatedAt: now() };

    reportEventDb.create({
      reportId,
      eventType: ReportEventType.FIELD_UNLOCKED,
      actorId,
      details: { metricIds, reason: reason || "Superadmin override" },
    });

    return reports[idx];
  },

  /** Auto-approve a report when deadline passes with no reviewer action */
  autoApprove: (reportId: string): PeriodicReport | undefined => {
    const idx = reports.findIndex((r) => r.id === reportId);
    if (idx === -1) return undefined;
    if (reports[idx].status !== ReportStatus.SUBMITTED) return undefined;

    reports[idx] = {
      ...reports[idx],
      status: ReportStatus.APPROVED,
      updatedAt: now(),
    };

    reportEventDb.create({
      reportId,
      eventType: ReportEventType.AUTO_APPROVED,
      actorId: "system",
      previousStatus: ReportStatus.SUBMITTED,
      newStatus: ReportStatus.APPROVED,
      details: { reason: "Auto-approved: reviewer deadline expired" },
    });

    return reports[idx];
  },

  count: (filters?: ReportFilters): number =>
    reportDb.findAll(filters).length,
};

// ============================================================================
// REPORT EVENT OPERATIONS (Audit Trail)
// ============================================================================

export const reportEventDb = {
  findByReportId: (reportId: string): ReportEvent[] =>
    reportEvents
      .filter((e) => e.reportId === reportId)
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ),

  findById: (id: string): ReportEvent | undefined =>
    reportEvents.find((e) => e.id === id),

  create: (
    data: Omit<ReportEvent, "id" | "timestamp">
  ): ReportEvent => {
    const event: ReportEvent = {
      ...data,
      id: generateId(),
      timestamp: now(),
    };
    reportEvents.push(event);
    return event;
  },

  getWithDetails: (reportId: string): ReportEventWithDetails[] => {
    const events = reportEventDb.findByReportId(reportId);
    return events.map((e) => {
      const actor = users.find((u) => u.id === e.actorId);
      return {
        ...e,
        actorName: actor
          ? `${actor.firstName} ${actor.lastName}`
          : "Unknown User",
        actorRole: actor?.role,
      };
    });
  },
};

// ============================================================================
// REPORT VERSION OPERATIONS (Snapshots)
// ============================================================================

export const reportVersionDb = {
  findByReportId: (reportId: string): ReportVersion[] =>
    reportVersions
      .filter((v) => v.reportId === reportId)
      .sort((a, b) => b.versionNumber - a.versionNumber),

  findById: (id: string): ReportVersion | undefined =>
    reportVersions.find((v) => v.id === id),

  create: (
    reportId: string,
    snapshot: PeriodicReport,
    createdById: string,
    reason?: string
  ): ReportVersion => {
    const existing = reportVersionDb.findByReportId(reportId);
    const nextVersion =
      existing.length > 0
        ? Math.max(...existing.map((v) => v.versionNumber)) + 1
        : 1;

    const version: ReportVersion = {
      id: generateId(),
      reportId,
      versionNumber: nextVersion,
      snapshot: cloneData(snapshot),
      createdAt: now(),
      createdById,
      reason,
    };
    reportVersions.push(version);
    return version;
  },
};

// ============================================================================
// REPORT EDIT OPERATIONS
// ============================================================================

export const reportEditDb = {
  findAll: (filters?: {
    reportId?: string;
    submittedById?: string;
    status?: ReportEditStatus;
  }): ReportEdit[] => {
    let result = [...reportEdits];
    if (filters?.reportId)
      result = result.filter((e) => e.reportId === filters.reportId);
    if (filters?.submittedById)
      result = result.filter((e) => e.submittedById === filters.submittedById);
    if (filters?.status)
      result = result.filter((e) => e.status === filters.status);
    result.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return result;
  },

  findById: (id: string): ReportEdit | undefined =>
    reportEdits.find((e) => e.id === id),

  findByReportId: (reportId: string): ReportEdit[] =>
    reportEdits.filter((e) => e.reportId === reportId),

  getWithDetails: (id: string): ReportEditWithDetails | undefined => {
    const edit = reportEdits.find((e) => e.id === id);
    if (!edit) return undefined;

    const report = reports.find((r) => r.id === edit.reportId);
    const submittedBy = users.find((u) => u.id === edit.submittedById);
    const reviewedBy = edit.reviewedById
      ? users.find((u) => u.id === edit.reviewedById)
      : undefined;

    return {
      ...edit,
      report,
      submittedBy: submittedBy ? toProfile(submittedBy) : undefined,
      reviewedBy: reviewedBy ? toProfile(reviewedBy) : undefined,
    };
  },

  create: (data: CreateReportEditInput): ReportEdit => {
    const id = generateId();

    const sections: ReportEditSection[] = (data.sections || []).map(
      (sec, si) => {
        const sectionId = `res-${id}-${si}`;
        return {
          id: sectionId,
          reportEditId: id,
          templateSectionId: sec.templateSectionId,
          sectionName: sec.sectionName,
          order: sec.order,
          metrics: (sec.metrics || []).map((m, mi) => ({
            id: `rem-${id}-${si}-${mi}`,
            reportEditSectionId: sectionId,
            templateMetricId: m.templateMetricId,
            metricName: m.metricName,
            fieldType: m.fieldType,
            monthlyGoal: m.monthlyGoal,
            monthlyAchieved: m.monthlyAchieved,
            yoyGoal: m.yoyGoal,
            originalMonthlyGoal: m.originalMonthlyGoal,
            originalMonthlyAchieved: m.originalMonthlyAchieved,
            originalYoyGoal: m.originalYoyGoal,
            order: m.order,
          })),
        };
      }
    );

    const edit: ReportEdit = {
      id,
      reportId: data.reportId,
      submittedById: data.submittedById,
      status: ReportEditStatus.DRAFT,
      reason: data.reason,
      sections,
      createdAt: now(),
      updatedAt: now(),
    };

    reportEdits.push(edit);

    reportEventDb.create({
      reportId: data.reportId,
      eventType: ReportEventType.EDIT_SUBMITTED,
      actorId: data.submittedById,
      details: { editId: id, reason: data.reason },
    });

    return edit;
  },

  submit: (id: string): ReportEdit | undefined => {
    const idx = reportEdits.findIndex((e) => e.id === id);
    if (idx === -1) return undefined;
    if (reportEdits[idx].status !== ReportEditStatus.DRAFT) return undefined;

    reportEdits[idx] = {
      ...reportEdits[idx],
      status: ReportEditStatus.SUBMITTED,
      updatedAt: now(),
    };
    return reportEdits[idx];
  },

  approve: (id: string, reviewerId: string): ReportEdit | undefined => {
    const idx = reportEdits.findIndex((e) => e.id === id);
    if (idx === -1) return undefined;
    if (reportEdits[idx].status !== ReportEditStatus.SUBMITTED) return undefined;

    reportEdits[idx] = {
      ...reportEdits[idx],
      status: ReportEditStatus.APPROVED,
      reviewedById: reviewerId,
      updatedAt: now(),
    };

    reportEventDb.create({
      reportId: reportEdits[idx].reportId,
      eventType: ReportEventType.EDIT_APPROVED,
      actorId: reviewerId,
      details: { editId: id },
    });

    // Auto-apply the edit to the report
    reportDb.applyEdit(reportEdits[idx].reportId, id);

    return reportEdits[idx];
  },

  reject: (
    id: string,
    reviewerId: string,
    reason?: string
  ): ReportEdit | undefined => {
    const idx = reportEdits.findIndex((e) => e.id === id);
    if (idx === -1) return undefined;
    if (reportEdits[idx].status !== ReportEditStatus.SUBMITTED) return undefined;

    reportEdits[idx] = {
      ...reportEdits[idx],
      status: ReportEditStatus.REJECTED,
      reviewedById: reviewerId,
      rejectionReason: reason,
      updatedAt: now(),
    };

    reportEventDb.create({
      reportId: reportEdits[idx].reportId,
      eventType: ReportEventType.EDIT_REJECTED,
      actorId: reviewerId,
      details: { editId: id, reason },
    });

    return reportEdits[idx];
  },

  count: (filters?: { reportId?: string; status?: ReportEditStatus }): number =>
    reportEditDb.findAll(filters).length,
};

// ============================================================================
// REPORT UPDATE REQUEST OPERATIONS (Post-deadline changes)
// ============================================================================

export const reportUpdateRequestDb = {
  findAll: (filters?: {
    reportId?: string;
    requestedById?: string;
    status?: ReportUpdateRequestStatus;
  }): ReportUpdateRequest[] => {
    let result = [...reportUpdateRequests];
    if (filters?.reportId)
      result = result.filter((r) => r.reportId === filters.reportId);
    if (filters?.requestedById)
      result = result.filter((r) => r.requestedById === filters.requestedById);
    if (filters?.status)
      result = result.filter((r) => r.status === filters.status);
    result.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return result;
  },

  findById: (id: string): ReportUpdateRequest | undefined =>
    reportUpdateRequests.find((r) => r.id === id),

  findByReportId: (reportId: string): ReportUpdateRequest[] =>
    reportUpdateRequests.filter((r) => r.reportId === reportId),

  getWithDetails: (id: string): ReportUpdateRequestWithDetails | undefined => {
    const request = reportUpdateRequests.find((r) => r.id === id);
    if (!request) return undefined;

    const report = reports.find((r) => r.id === request.reportId);
    const requestedBy = users.find((u) => u.id === request.requestedById);
    const reviewedBy = request.reviewedById
      ? users.find((u) => u.id === request.reviewedById)
      : undefined;

    return {
      ...request,
      report,
      requestedBy: requestedBy ? toProfile(requestedBy) : undefined,
      reviewedBy: reviewedBy ? toProfile(reviewedBy) : undefined,
    };
  },

  create: (data: CreateReportUpdateRequestInput): ReportUpdateRequest => {
    const id = generateId();

    const sections: ReportEditSection[] = (data.sections || []).map(
      (sec, si) => {
        const sectionId = `rus-${id}-${si}`;
        return {
          id: sectionId,
          reportEditId: id,
          templateSectionId: sec.templateSectionId,
          sectionName: sec.sectionName,
          order: sec.order,
          metrics: (sec.metrics || []).map((m, mi) => ({
            id: `rum-${id}-${si}-${mi}`,
            reportEditSectionId: sectionId,
            templateMetricId: m.templateMetricId,
            metricName: m.metricName,
            fieldType: m.fieldType,
            monthlyGoal: m.monthlyGoal,
            monthlyAchieved: m.monthlyAchieved,
            yoyGoal: m.yoyGoal,
            originalMonthlyGoal: m.originalMonthlyGoal,
            originalMonthlyAchieved: m.originalMonthlyAchieved,
            originalYoyGoal: m.originalYoyGoal,
            order: m.order,
          })),
        };
      }
    );

    const request: ReportUpdateRequest = {
      id,
      reportId: data.reportId,
      requestedById: data.requestedById,
      reason: data.reason,
      sections,
      status: ReportUpdateRequestStatus.PENDING,
      createdAt: now(),
      updatedAt: now(),
    };

    reportUpdateRequests.push(request);

    reportEventDb.create({
      reportId: data.reportId,
      eventType: ReportEventType.UPDATE_REQUESTED,
      actorId: data.requestedById,
      details: { updateRequestId: id, reason: data.reason },
    });

    return request;
  },

  approve: (
    id: string,
    reviewerId: string
  ): ReportUpdateRequest | undefined => {
    const idx = reportUpdateRequests.findIndex((r) => r.id === id);
    if (idx === -1) return undefined;
    if (reportUpdateRequests[idx].status !== ReportUpdateRequestStatus.PENDING)
      return undefined;

    reportUpdateRequests[idx] = {
      ...reportUpdateRequests[idx],
      status: ReportUpdateRequestStatus.APPROVED,
      reviewedById: reviewerId,
      updatedAt: now(),
    };

    const req = reportUpdateRequests[idx];

    // Apply the update request changes to the report
    const rIdx = reports.findIndex((r) => r.id === req.reportId);
    if (rIdx !== -1) {
      // Snapshot before applying
      reportVersionDb.create(
        req.reportId,
        reports[rIdx],
        reviewerId,
        `Pre-update-request snapshot before request ${id}`
      );

      // Merge changes
      for (const urSection of req.sections) {
        const existingSectionIdx = reports[rIdx].sections.findIndex(
          (s) => s.templateSectionId === urSection.templateSectionId
        );
        if (existingSectionIdx !== -1) {
          for (const urMetric of urSection.metrics) {
            const existingMetricIdx = reports[rIdx].sections[
              existingSectionIdx
            ].metrics.findIndex(
              (m) => m.templateMetricId === urMetric.templateMetricId
            );
            if (existingMetricIdx !== -1) {
              reports[rIdx].sections[existingSectionIdx].metrics[
                existingMetricIdx
              ] = {
                ...reports[rIdx].sections[existingSectionIdx].metrics[
                existingMetricIdx
                ],
                monthlyGoal: urMetric.monthlyGoal,
                monthlyAchieved: urMetric.monthlyAchieved,
                yoyGoal: urMetric.yoyGoal,
                computedPercentage:
                  urMetric.monthlyGoal && urMetric.monthlyAchieved
                    ? Math.round(
                      (urMetric.monthlyAchieved / urMetric.monthlyGoal) * 100
                    )
                    : undefined,
              };
            }
          }
        }
      }

      reports[rIdx] = { ...reports[rIdx], updatedAt: now() };
    }

    reportEventDb.create({
      reportId: req.reportId,
      eventType: ReportEventType.UPDATE_APPROVED,
      actorId: reviewerId,
      details: { updateRequestId: id },
    });

    return reportUpdateRequests[idx];
  },

  reject: (
    id: string,
    reviewerId: string,
    reason?: string
  ): ReportUpdateRequest | undefined => {
    const idx = reportUpdateRequests.findIndex((r) => r.id === id);
    if (idx === -1) return undefined;
    if (reportUpdateRequests[idx].status !== ReportUpdateRequestStatus.PENDING)
      return undefined;

    reportUpdateRequests[idx] = {
      ...reportUpdateRequests[idx],
      status: ReportUpdateRequestStatus.REJECTED,
      reviewedById: reviewerId,
      rejectionReason: reason,
      updatedAt: now(),
    };

    reportEventDb.create({
      reportId: reportUpdateRequests[idx].reportId,
      eventType: ReportEventType.UPDATE_REJECTED,
      actorId: reviewerId,
      details: { updateRequestId: id, reason },
    });

    return reportUpdateRequests[idx];
  },

  count: (filters?: {
    reportId?: string;
    status?: ReportUpdateRequestStatus;
  }): number => reportUpdateRequestDb.findAll(filters).length,
};

// ============================================================================
// REPORT ANALYTICS HELPERS
// ============================================================================

export const reportAnalyticsDb = {
  /** Get dashboard stats for reports, scoped by campus or church-wide */
  getDashboardStats: (campusId?: string): ReportDashboardStats => {
    let scoped = [...reports];
    if (campusId) scoped = scoped.filter((r) => r.campusId === campusId);

    const total = scoped.length;
    const submitted = scoped.filter(
      (r) => r.status === ReportStatus.SUBMITTED
    ).length;
    const approved = scoped.filter(
      (r) => r.status === ReportStatus.APPROVED
    ).length;
    const draft = scoped.filter(
      (r) => r.status === ReportStatus.DRAFT
    ).length;
    const requiresEdits = scoped.filter(
      (r) => r.status === ReportStatus.REQUIRES_EDITS
    ).length;
    const locked = scoped.filter(
      (r) => r.status === ReportStatus.LOCKED
    ).length;
    const overdue = scoped.filter(
      (r) =>
        r.status === ReportStatus.DRAFT &&
        r.deadline &&
        new Date(r.deadline).getTime() < Date.now()
    ).length;

    return {
      totalReports: total,
      submittedReports: submitted,
      approvedReports: approved,
      draftReports: draft,
      requiresEditsReports: requiresEdits,
      lockedReports: locked,
      overdueReports: overdue,
      complianceRate:
        total > 0
          ? Math.round(
            ((approved + locked + submitted) / total) * 100
          )
          : 0,
    };
  },

  /** Compliance summary across all campuses */
  getComplianceSummary: (): ReportComplianceSummary[] => {
    const campusList = [...campuses];
    return campusList.map((campus) => {
      const campusReports = reports.filter(
        (r) => r.campusId === campus.id
      );
      const total = campusReports.length;
      const onTime = campusReports.filter(
        (r) =>
          r.deadline &&
          r.status !== ReportStatus.DRAFT &&
          new Date(r.updatedAt || r.createdAt).getTime() <=
          new Date(r.deadline).getTime()
      ).length;
      const late = campusReports.filter(
        (r) =>
          r.deadline &&
          r.status !== ReportStatus.DRAFT &&
          new Date(r.updatedAt || r.createdAt).getTime() >
          new Date(r.deadline).getTime()
      ).length;
      const missing = campusReports.filter(
        (r) =>
          r.status === ReportStatus.DRAFT &&
          r.deadline &&
          new Date(r.deadline).getTime() < Date.now()
      ).length;

      return {
        campusId: campus.id,
        campusName: campus.name,
        totalExpected: total || 1,
        submitted: onTime + late,
        onTime,
        late,
        missing,
        compliancePercentage:
          total > 0 ? Math.round(((onTime + late) / total) * 100) : 0,
      };
    });
  },

  /** Metric aggregates for analytics dashboards */
  getMetricAggregates: (filters?: {
    campusId?: string;
    periodYear?: number;
    periodMonth?: number;
    metricName?: string;
  }): ReportAnalytics[] => {
    let scoped = reports.filter(
      (r) =>
        r.status === ReportStatus.APPROVED ||
        r.status === ReportStatus.REVIEWED ||
        r.status === ReportStatus.LOCKED
    );
    if (filters?.campusId)
      scoped = scoped.filter((r) => r.campusId === filters.campusId);
    if (filters?.periodYear)
      scoped = scoped.filter((r) => r.periodYear === filters.periodYear);
    if (filters?.periodMonth)
      scoped = scoped.filter((r) => r.periodMonth === filters.periodMonth);

    // Aggregate metrics across all matching reports
    const metricMap = new Map<
      string,
      { totalGoal: number; totalAchieved: number; totalYoY: number; count: number }
    >();

    for (const report of scoped) {
      for (const section of report.sections) {
        for (const metric of section.metrics) {
          if (filters?.metricName && metric.metricName !== filters.metricName)
            continue;
          const key = metric.metricName;
          const existing = metricMap.get(key) || {
            totalGoal: 0,
            totalAchieved: 0,
            totalYoY: 0,
            count: 0,
          };
          metricMap.set(key, {
            totalGoal: existing.totalGoal + (metric.monthlyGoal || 0),
            totalAchieved:
              existing.totalAchieved + (metric.monthlyAchieved || 0),
            totalYoY: existing.totalYoY + (metric.yoyGoal || 0),
            count: existing.count + 1,
          });
        }
      }
    }

    const results: ReportAnalytics[] = [];
    metricMap.forEach((agg, metricName) => {
      results.push({
        metricName,
        totalGoal: agg.totalGoal,
        totalAchieved: agg.totalAchieved,
        achievementRate:
          agg.totalGoal > 0
            ? Math.round((agg.totalAchieved / agg.totalGoal) * 100)
            : 0,
        yoyGrowth:
          agg.totalYoY > 0
            ? Math.round(
              ((agg.totalAchieved - agg.totalYoY) / agg.totalYoY) * 100
            )
            : 0,
        reportCount: agg.count,
      });
    });

    return results.sort((a, b) => b.reportCount - a.reportCount);
  },
};

// ============================================================================
// Combined Database Export (for backward compatibility)
// ============================================================================
export const db = {
  users: userDb,
  zones: zoneDb,
  orgGroups: orgGroupDb,
  campuses: campusDb,
  departments: departmentDb,
  groups: groupDb,
  cells: cellDb,
  meetings: meetingDb,
  interactions: interactionDb,
  membershipRequests: membershipRequestDb,
  notifications: notificationDb,
  campaigns: campaignDb,
  campaignInteractions: campaignInteractionDb,
  inviteLinks: inviteLinkDb,
  inviteLinkVisits: inviteLinkVisitDb,
  analytics: analyticsDb,
  reportTemplates: reportTemplateDb,
  reportTemplateVersions: reportTemplateVersionDb,
  reports: reportDb,
  reportEvents: reportEventDb,
  reportVersions: reportVersionDb,
  reportEdits: reportEditDb,
  reportUpdateRequests: reportUpdateRequestDb,
  reportAnalytics: reportAnalyticsDb,
};
