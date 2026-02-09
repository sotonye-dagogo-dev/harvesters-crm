import bcrypt from "bcryptjs";
import {
  MembershipRequestStatus,
  CampaignStatus,
  MeetingLevel,
  CampaignInteractionType,
  InviteLinkType,
} from "@/lib/types";
import {
  mockUsers,
  mockGroups,
  mockMeetings,
  mockInteractions,
  mockMembershipRequests,
  mockNotifications,
  mockCampuses,
  mockZones,
  mockDepartments,
  mockCells,
  mockCampaigns,
  mockCampaignInteractions,
  mockInviteLinks,
  mockInviteLinkVisits,
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
    departments: Department[];
    cells: Cell[];
    campaigns: Campaign[];
    campaignInteractions: CampaignInteraction[];
    inviteLinks: InviteLink[];
    inviteLinkVisits: InviteLinkVisit[];
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
    zones: cloneData(mockZones),
    departments: cloneData(mockDepartments),
    cells: cloneData(mockCells),
    campaigns: cloneData(mockCampaigns),
    campaignInteractions: cloneData(mockCampaignInteractions),
    inviteLinks: cloneData(mockInviteLinks),
    inviteLinkVisits: cloneData(mockInviteLinkVisits),
  };
}

const users = globalForDb.dbStore.users;
const groups = globalForDb.dbStore.groups;
const meetings = globalForDb.dbStore.meetings;
const interactions = globalForDb.dbStore.interactions;
const membershipRequests = globalForDb.dbStore.membershipRequests;
let notifications = globalForDb.dbStore.notifications;
const campuses = globalForDb.dbStore.campuses;
const zones = globalForDb.dbStore.zones;
const departments = globalForDb.dbStore.departments;
const cells = globalForDb.dbStore.cells;
const campaigns = globalForDb.dbStore.campaigns;
const campaignInteractions = globalForDb.dbStore.campaignInteractions;
const inviteLinks = globalForDb.dbStore.inviteLinks;
const inviteLinkVisits = globalForDb.dbStore.inviteLinkVisits;

// ── Helpers ──────────────────────────────────────────────────────────────────
const generateId = () =>
  `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
const now = () => new Date().toISOString();
const generateCode = () =>
  Math.random().toString(36).substring(2, 10).toUpperCase();

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
    return user;
  },

  update: (id: string, data: Partial<User>): User | undefined => {
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) return undefined;
    users[idx] = { ...users[idx], ...data, updatedAt: now() };
    return users[idx];
  },

  delete: (id: string): boolean => {
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) return false;
    users.splice(idx, 1);
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
    const zoneCampuses = campuses.filter((c) => c.zoneId === zone.id);
    const zoneDepts = departments.filter((d) => d.zoneId === zone.id);
    const zoneMembers = users.filter((u) => u.zoneId === zone.id);
    const zoneGroups = groups.filter((g) => g.zoneId === zone.id);

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
// CAMPUS OPERATIONS (belong to zones)
// ============================================================================

export const campusDb = {
  findAll: (filters?: {
    zoneId?: string;
    isActive?: boolean;
    search?: string;
  }): Campus[] => {
    let result = [...campuses];
    if (filters?.zoneId)
      result = result.filter((c) => c.zoneId === filters.zoneId);
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

    const zone = zones.find((z) => z.id === campus.zoneId);
    const admin = users.find((u) => u.id === campus.adminId);
    const campusDepts = departments.filter((d) => d.campusId === campus.id);
    const campusGroups = groups.filter((g) => g.campusId === campus.id);
    const campusCells = cells.filter((c) => c.campusId === campus.id);
    const campusMembers = users.filter((u) => u.campusId === campus.id);

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

    return {
      ...campus,
      zone: zone as Zone,
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

  count: (filters?: { zoneId?: string }): number =>
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
    return group;
  },

  update: (id: string, data: Partial<Group>): Group | undefined => {
    const idx = groups.findIndex((g) => g.id === id);
    if (idx === -1) return undefined;
    groups[idx] = { ...groups[idx], ...data, updatedAt: now() };
    return groups[idx];
  },

  delete: (id: string): boolean => {
    const idx = groups.findIndex((g) => g.id === id);
    if (idx === -1) return false;
    groups.splice(idx, 1);
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
    return meeting;
  },

  update: (id: string, data: Partial<Meeting>): Meeting | undefined => {
    const idx = meetings.findIndex((m) => m.id === id);
    if (idx === -1) return undefined;
    meetings[idx] = { ...meetings[idx], ...data, updatedAt: now() };
    return meetings[idx];
  },

  delete: (id: string): boolean => {
    const idx = meetings.findIndex((m) => m.id === id);
    if (idx === -1) return false;
    meetings.splice(idx, 1);
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
    return interaction;
  },

  update: (id: string, data: Partial<Interaction>): Interaction | undefined => {
    const idx = interactions.findIndex((i) => i.id === id);
    if (idx === -1) return undefined;
    interactions[idx] = { ...interactions[idx], ...data };
    return interactions[idx];
  },

  delete: (id: string): boolean => {
    const idx = interactions.findIndex((i) => i.id === id);
    if (idx === -1) return false;
    interactions.splice(idx, 1);
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
    return request;
  },

  update: (
    id: string,
    data: Partial<MembershipRequest>
  ): MembershipRequest | undefined => {
    const idx = membershipRequests.findIndex((r) => r.id === id);
    if (idx === -1) return undefined;
    membershipRequests[idx] = { ...membershipRequests[idx], ...data };
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
    const notification: appNotification = {
      ...data,
      id: generateId(),
      read: false,
      createdAt: now(),
    };
    notifications.push(notification);
    return notification;
  },

  markAsRead: (id: string): appNotification | undefined => {
    const idx = notifications.findIndex((n) => n.id === id);
    if (idx === -1) return undefined;
    notifications[idx] = { ...notifications[idx], read: true };
    return notifications[idx];
  },

  markAllAsRead: (userId: string): number => {
    let count = 0;
    notifications = notifications.map((n) => {
      if (n.userId === userId && !n.read) {
        count++;
        return { ...n, read: true };
      }
      return n;
    });
    if (globalForDb.dbStore) globalForDb.dbStore.notifications = notifications;
    return count;
  },

  delete: (id: string): boolean => {
    const idx = notifications.findIndex((n) => n.id === id);
    if (idx === -1) return false;
    notifications.splice(idx, 1);
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
    const zoneCampuses = campuses.filter((c) => c.zoneId === zoneId);
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
// Combined Database Export (for backward compatibility)
// ============================================================================
export const db = {
  users: userDb,
  zones: zoneDb,
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
};
