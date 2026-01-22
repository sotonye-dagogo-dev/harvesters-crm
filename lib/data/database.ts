import bcrypt from "bcryptjs";
import {
  mockUsers,
  mockGroups,
  mockMeetings,
  mockInteractions,
  mockMembershipRequests,
  mockNotifications,
} from "./mockData";

// ============================================================================
// IN-MEMORY DATABASE (SINGLETON PATTERN)
// ============================================================================

// Deep clone to avoid mutations
const cloneData = <T>(data: T): T => JSON.parse(JSON.stringify(data));

// Use globalThis to persist data across hot reloads in development
const globalForDb = globalThis as unknown as {
  dbStore?: {
    users: User[];
    groups: Group[];
    meetings: Meeting[];
    interactions: Interaction[];
    membershipRequests: MembershipRequest[];
    notifications: appNotification[];
  };
};

// Initialize or reuse existing data stores
if (!globalForDb.dbStore) {
  globalForDb.dbStore = {
    users: cloneData(mockUsers),
    groups: cloneData(mockGroups),
    meetings: cloneData(mockMeetings),
    interactions: cloneData(mockInteractions),
    membershipRequests: cloneData(mockMembershipRequests),
    notifications: cloneData(mockNotifications),
  };
}

// Reference the global store
let users = globalForDb.dbStore.users;
const groups = globalForDb.dbStore.groups;
const meetings = globalForDb.dbStore.meetings;
const interactions = globalForDb.dbStore.interactions;
const membershipRequests = globalForDb.dbStore.membershipRequests;
let notifications = globalForDb.dbStore.notifications;

// Helper to generate IDs
const generateId = () =>
  `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Helper for timestamps
const now = () => new Date().toISOString();

// ============================================================================
// USER OPERATIONS
// ============================================================================

export const userDb = {
  findAll: (filters?: UserFilters): User[] => {
    let result = [...users];

    if (filters?.role) {
      result = result.filter((u) => u.role === filters.role);
    }
    if (filters?.groupId) {
      result = result.filter((u) => u.groupId === filters.groupId);
    }
    if (filters?.isActive !== undefined) {
      result = result.filter((u) => u.isActive === filters.isActive);
    }
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(
        (u) =>
          u.firstName.toLowerCase().includes(search) ||
          u.lastName.toLowerCase().includes(search) ||
          u.email.toLowerCase().includes(search)
      );
    }

    return result;
  },

  findById: (id: string): User | undefined => {
    return users.find((u) => u.id === id);
  },

  findByEmail: (email: string): User | undefined => {
    return users.find((u) => u.email === email);
  },

  create: (data: CreateUserInput): User => {
    const hashedPassword = bcrypt.hashSync(data.password, 10);
    const newUser: User = {
      id: generateId(),
      email: data.email,
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      whatsappPhone: data.whatsappPhone,
      location: data.location,
      age: data.age,
      maritalStatus: data.maritalStatus,
      employmentStatus: data.employmentStatus,
      interests: data.interests || [],
      role: "MEMBER" as UserRole,
      groupId: data.groupId,
      avatar: undefined,
      isActive: true,
      createdAt: now(),
      updatedAt: now(),
    };

    users.push(newUser);
    globalForDb.dbStore!.users = users; // Ensure global store is updated

    // Update group member count if assigned
    if (newUser.groupId) {
      const group = groups.find((g) => g.id === newUser.groupId);
      if (group) {
        group.memberCount++;
        group.updatedAt = now();
      }
    }

    return newUser;
  },

  update: (id: string, data: UpdateUserInput): User | undefined => {
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) return undefined;

    const user = users[index];
    const oldGroupId = user.groupId;

    users[index] = {
      ...user,
      ...data,
      updatedAt: now(),
    };

    // Update group member counts if group changed
    if (oldGroupId !== users[index].groupId) {
      if (oldGroupId) {
        const oldGroup = groups.find((g) => g.id === oldGroupId);
        if (oldGroup) {
          oldGroup.memberCount--;
          oldGroup.updatedAt = now();
        }
      }
      if (users[index].groupId) {
        const newGroup = groups.find((g) => g.id === users[index].groupId);
        if (newGroup) {
          newGroup.memberCount++;
          newGroup.updatedAt = now();
        }
      }
    }

    return users[index];
  },

  updateRole: (id: string, role: UserRole): User | undefined => {
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) return undefined;

    users[index].role = role;
    users[index].updatedAt = now();
    return users[index];
  },

  updatePassword: (id: string, hashedPassword: string): User | undefined => {
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) return undefined;

    users[index].password = hashedPassword;
    users[index].updatedAt = now();
    return users[index];
  },

  delete: (id: string): boolean => {
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) return false;

    const user = users[index];

    // Update group member count
    if (user.groupId) {
      const group = groups.find((g) => g.id === user.groupId);
      if (group) {
        group.memberCount--;
        group.updatedAt = now();
      }
    }

    users[index].isActive = false;
    users[index].updatedAt = now();
    return true;
  },

  comparePassword: (password: string, hash: string): boolean => {
    return bcrypt.compareSync(password, hash);
  },
};

// ============================================================================
// GROUP OPERATIONS
// ============================================================================

export const groupDb = {
  findAll: (filters?: GroupFilters): Group[] => {
    let result = [...groups];

    if (filters?.leaderId) {
      result = result.filter((g) => g.leaderId === filters.leaderId);
    }
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(
        (g) =>
          g.name.toLowerCase().includes(search) ||
          g.description.toLowerCase().includes(search)
      );
    }

    return result;
  },

  findById: (id: string): Group | undefined => {
    return groups.find((g) => g.id === id);
  },

  create: (data: CreateGroupInput): Group => {
    const newGroup: Group = {
      id: generateId(),
      name: data.name,
      description: data.description,
      meetingFrequency: data.meetingFrequency,
      leaderId: data.leaderId,
      memberCount: 0,
      createdAt: now(),
      updatedAt: now(),
    };

    groups.push(newGroup);
    globalForDb.dbStore!.groups = groups; // Ensure global store is updated
    return newGroup;
  },

  update: (id: string, data: UpdateGroupInput): Group | undefined => {
    const index = groups.findIndex((g) => g.id === id);
    if (index === -1) return undefined;

    groups[index] = {
      ...groups[index],
      ...data,
      updatedAt: now(),
    };

    return groups[index];
  },

  delete: (id: string): boolean => {
    const index = groups.findIndex((g) => g.id === id);
    if (index === -1) return false;

    // Remove group reference from users
    users = users.map((u) => {
      if (u.groupId === id) {
        return { ...u, groupId: undefined, updatedAt: now() };
      }
      return u;
    });
    globalForDb.dbStore!.users = users; // Sync users update

    groups.splice(index, 1);
    globalForDb.dbStore!.groups = groups; // Ensure global store is updated
    return true;
  },

  getMembers: (groupId: string): User[] => {
    return users.filter((u) => u.groupId === groupId);
  },

  addMember: (groupId: string, memberId: string): boolean => {
    const group = groups.find((g) => g.id === groupId);
    const user = users.find((u) => u.id === memberId);

    if (!group || !user) return false;

    const oldGroupId = user.groupId;

    // Remove from old group
    if (oldGroupId) {
      const oldGroup = groups.find((g) => g.id === oldGroupId);
      if (oldGroup) {
        oldGroup.memberCount--;
        oldGroup.updatedAt = now();
      }
    }

    // Add to new group
    user.groupId = groupId;
    user.updatedAt = now();
    group.memberCount++;
    group.updatedAt = now();

    return true;
  },

  removeMember: (groupId: string, memberId: string): boolean => {
    const group = groups.find((g) => g.id === groupId);
    const user = users.find((u) => u.id === memberId && u.groupId === groupId);

    if (!group || !user) return false;

    user.groupId = undefined;
    user.updatedAt = now();
    group.memberCount--;
    group.updatedAt = now();

    return true;
  },
};

// ============================================================================
// MEETING OPERATIONS
// ============================================================================

export const meetingDb = {
  findAll: (filters?: MeetingFilters): Meeting[] => {
    let result = [...meetings];

    if (filters?.groupId) {
      result = result.filter((m) => m.groupId === filters.groupId);
    }
    if (filters?.createdById) {
      result = result.filter((m) => m.createdById === filters.createdById);
    }
    if (filters?.dateFrom) {
      result = result.filter((m) => m.date >= filters.dateFrom!);
    }
    if (filters?.dateTo) {
      result = result.filter((m) => m.date <= filters.dateTo!);
    }

    return result.sort((a, b) => b.date.localeCompare(a.date));
  },

  findById: (id: string): Meeting | undefined => {
    return meetings.find((m) => m.id === id);
  },

  create: (data: CreateMeetingInput, createdById: string): Meeting => {
    const newMeeting: Meeting = {
      id: generateId(),
      groupId: data.groupId,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      topic: data.topic,
      attendeeCount: data.attendeeCount || data.attendeeIds?.length || 0,
      attendeeIds: data.attendeeIds || [],
      screenshotUrl: data.screenshotUrl,
      notes: data.notes,
      createdById,
      createdAt: now(),
      updatedAt: now(),
    };

    meetings.push(newMeeting);
    globalForDb.dbStore!.meetings = meetings; // Ensure global store is updated
    return newMeeting;
  },

  update: (id: string, data: UpdateMeetingInput): Meeting | undefined => {
    const index = meetings.findIndex((m) => m.id === id);
    if (index === -1) return undefined;

    meetings[index] = {
      ...meetings[index],
      ...data,
      updatedAt: now(),
    };

    return meetings[index];
  },

  delete: (id: string): boolean => {
    const index = meetings.findIndex((m) => m.id === id);
    if (index === -1) return false;

    meetings.splice(index, 1);
    globalForDb.dbStore!.meetings = meetings; // Ensure global store is updated
    return true;
  },
};

// ============================================================================
// INTERACTION OPERATIONS
// ============================================================================

export const interactionDb = {
  findAll: (filters?: InteractionFilters): Interaction[] => {
    let result = [...interactions];

    if (filters?.leaderId) {
      result = result.filter((i) => i.leaderId === filters.leaderId);
    }
    if (filters?.memberId) {
      result = result.filter((i) => i.memberId === filters.memberId);
    }
    if (filters?.type) {
      result = result.filter((i) => i.type === filters.type);
    }
    if (filters?.dateFrom) {
      result = result.filter((i) => i.timestamp >= filters.dateFrom!);
    }
    if (filters?.dateTo) {
      result = result.filter((i) => i.timestamp <= filters.dateTo!);
    }

    return result.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  },

  findById: (id: string): Interaction | undefined => {
    return interactions.find((i) => i.id === id);
  },

  create: (data: CreateInteractionInput, leaderId: string): Interaction => {
    const newInteraction: Interaction = {
      id: generateId(),
      leaderId,
      memberId: data.memberId,
      type: data.type,
      notes: data.notes,
      timestamp: data.timestamp || now(),
      createdAt: now(),
    };

    interactions.push(newInteraction);
    globalForDb.dbStore!.interactions = interactions; // Ensure global store is updated
    return newInteraction;
  },

  update: (
    id: string,
    data: UpdateInteractionInput
  ): Interaction | undefined => {
    const index = interactions.findIndex((i) => i.id === id);
    if (index === -1) return undefined;

    interactions[index] = {
      ...interactions[index],
      ...data,
    };

    return interactions[index];
  },

  delete: (id: string): boolean => {
    const index = interactions.findIndex((i) => i.id === id);
    if (index === -1) return false;

    interactions.splice(index, 1);
    globalForDb.dbStore!.interactions = interactions; // Ensure global store is updated
    return true;
  },
};

// ============================================================================
// MEMBERSHIP REQUEST OPERATIONS
// ============================================================================

export const membershipRequestDb = {
  findAll: (filters?: MembershipRequestFilters): MembershipRequest[] => {
    let result = [...membershipRequests];

    if (filters?.memberId) {
      result = result.filter((r) => r.memberId === filters.memberId);
    }
    if (filters?.toGroupId) {
      result = result.filter((r) => r.toGroupId === filters.toGroupId);
    }
    if (filters?.status) {
      result = result.filter((r) => r.status === filters.status);
    }
    if (filters?.type) {
      result = result.filter((r) => r.type === filters.type);
    }

    return result.sort((a, b) => b.requestedAt.localeCompare(a.requestedAt));
  },

  findById: (id: string): MembershipRequest | undefined => {
    return membershipRequests.find((r) => r.id === id);
  },

  create: (
    data: CreateMembershipRequestInput,
    memberId: string
  ): MembershipRequest => {
    const member = users.find((u) => u.id === memberId);
    const type =
      data.type ||
      (member?.groupId
        ? ("TRANSFER" as MembershipRequestType)
        : ("JOIN" as MembershipRequestType));

    const newRequest: MembershipRequest = {
      id: generateId(),
      memberId,
      fromGroupId: data.fromGroupId || member?.groupId,
      toGroupId: data.toGroupId,
      type,
      status: "PENDING" as MembershipRequestStatus,
      message: data.message,
      requestedAt: now(),
      respondedAt: undefined,
      respondedById: undefined,
      responseMessage: undefined,
    };

    membershipRequests.push(newRequest);
    globalForDb.dbStore!.membershipRequests = membershipRequests; // Ensure global store is updated
    return newRequest;
  },

  respond: (
    id: string,
    data: RespondToRequestInput,
    respondedById: string
  ): MembershipRequest | undefined => {
    const index = membershipRequests.findIndex((r) => r.id === id);
    if (index === -1) return undefined;

    const request = membershipRequests[index];
    request.status = data.status;
    request.respondedAt = now();
    request.respondedById = respondedById;
    request.responseMessage = data.responseMessage;

    // If approved, update user's group
    if (data.status === "APPROVED") {
      groupDb.addMember(request.toGroupId, request.memberId);
    }

    return request;
  },

  delete: (id: string): boolean => {
    const index = membershipRequests.findIndex((r) => r.id === id);
    if (index === -1) return false;

    membershipRequests.splice(index, 1);
    globalForDb.dbStore!.membershipRequests = membershipRequests; // Ensure global store is updated
    return true;
  },
};

// ============================================================================
// NOTIFICATION OPERATIONS
// ============================================================================

export const notificationDb = {
  findByUserId: (
    userId: string,
    unreadOnly: boolean = false
  ): appNotification[] => {
    let result = notifications.filter((n) => n.userId === userId);

    if (unreadOnly) {
      result = result.filter((n) => !n.read);
    }

    return result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  findById: (id: string): appNotification | undefined => {
    return notifications.find((n) => n.id === id);
  },

  create: (
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    relatedId?: string
  ): appNotification => {
    const newNotification: appNotification = {
      id: generateId(),
      userId,
      type,
      title,
      message,
      relatedId,
      read: false,
      createdAt: now(),
    };

    notifications.push(newNotification);
    globalForDb.dbStore!.notifications = notifications; // Ensure global store is updated
    return newNotification;
  },

  markAsRead: (id: string): boolean => {
    const notification = notifications.find((n) => n.id === id);
    if (!notification) return false;

    notification.read = true;
    return true;
  },

  markAllAsRead: (userId: string): boolean => {
    notifications = notifications.map((n) => {
      if (n.userId === userId) {
        return { ...n, read: true };
      }
      return n;
    });
    globalForDb.dbStore!.notifications = notifications; // Ensure global store is updated
    return true;
  },

  delete: (id: string): boolean => {
    const index = notifications.findIndex((n) => n.id === id);
    if (index === -1) return false;

    notifications.splice(index, 1);
    globalForDb.dbStore!.notifications = notifications; // Ensure global store is updated
    return true;
  },
};

// ============================================================================
// ANALYTICS OPERATIONS
// ============================================================================

export const analyticsDb = {
  getMemberAnalytics: (userId: string): MemberAnalytics => {
    const user = users.find((u) => u.id === userId);
    if (!user || !user.groupId) {
      return {
        userId,
        attendanceRate: 0,
        totalMeetings: 0,
        attendedMeetings: 0,
        missedMeetings: 0,
        engagementScore: 0,
        lastInteraction: undefined,
        interactionCount: 0,
        isAtRisk: false,
      };
    }

    const groupMeetings = meetings.filter((m) => m.groupId === user.groupId);
    const attendedMeetings = groupMeetings.filter((m) =>
      m.attendeeIds.includes(userId)
    );
    const totalMeetings = groupMeetings.length;
    const attendedCount = attendedMeetings.length;
    const missedCount = totalMeetings - attendedCount;
    const attendanceRate =
      totalMeetings > 0 ? (attendedCount / totalMeetings) * 100 : 0;

    const memberInteractions = interactions.filter(
      (i) => i.memberId === userId
    );
    const interactionCount = memberInteractions.length;
    const lastInteraction = memberInteractions[0]?.timestamp;

    // Calculate engagement score
    const attendanceScore = attendanceRate * 0.5;
    const interactionScore = Math.min(interactionCount * 10, 30); // Max 30 points
    const recentActivityScore = lastInteraction ? 20 : 0;
    const engagementScore =
      attendanceScore + interactionScore + recentActivityScore;

    // Check if at risk
    const recentMeetings = groupMeetings.slice(0, 3);
    const attendedRecent = recentMeetings.filter((m) =>
      m.attendeeIds.includes(userId)
    ).length;
    const daysSinceInteraction = lastInteraction
      ? (Date.now() - new Date(lastInteraction).getTime()) /
        (1000 * 60 * 60 * 24)
      : 999;
    const isAtRisk =
      attendedRecent === 0 || daysSinceInteraction > 30 || engagementScore < 40;

    return {
      userId,
      attendanceRate,
      totalMeetings,
      attendedMeetings: attendedCount,
      missedMeetings: missedCount,
      engagementScore,
      lastInteraction,
      interactionCount,
      isAtRisk,
    };
  },

  getGroupAnalytics: (groupId: string): GroupAnalytics => {
    const group = groups.find((g) => g.id === groupId);
    if (!group) {
      return {
        groupId,
        attendanceRate: 0,
        totalMeetings: 0,
        averageAttendance: 0,
        memberCount: 0,
        activeMembers: 0,
        atRiskMembers: 0,
        meetingFrequencyAdherence: 0,
        leaderInteractionRate: 0,
      };
    }

    const groupMeetings = meetings.filter((m) => m.groupId === groupId);
    const totalMeetings = groupMeetings.length;
    const members = users.filter((u) => u.groupId === groupId);
    const memberCount = members.length;

    // Calculate attendance rate
    const totalAttendance = groupMeetings.reduce(
      (sum, m) => sum + m.attendeeCount,
      0
    );
    const averageAttendance =
      totalMeetings > 0 ? totalAttendance / totalMeetings : 0;
    const attendanceRate =
      memberCount > 0 && totalMeetings > 0
        ? (averageAttendance / memberCount) * 100
        : 0;

    // Active members (attended at least one meeting in last 3)
    const recentMeetings = groupMeetings.slice(0, 3);
    const activeMembers = members.filter((m) =>
      recentMeetings.some((meeting) => meeting.attendeeIds.includes(m.id))
    ).length;

    // At-risk members
    const atRiskMembers = members.filter((m) => {
      const analytics = analyticsDb.getMemberAnalytics(m.id);
      return analytics.isAtRisk;
    }).length;

    // Leader interaction rate
    const leaderInteractions = interactions.filter(
      (i) => i.leaderId === group.leaderId
    );
    const leaderInteractionRate =
      memberCount > 0 ? (leaderInteractions.length / memberCount) * 100 : 0;

    // Meeting frequency adherence (simplified)
    const meetingFrequencyAdherence = 85; // Mock value

    return {
      groupId,
      attendanceRate,
      totalMeetings,
      averageAttendance,
      memberCount,
      activeMembers,
      atRiskMembers,
      meetingFrequencyAdherence,
      leaderInteractionRate,
    };
  },

  getChurchWideAnalytics: (): ChurchWideAnalytics => {
    const totalMembers = users.filter((u) => u.role === "MEMBER").length;
    const activeMembers = users.filter(
      (u) => u.role === "MEMBER" && u.isActive
    ).length;
    const inactiveMembers = totalMembers - activeMembers;
    const totalGroups = groups.length;
    const totalMeetings = meetings.length;

    // Overall attendance rate
    const allGroupAnalytics = groups.map((g) =>
      analyticsDb.getGroupAnalytics(g.id)
    );
    const overallAttendanceRate =
      allGroupAnalytics.reduce((sum, a) => sum + a.attendanceRate, 0) /
      Math.max(totalGroups, 1);

    // Average engagement score
    const allMemberAnalytics = users
      .filter((u) => u.role === "MEMBER" && u.groupId)
      .map((u) => analyticsDb.getMemberAnalytics(u.id));
    const averageEngagementScore =
      allMemberAnalytics.reduce((sum, a) => sum + a.engagementScore, 0) /
      Math.max(allMemberAnalytics.length, 1);

    // At-risk member count
    const atRiskMemberCount = allMemberAnalytics.filter(
      (a) => a.isAtRisk
    ).length;

    // Interest distribution
    const interestDistribution: Record<string, number> = {};
    users.forEach((u) => {
      u.interests.forEach((interest) => {
        interestDistribution[interest] =
          (interestDistribution[interest] || 0) + 1;
      });
    });

    // Group performance
    const groupPerformance = groups.map((g) => {
      const analytics = analyticsDb.getGroupAnalytics(g.id);
      return {
        groupId: g.id,
        groupName: g.name,
        attendanceRate: analytics.attendanceRate,
        memberCount: analytics.memberCount,
      };
    });

    // Active groups (had meeting in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentMeetings = meetings.filter(
      (m) => new Date(m.date) > thirtyDaysAgo
    );
    const activeGroupIds = new Set(recentMeetings.map((m) => m.groupId));
    const activeGroups = activeGroupIds.size;

    return {
      totalMembers,
      activeMembers,
      inactiveMembers,
      totalGroups,
      activeGroups,
      totalMeetings,
      overallAttendanceRate,
      averageEngagementScore,
      atRiskMemberCount,
      interestDistribution,
      groupPerformance,
    };
  },
};

// ============================================================================
// EXPORT DATABASE API
// ============================================================================

export const db = {
  users: userDb,
  groups: groupDb,
  meetings: meetingDb,
  interactions: interactionDb,
  membershipRequests: membershipRequestDb,
  notifications: notificationDb,
  analytics: analyticsDb,
};
