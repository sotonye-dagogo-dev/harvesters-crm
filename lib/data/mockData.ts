import bcrypt from "bcryptjs";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

function getDateString(daysAgo: number = 0): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
}

// ============================================================================
// MOCK USERS
// ============================================================================

export const mockUsers: User[] = [
  // Superadmin
  {
    id: "user-superadmin-1",
    email: "admin@harvesterschurch.org",
    password: hashPassword("Admin@123"),
    firstName: "Pastor",
    lastName: "Johnson",
    phone: "+1234567890",
    whatsappPhone: "+1234567890",
    location: "Lagos, Nigeria",
    age: 45,
    maritalStatus: "MARRIED" as MaritalStatus,
    employmentStatus: "EMPLOYED" as EmploymentStatus,
    interests: ["Bible Study", "Prayer", "Teaching", "Counseling"],
    role: "SUPERADMIN" as UserRole,
    groupId: undefined,
    avatar: undefined,
    isActive: true,
    createdAt: getDateString(365),
    updatedAt: getDateString(1),
  },

  // Group Leaders
  {
    id: "user-leader-1",
    email: "david.adeyemi@email.com",
    password: hashPassword("Leader@123"),
    firstName: "David",
    lastName: "Adeyemi",
    phone: "+2348012345678",
    whatsappPhone: "+2348012345678",
    location: "Ikeja, Lagos",
    age: 32,
    maritalStatus: "MARRIED" as MaritalStatus,
    employmentStatus: "EMPLOYED" as EmploymentStatus,
    interests: ["Youth Ministry", "Music", "Technology"],
    role: "LEADER" as UserRole,
    groupId: "group-1",
    avatar: undefined,
    isActive: true,
    createdAt: getDateString(200),
    updatedAt: getDateString(5),
  },
  {
    id: "user-leader-2",
    email: "grace.okonkwo@email.com",
    password: hashPassword("Leader@123"),
    firstName: "Grace",
    lastName: "Okonkwo",
    phone: "+2348023456789",
    whatsappPhone: "+2348023456789",
    location: "Victoria Island, Lagos",
    age: 29,
    maritalStatus: "SINGLE" as MaritalStatus,
    employmentStatus: "SELF_EMPLOYED" as EmploymentStatus,
    interests: ["Women's Ministry", "Worship", "Hospitality"],
    role: "LEADER" as UserRole,
    groupId: "group-2",
    avatar: undefined,
    isActive: true,
    createdAt: getDateString(180),
    updatedAt: getDateString(3),
  },
  {
    id: "user-leader-3",
    email: "michael.ibrahim@email.com",
    password: hashPassword("Leader@123"),
    firstName: "Michael",
    lastName: "Ibrahim",
    phone: "+2348034567890",
    whatsappPhone: "+2348034567890",
    location: "Surulere, Lagos",
    age: 38,
    maritalStatus: "MARRIED" as MaritalStatus,
    employmentStatus: "EMPLOYED" as EmploymentStatus,
    interests: ["Men's Ministry", "Sports & Recreation", "Evangelism"],
    role: "LEADER" as UserRole,
    groupId: "group-3",
    avatar: undefined,
    isActive: true,
    createdAt: getDateString(250),
    updatedAt: getDateString(2),
  },

  // Members - Group 1 (Youth Fellowship)
  {
    id: "user-member-1",
    email: "blessing.chukwu@email.com",
    password: hashPassword("Member@123"),
    firstName: "Blessing",
    lastName: "Chukwu",
    phone: "+2348045678901",
    whatsappPhone: "+2348045678901",
    location: "Yaba, Lagos",
    age: 23,
    maritalStatus: "SINGLE" as MaritalStatus,
    employmentStatus: "STUDENT" as EmploymentStatus,
    interests: ["Youth Ministry", "Music", "Media & Communications"],
    role: "MEMBER" as UserRole,
    groupId: "group-1",
    avatar: undefined,
    isActive: true,
    createdAt: getDateString(150),
    updatedAt: getDateString(10),
  },
  {
    id: "user-member-2",
    email: "samuel.ojo@email.com",
    password: hashPassword("Member@123"),
    firstName: "Samuel",
    lastName: "Ojo",
    phone: "+2348056789012",
    whatsappPhone: "+2348056789012",
    location: "Ikoyi, Lagos",
    age: 21,
    maritalStatus: "SINGLE" as MaritalStatus,
    employmentStatus: "STUDENT" as EmploymentStatus,
    interests: ["Technology", "Youth Ministry", "Sports & Recreation"],
    role: "MEMBER" as UserRole,
    groupId: "group-1",
    avatar: undefined,
    isActive: true,
    createdAt: getDateString(120),
    updatedAt: getDateString(15),
  },
  {
    id: "user-member-3",
    email: "faith.eze@email.com",
    password: hashPassword("Member@123"),
    firstName: "Faith",
    lastName: "Eze",
    phone: "+2348067890123",
    whatsappPhone: "+2348067890123",
    location: "Ikeja, Lagos",
    age: 25,
    maritalStatus: "SINGLE" as MaritalStatus,
    employmentStatus: "EMPLOYED" as EmploymentStatus,
    interests: ["Worship", "Arts & Crafts", "Children's Ministry"],
    role: "MEMBER" as UserRole,
    groupId: "group-1",
    avatar: undefined,
    isActive: true,
    createdAt: getDateString(100),
    updatedAt: getDateString(20),
  },

  // Members - Group 2 (Women's Fellowship)
  {
    id: "user-member-4",
    email: "mary.akpan@email.com",
    password: hashPassword("Member@123"),
    firstName: "Mary",
    lastName: "Akpan",
    phone: "+2348078901234",
    whatsappPhone: "+2348078901234",
    location: "Lekki, Lagos",
    age: 35,
    maritalStatus: "MARRIED" as MaritalStatus,
    employmentStatus: "SELF_EMPLOYED" as EmploymentStatus,
    interests: ["Women's Ministry", "Hospitality", "Prayer"],
    role: "MEMBER" as UserRole,
    groupId: "group-2",
    avatar: undefined,
    isActive: true,
    createdAt: getDateString(160),
    updatedAt: getDateString(8),
  },
  {
    id: "user-member-5",
    email: "esther.nnamdi@email.com",
    password: hashPassword("Member@123"),
    firstName: "Esther",
    lastName: "Nnamdi",
    phone: "+2348089012345",
    whatsappPhone: "+2348089012345",
    location: "Ajah, Lagos",
    age: 28,
    maritalStatus: "MARRIED" as MaritalStatus,
    employmentStatus: "EMPLOYED" as EmploymentStatus,
    interests: ["Bible Study", "Children's Ministry", "Mentorship"],
    role: "MEMBER" as UserRole,
    groupId: "group-2",
    avatar: undefined,
    isActive: true,
    createdAt: getDateString(140),
    updatedAt: getDateString(12),
  },
  {
    id: "user-member-6",
    email: "deborah.okafor@email.com",
    password: hashPassword("Member@123"),
    firstName: "Deborah",
    lastName: "Okafor",
    phone: "+2348090123456",
    whatsappPhone: "+2348090123456",
    location: "Festac, Lagos",
    age: 42,
    maritalStatus: "MARRIED" as MaritalStatus,
    employmentStatus: "EMPLOYED" as EmploymentStatus,
    interests: ["Prayer", "Counseling", "Community Service"],
    role: "MEMBER" as UserRole,
    groupId: "group-2",
    avatar: undefined,
    isActive: true,
    createdAt: getDateString(200),
    updatedAt: getDateString(6),
  },

  // Members - Group 3 (Men's Fellowship)
  {
    id: "user-member-7",
    email: "john.williams@email.com",
    password: hashPassword("Member@123"),
    firstName: "John",
    lastName: "Williams",
    phone: "+2348101234567",
    whatsappPhone: "+2348101234567",
    location: "Maryland, Lagos",
    age: 40,
    maritalStatus: "MARRIED" as MaritalStatus,
    employmentStatus: "EMPLOYED" as EmploymentStatus,
    interests: ["Men's Ministry", "Teaching", "Administration"],
    role: "MEMBER" as UserRole,
    groupId: "group-3",
    avatar: undefined,
    isActive: true,
    createdAt: getDateString(220),
    updatedAt: getDateString(4),
  },
  {
    id: "user-member-8",
    email: "peter.udoh@email.com",
    password: hashPassword("Member@123"),
    firstName: "Peter",
    lastName: "Udoh",
    phone: "+2348112345678",
    whatsappPhone: "+2348112345678",
    location: "Gbagada, Lagos",
    age: 33,
    maritalStatus: "MARRIED" as MaritalStatus,
    employmentStatus: "SELF_EMPLOYED" as EmploymentStatus,
    interests: ["Sports & Recreation", "Evangelism", "Mentorship"],
    role: "MEMBER" as UserRole,
    groupId: "group-3",
    avatar: undefined,
    isActive: true,
    createdAt: getDateString(130),
    updatedAt: getDateString(18),
  },
  {
    id: "user-member-9",
    email: "thomas.olayinka@email.com",
    password: hashPassword("Member@123"),
    firstName: "Thomas",
    lastName: "Olayinka",
    phone: "+2348123456789",
    whatsappPhone: "+2348123456789",
    location: "Ikorodu, Lagos",
    age: 36,
    maritalStatus: "MARRIED" as MaritalStatus,
    employmentStatus: "EMPLOYED" as EmploymentStatus,
    interests: ["Bible Study", "Music", "Technology"],
    role: "MEMBER" as UserRole,
    groupId: "group-3",
    avatar: undefined,
    isActive: true,
    createdAt: getDateString(110),
    updatedAt: getDateString(22),
  },

  // Unassigned Members
  {
    id: "user-member-10",
    email: "sarah.benson@email.com",
    password: hashPassword("Member@123"),
    firstName: "Sarah",
    lastName: "Benson",
    phone: "+2348134567890",
    whatsappPhone: "+2348134567890",
    location: "Magodo, Lagos",
    age: 26,
    maritalStatus: "SINGLE" as MaritalStatus,
    employmentStatus: "EMPLOYED" as EmploymentStatus,
    interests: ["Worship", "Media & Communications", "Writing"],
    role: "MEMBER" as UserRole,
    groupId: undefined,
    avatar: undefined,
    isActive: true,
    createdAt: getDateString(30),
    updatedAt: getDateString(5),
  },
];

// ============================================================================
// MOCK GROUPS
// ============================================================================

export const mockGroups: Group[] = [
  {
    id: "group-1",
    name: "Youth Fellowship",
    description:
      "A vibrant group for young adults aged 18-30, focusing on spiritual growth, mentorship, and community service.",
    meetingFrequency: "BIWEEKLY" as MeetingFrequency,
    leaderId: "user-leader-1",
    memberCount: 3,
    createdAt: getDateString(200),
    updatedAt: getDateString(5),
  },
  {
    id: "group-2",
    name: "Women's Fellowship",
    description:
      "A supportive community for women of all ages to grow in faith, prayer, and mutual encouragement.",
    meetingFrequency: "BIWEEKLY" as MeetingFrequency,
    leaderId: "user-leader-2",
    memberCount: 3,
    createdAt: getDateString(180),
    updatedAt: getDateString(3),
  },
  {
    id: "group-3",
    name: "Men's Fellowship",
    description:
      "A brotherhood focused on spiritual leadership, accountability, and serving the church and community.",
    meetingFrequency: "WEEKLY" as MeetingFrequency,
    leaderId: "user-leader-3",
    memberCount: 3,
    createdAt: getDateString(250),
    updatedAt: getDateString(2),
  },
];

// ============================================================================
// MOCK MEETINGS
// ============================================================================

export const mockMeetings: Meeting[] = [
  // Youth Fellowship Meetings
  {
    id: "meeting-1",
    groupId: "group-1",
    date: getDateString(14).split("T")[0],
    startTime: "18:00",
    endTime: "19:30",
    attendeeCount: 3,
    attendeeIds: ["user-member-1", "user-member-2", "user-member-3"],
    screenshotUrl: undefined,
    notes:
      "Discussed spiritual disciplines and prayer life. Great engagement from everyone.",
    createdById: "user-leader-1",
    createdAt: getDateString(14),
    updatedAt: getDateString(14),
  },
  {
    id: "meeting-2",
    groupId: "group-1",
    date: getDateString(28).split("T")[0],
    startTime: "18:00",
    endTime: "19:30",
    attendeeCount: 2,
    attendeeIds: ["user-member-1", "user-member-3"],
    screenshotUrl: undefined,
    notes: "Bible study on the book of James. Samuel was absent.",
    createdById: "user-leader-1",
    createdAt: getDateString(28),
    updatedAt: getDateString(28),
  },

  // Women's Fellowship Meetings
  {
    id: "meeting-3",
    groupId: "group-2",
    date: getDateString(7).split("T")[0],
    startTime: "10:00",
    endTime: "11:30",
    attendeeCount: 3,
    attendeeIds: ["user-member-4", "user-member-5", "user-member-6"],
    screenshotUrl: undefined,
    notes: "Prayer session and testimonies. Very powerful meeting.",
    createdById: "user-leader-2",
    createdAt: getDateString(7),
    updatedAt: getDateString(7),
  },
  {
    id: "meeting-4",
    groupId: "group-2",
    date: getDateString(21).split("T")[0],
    startTime: "10:00",
    endTime: "11:30",
    attendeeCount: 2,
    attendeeIds: ["user-member-4", "user-member-6"],
    screenshotUrl: undefined,
    notes:
      "Topic: Being a Proverbs 31 woman. Esther could not attend due to work.",
    createdById: "user-leader-2",
    createdAt: getDateString(21),
    updatedAt: getDateString(21),
  },

  // Men's Fellowship Meetings
  {
    id: "meeting-5",
    groupId: "group-3",
    date: getDateString(3).split("T")[0],
    startTime: "06:00",
    endTime: "07:00",
    attendeeCount: 3,
    attendeeIds: ["user-member-7", "user-member-8", "user-member-9"],
    screenshotUrl: undefined,
    notes: "Early morning prayer and accountability session.",
    createdById: "user-leader-3",
    createdAt: getDateString(3),
    updatedAt: getDateString(3),
  },
  {
    id: "meeting-6",
    groupId: "group-3",
    date: getDateString(10).split("T")[0],
    startTime: "06:00",
    endTime: "07:00",
    attendeeCount: 2,
    attendeeIds: ["user-member-7", "user-member-9"],
    screenshotUrl: undefined,
    notes:
      "Discussion on spiritual leadership in the home. Peter was traveling.",
    createdById: "user-leader-3",
    createdAt: getDateString(10),
    updatedAt: getDateString(10),
  },
];

// ============================================================================
// MOCK INTERACTIONS
// ============================================================================

export const mockInteractions: Interaction[] = [
  {
    id: "interaction-1",
    leaderId: "user-leader-1",
    memberId: "user-member-2",
    type: "FOLLOW_UP" as InteractionType,
    notes:
      "Called to check why Samuel missed the last meeting. He had an exam.",
    timestamp: getDateString(27),
    createdAt: getDateString(27),
  },
  {
    id: "interaction-2",
    leaderId: "user-leader-2",
    memberId: "user-member-5",
    type: "CHECK_IN" as InteractionType,
    notes:
      "Casual check-in. Esther shared she's doing well, just busy with work.",
    timestamp: getDateString(20),
    createdAt: getDateString(20),
  },
  {
    id: "interaction-3",
    leaderId: "user-leader-3",
    memberId: "user-member-8",
    type: "CALL" as InteractionType,
    notes: "Discussed his business challenges and prayed together.",
    timestamp: getDateString(9),
    createdAt: getDateString(9),
  },
  {
    id: "interaction-4",
    leaderId: "user-leader-1",
    memberId: "user-member-1",
    type: "FOLLOW_UP" as InteractionType,
    notes: "Followed up on her school project. She's doing great!",
    timestamp: getDateString(5),
    createdAt: getDateString(5),
  },
];

// ============================================================================
// MOCK MEMBERSHIP REQUESTS
// ============================================================================

export const mockMembershipRequests: MembershipRequest[] = [
  {
    id: "request-1",
    memberId: "user-member-10",
    fromGroupId: undefined,
    toGroupId: "group-2",
    type: "JOIN" as MembershipRequestType,
    status: "PENDING" as MembershipRequestStatus,
    message:
      "I would love to join the Women's Fellowship. I'm passionate about prayer and mentorship.",
    requestedAt: getDateString(2),
    respondedAt: undefined,
    respondedById: undefined,
    responseMessage: undefined,
  },
  {
    id: "request-2",
    memberId: "user-member-3",
    fromGroupId: "group-1",
    toGroupId: "group-2",
    type: "TRANSFER" as MembershipRequestType,
    status: "APPROVED" as MembershipRequestStatus,
    message: "I feel led to join the Women's Fellowship to grow in my faith.",
    requestedAt: getDateString(30),
    respondedAt: getDateString(28),
    respondedById: "user-leader-2",
    responseMessage: "Welcome! We're excited to have you join us.",
  },
];

// ============================================================================
// MOCK NOTIFICATIONS
// ============================================================================

export const mockNotifications: appNotification[] = [
  {
    id: "notif-1",
    userId: "user-leader-1",
    type: "MEETING_REMINDER" as NotificationType,
    title: "Upcoming Meeting",
    message: "Youth Fellowship meeting scheduled for tomorrow at 6:00 PM",
    relatedId: "meeting-1",
    read: true,
    createdAt: getDateString(15),
  },
  {
    id: "notif-2",
    userId: "user-member-10",
    type: "REQUEST_STATUS" as NotificationType,
    title: "Membership Request Submitted",
    message:
      "Your request to join Women's Fellowship has been submitted and is pending approval.",
    relatedId: "request-1",
    read: false,
    createdAt: getDateString(2),
  },
  {
    id: "notif-3",
    userId: "user-leader-2",
    type: "REQUEST_STATUS" as NotificationType,
    title: "New Membership Request",
    message: "Sarah Benson has requested to join your group.",
    relatedId: "request-1",
    read: false,
    createdAt: getDateString(2),
  },
  {
    id: "notif-4",
    userId: "user-member-3",
    type: "REQUEST_STATUS" as NotificationType,
    title: "Request Approved",
    message: "Your transfer request to Women's Fellowship has been approved!",
    relatedId: "request-2",
    read: true,
    createdAt: getDateString(28),
  },
  {
    id: "notif-5",
    userId: "user-leader-3",
    type: "MEETING_REMINDER" as NotificationType,
    title: "Upcoming Meeting",
    message: "Men's Fellowship meeting tomorrow at 6:00 AM. See you there!",
    relatedId: "meeting-5",
    read: true,
    createdAt: getDateString(4),
  },
];
