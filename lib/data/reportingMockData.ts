import {
  ReportStatus,
  ReportCategory,
  ReportFrequency,
  FormFieldType,
  OrganizationalLevel,
  StrategicIndicatorCategory,
  MetricDataType,
  ReportCommentType,
  ReportNotificationKind,
  ValidationRuleType,
  UserRole,
} from "@/lib/types";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getDateString(daysAgo: number = 0): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
}

function getWeekNumber(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - start.getTime();
  const oneWeek = 604800000;
  return Math.ceil(diff / oneWeek + 1);
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Quality rating options reused across service quality fields
const QUALITY_OPTIONS: Array<{ label: string; value: string }> = [
  { label: "Excellent", value: "EXCELLENT" },
  { label: "Good", value: "GOOD" },
  { label: "Fair", value: "FAIR" },
  { label: "Poor", value: "POOR" },
];

// ============================================================================
// MOCK REPORT TYPES (All 11 Harvesters Report Types)
// ============================================================================

export const mockReportTypes: ReportType[] = [
  // 1. Group Report - Special Program
  {
    id: "rt-001",
    name: "Group Report - Special Program",
    description:
      "Report for special church programs including church planting and program metrics.",
    code: "GROUP_SPECIAL_PROGRAM",
    category: ReportCategory.GROUP,
    formDefinition: {
      sections: [
        {
          id: "sec-sp-001",
          title: "Church Planting Program",
          description: "Track church planting activities and personnel.",
          displayOrder: 1,
          fields: [
            {
              id: "f-sp-001",
              name: "churchPlantings",
              label: "Number of Church Plantings",
              type: FormFieldType.NUMBER,
              isRequired: true,
              minValue: 0,
              displayOrder: 1,
            },
            {
              id: "f-sp-002",
              name: "churchPlanters",
              label: "Number of Church Planters",
              type: FormFieldType.NUMBER,
              isRequired: true,
              minValue: 0,
              displayOrder: 2,
            },
            {
              id: "f-sp-003",
              name: "churchPlantersSmallGroup",
              label: "Number of Church Planters (Small Group)",
              type: FormFieldType.NUMBER,
              isRequired: true,
              minValue: 0,
              displayOrder: 3,
            },
          ],
        },
        {
          id: "sec-sp-002",
          title: "Program Metrics",
          description: "Key performance metrics for the program.",
          displayOrder: 2,
          fields: [
            {
              id: "f-sp-004",
              name: "reach",
              label: "Reach",
              type: FormFieldType.NUMBER,
              isRequired: true,
              minValue: 0,
              displayOrder: 1,
            },
            {
              id: "f-sp-005",
              name: "distribution",
              label: "Distribution",
              type: FormFieldType.NUMBER,
              isRequired: true,
              minValue: 0,
              displayOrder: 2,
            },
            {
              id: "f-sp-006",
              name: "volunteers",
              label: "Volunteers",
              type: FormFieldType.NUMBER,
              isRequired: true,
              minValue: 0,
              displayOrder: 3,
            },
            {
              id: "f-sp-007",
              name: "registration",
              label: "Registration",
              type: FormFieldType.NUMBER,
              isRequired: true,
              minValue: 0,
              displayOrder: 4,
            },
            {
              id: "f-sp-008",
              name: "attendance",
              label: "Attendance",
              type: FormFieldType.NUMBER,
              isRequired: true,
              minValue: 0,
              displayOrder: 5,
            },
            {
              id: "f-sp-009",
              name: "salvation",
              label: "Salvation",
              type: FormFieldType.NUMBER,
              isRequired: true,
              minValue: 0,
              displayOrder: 6,
            },
            {
              id: "f-sp-010",
              name: "assimilation",
              label: "Assimilation",
              type: FormFieldType.NUMBER,
              isRequired: true,
              minValue: 0,
              displayOrder: 7,
            },
            {
              id: "f-sp-011",
              name: "nextStep",
              label: "Next Step",
              type: FormFieldType.NUMBER,
              isRequired: true,
              minValue: 0,
              displayOrder: 8,
            },
            {
              id: "f-sp-012",
              name: "workersAttendance",
              label: "Workers Attendance",
              type: FormFieldType.NUMBER,
              isRequired: true,
              minValue: 0,
              displayOrder: 9,
            },
            {
              id: "f-sp-013",
              name: "firstTimers",
              label: "First Timers",
              type: FormFieldType.NUMBER,
              isRequired: true,
              minValue: 0,
              displayOrder: 10,
            },
          ],
        },
      ],
      validationRules: [],
    },
    allowedSubmitterRoles: [
      UserRole.SUPERADMIN,
      UserRole.ZONAL_LEADER,
      UserRole.CAMPUS_ADMIN,
      UserRole.HOD,
    ],
    allowedReviewerRoles: [
      UserRole.SUPERADMIN,
      UserRole.ZONAL_LEADER,
      UserRole.CAMPUS_ADMIN,
    ],
    frequency: ReportFrequency.AD_HOC,
    isActive: true,
    createdAt: getDateString(365),
    updatedAt: getDateString(30),
  },

  // 2. Attendance & Quality of Program Report
  {
    id: "rt-002",
    name: "Attendance & Quality of Program",
    description:
      "Weekly report tracking attendance metrics and service quality indicators.",
    code: "ATTENDANCE_QUALITY",
    category: ReportCategory.CAMPUS,
    formDefinition: {
      sections: [
        {
          id: "sec-aq-001",
          title: "Attendance Metrics",
          description: "Track weekly attendance figures.",
          displayOrder: 1,
          fields: [
            {
              id: "f-aq-001",
              name: "sundayAttendance",
              label: "Sunday Attendance",
              type: FormFieldType.NUMBER,
              isRequired: true,
              minValue: 0,
              displayOrder: 1,
            },
            {
              id: "f-aq-002",
              name: "firstTimerAttendance",
              label: "First Timer Attendance",
              type: FormFieldType.NUMBER,
              isRequired: true,
              minValue: 0,
              displayOrder: 2,
            },
            {
              id: "f-aq-003",
              name: "workersAttendance",
              label: "Workers Attendance",
              type: FormFieldType.NUMBER,
              isRequired: true,
              minValue: 0,
              displayOrder: 3,
            },
            {
              id: "f-aq-004",
              name: "midweekAttendance",
              label: "Midweek Attendance",
              type: FormFieldType.NUMBER,
              isRequired: true,
              minValue: 0,
              displayOrder: 4,
            },
          ],
        },
        {
          id: "sec-aq-002",
          title: "Service Quality Indicators",
          description: "Rate the quality of various service elements.",
          displayOrder: 2,
          fields: [
            {
              id: "f-aq-005",
              name: "sound",
              label: "Sound",
              type: FormFieldType.SELECT,
              isRequired: true,
              options: QUALITY_OPTIONS,
              displayOrder: 1,
            },
            {
              id: "f-aq-006",
              name: "light",
              label: "Light",
              type: FormFieldType.SELECT,
              isRequired: true,
              options: QUALITY_OPTIONS,
              displayOrder: 2,
            },
            {
              id: "f-aq-007",
              name: "staging",
              label: "Staging",
              type: FormFieldType.SELECT,
              isRequired: true,
              options: QUALITY_OPTIONS,
              displayOrder: 3,
            },
            {
              id: "f-aq-008",
              name: "music",
              label: "Music",
              type: FormFieldType.SELECT,
              isRequired: true,
              options: QUALITY_OPTIONS,
              displayOrder: 4,
            },
            {
              id: "f-aq-009",
              name: "parkingSpace",
              label: "Parking Space",
              type: FormFieldType.SELECT,
              isRequired: true,
              options: QUALITY_OPTIONS,
              displayOrder: 5,
            },
            {
              id: "f-aq-010",
              name: "greeters",
              label: "Greeters",
              type: FormFieldType.SELECT,
              isRequired: true,
              options: QUALITY_OPTIONS,
              displayOrder: 6,
            },
            {
              id: "f-aq-011",
              name: "ushersAndProtocol",
              label: "Ushers and Protocol",
              type: FormFieldType.SELECT,
              isRequired: true,
              options: QUALITY_OPTIONS,
              displayOrder: 7,
            },
          ],
        },
      ],
      validationRules: [],
    },
    allowedSubmitterRoles: [
      UserRole.SUPERADMIN,
      UserRole.CAMPUS_ADMIN,
      UserRole.HOD,
    ],
    allowedReviewerRoles: [
      UserRole.SUPERADMIN,
      UserRole.ZONAL_LEADER,
      UserRole.CAMPUS_ADMIN,
    ],
    frequency: ReportFrequency.WEEKLY,
    organizationalLevel: OrganizationalLevel.CAMPUS,
    isActive: true,
    createdAt: getDateString(365),
    updatedAt: getDateString(30),
  },

  // 3. NLP Report
  {
    id: "rt-003",
    name: "NLP Report",
    description: "Track New Life Program peak attendance.",
    code: "NLP_REPORT",
    category: ReportCategory.SPECIAL,
    formDefinition: {
      sections: [
        {
          id: "sec-nlp-001",
          title: "NLP Metrics",
          displayOrder: 1,
          fields: [
            {
              id: "f-nlp-001",
              name: "nlpPeakAttendance",
              label: "NLP Peak Attendance",
              type: FormFieldType.NUMBER,
              isRequired: true,
              minValue: 0,
              displayOrder: 1,
            },
          ],
        },
      ],
      validationRules: [],
    },
    allowedSubmitterRoles: [
      UserRole.SUPERADMIN,
      UserRole.CAMPUS_ADMIN,
      UserRole.HOD,
    ],
    allowedReviewerRoles: [UserRole.SUPERADMIN, UserRole.ZONAL_LEADER],
    frequency: ReportFrequency.AD_HOC,
    isActive: true,
    createdAt: getDateString(365),
    updatedAt: getDateString(30),
  },

  // 4. Salvation Report
  {
    id: "rt-004",
    name: "Salvation Report",
    description:
      "Weekly report tracking salvation numbers in cell outreach and church services.",
    code: "SALVATION_REPORT",
    category: ReportCategory.MINISTRY,
    formDefinition: {
      sections: [
        {
          id: "sec-sal-001",
          title: "Salvation Metrics",
          displayOrder: 1,
          fields: [
            {
              id: "f-sal-001",
              name: "salvationInCellOutreach",
              label: "Salvation in Cell (Outreach)",
              type: FormFieldType.NUMBER,
              isRequired: true,
              minValue: 0,
              displayOrder: 1,
            },
            {
              id: "f-sal-002",
              name: "salvationInChurch",
              label: "Salvation in Church",
              type: FormFieldType.NUMBER,
              isRequired: true,
              minValue: 0,
              displayOrder: 2,
            },
          ],
        },
      ],
      validationRules: [],
    },
    allowedSubmitterRoles: [
      UserRole.SUPERADMIN,
      UserRole.CAMPUS_ADMIN,
      UserRole.HOD,
      UserRole.SMALL_GROUP_LEADER,
      UserRole.CELL_LEADER,
    ],
    allowedReviewerRoles: [
      UserRole.SUPERADMIN,
      UserRole.ZONAL_LEADER,
      UserRole.CAMPUS_ADMIN,
    ],
    frequency: ReportFrequency.WEEKLY,
    organizationalLevel: OrganizationalLevel.CAMPUS,
    isActive: true,
    createdAt: getDateString(365),
    updatedAt: getDateString(30),
  },

  // 5. Small Group / Cell Report
  {
    id: "rt-005",
    name: "Small Group / Cell Report",
    description:
      "Weekly report tracking cell and small group metrics including leaders and attendance.",
    code: "SMALL_GROUP_CELL",
    category: ReportCategory.CAMPUS,
    formDefinition: {
      sections: [
        {
          id: "sec-sg-001",
          title: "Small Group / Cell Metrics",
          displayOrder: 1,
          fields: [
            {
              id: "f-sg-001",
              name: "numberOfCells",
              label: "Number of Cells / Small Groups",
              type: FormFieldType.NUMBER,
              isRequired: true,
              minValue: 0,
              displayOrder: 1,
            },
            {
              id: "f-sg-002",
              name: "numberOfLeaders",
              label: "Number of Leaders",
              type: FormFieldType.NUMBER,
              isRequired: true,
              minValue: 0,
              displayOrder: 2,
            },
            {
              id: "f-sg-003",
              name: "numberOfAssistantLeaders",
              label: "Number of Assistant Leaders",
              type: FormFieldType.NUMBER,
              isRequired: true,
              minValue: 0,
              displayOrder: 3,
            },
            {
              id: "f-sg-004",
              name: "attendance",
              label: "Attendance",
              type: FormFieldType.NUMBER,
              isRequired: true,
              minValue: 0,
              displayOrder: 4,
            },
          ],
        },
      ],
      validationRules: [],
    },
    allowedSubmitterRoles: [
      UserRole.SUPERADMIN,
      UserRole.CAMPUS_ADMIN,
      UserRole.HOD,
    ],
    allowedReviewerRoles: [
      UserRole.SUPERADMIN,
      UserRole.ZONAL_LEADER,
      UserRole.CAMPUS_ADMIN,
    ],
    frequency: ReportFrequency.WEEKLY,
    organizationalLevel: OrganizationalLevel.CAMPUS,
    isActive: true,
    createdAt: getDateString(365),
    updatedAt: getDateString(30),
  },

  // 6. Discipleship / Assimilation Report
  {
    id: "rt-006",
    name: "Discipleship / Assimilation Report",
    description:
      "Monthly report on discipleship courses, attendance, and pastoral leadership.",
    code: "DISCIPLESHIP_ASSIMILATION",
    category: ReportCategory.MINISTRY,
    formDefinition: {
      sections: [
        {
          id: "sec-da-001",
          title: "Discipleship Metrics",
          displayOrder: 1,
          fields: [
            {
              id: "f-da-001",
              name: "nameOfCourses",
              label: "Name of Courses",
              type: FormFieldType.TEXTAREA,
              isRequired: true,
              placeholder: "Enter course names (one per line)",
              displayOrder: 1,
            },
            {
              id: "f-da-002",
              name: "numberOfCourses",
              label: "Number of Courses",
              type: FormFieldType.NUMBER,
              isRequired: true,
              minValue: 1,
              displayOrder: 2,
            },
            {
              id: "f-da-003",
              name: "attendance",
              label: "Attendance",
              type: FormFieldType.NUMBER,
              isRequired: true,
              minValue: 0,
              displayOrder: 3,
            },
            {
              id: "f-da-004",
              name: "numberOfPastoralLeaders",
              label: "Number of Pastoral Leaders",
              type: FormFieldType.NUMBER,
              isRequired: true,
              minValue: 0,
              displayOrder: 4,
            },
          ],
        },
      ],
      validationRules: [],
    },
    allowedSubmitterRoles: [
      UserRole.SUPERADMIN,
      UserRole.CAMPUS_ADMIN,
      UserRole.HOD,
    ],
    allowedReviewerRoles: [
      UserRole.SUPERADMIN,
      UserRole.ZONAL_LEADER,
      UserRole.CAMPUS_ADMIN,
    ],
    frequency: ReportFrequency.MONTHLY,
    organizationalLevel: OrganizationalLevel.CAMPUS,
    isActive: true,
    createdAt: getDateString(365),
    updatedAt: getDateString(30),
  },

  // 7. Next Gen Report
  {
    id: "rt-007",
    name: "Next Gen Report",
    description:
      "Weekly report on Next Gen 1 (Kid-Zone) and Next Gen 2 (Stir House) ministries.",
    code: "NEXT_GEN",
    category: ReportCategory.MINISTRY,
    formDefinition: {
      sections: [
        {
          id: "sec-ng-001",
          title: "Next Gen 1 (Kid-Zone)",
          description: "Metrics for the children's ministry.",
          displayOrder: 1,
          fields: [
            {
              id: "f-ng-001",
              name: "kidZoneTotalAttendance",
              label: "Total Attendance",
              type: FormFieldType.NUMBER,
              isRequired: true,
              minValue: 0,
              displayOrder: 1,
            },
            {
              id: "f-ng-002",
              name: "kidZoneFirstTimerAttendance",
              label: "First Timer Attendance",
              type: FormFieldType.NUMBER,
              isRequired: true,
              minValue: 0,
              displayOrder: 2,
            },
            {
              id: "f-ng-003",
              name: "kidZoneAssimilation",
              label: "Assimilation",
              type: FormFieldType.NUMBER,
              isRequired: true,
              minValue: 0,
              displayOrder: 3,
            },
          ],
        },
        {
          id: "sec-ng-002",
          title: "Next Gen 2 (Stir House)",
          description: "Metrics for the youth ministry.",
          displayOrder: 2,
          fields: [
            {
              id: "f-ng-004",
              name: "stirHouseTotalAttendance",
              label: "Total Attendance",
              type: FormFieldType.NUMBER,
              isRequired: true,
              minValue: 0,
              displayOrder: 1,
            },
            {
              id: "f-ng-005",
              name: "stirHouseFirstTimerAttendance",
              label: "First Timer Attendance",
              type: FormFieldType.NUMBER,
              isRequired: true,
              minValue: 0,
              displayOrder: 2,
            },
            {
              id: "f-ng-006",
              name: "stirHouseAssimilation",
              label: "Assimilation",
              type: FormFieldType.NUMBER,
              isRequired: true,
              minValue: 0,
              displayOrder: 3,
            },
          ],
        },
      ],
      validationRules: [],
    },
    allowedSubmitterRoles: [
      UserRole.SUPERADMIN,
      UserRole.CAMPUS_ADMIN,
      UserRole.HOD,
    ],
    allowedReviewerRoles: [
      UserRole.SUPERADMIN,
      UserRole.ZONAL_LEADER,
      UserRole.CAMPUS_ADMIN,
    ],
    frequency: ReportFrequency.WEEKLY,
    organizationalLevel: OrganizationalLevel.CAMPUS,
    isActive: true,
    createdAt: getDateString(365),
    updatedAt: getDateString(30),
  },

  // 8. Partnership Report
  {
    id: "rt-008",
    name: "Partnership Report",
    description: "Monthly report tracking the number of partners.",
    code: "PARTNERSHIP",
    category: ReportCategory.MINISTRY,
    formDefinition: {
      sections: [
        {
          id: "sec-pt-001",
          title: "Partnership Metrics",
          displayOrder: 1,
          fields: [
            {
              id: "f-pt-001",
              name: "numberOfPartners",
              label: "Number of Partners",
              type: FormFieldType.NUMBER,
              isRequired: true,
              minValue: 0,
              displayOrder: 1,
            },
          ],
        },
      ],
      validationRules: [],
    },
    allowedSubmitterRoles: [
      UserRole.SUPERADMIN,
      UserRole.CAMPUS_ADMIN,
      UserRole.HOD,
    ],
    allowedReviewerRoles: [UserRole.SUPERADMIN, UserRole.ZONAL_LEADER],
    frequency: ReportFrequency.MONTHLY,
    organizationalLevel: OrganizationalLevel.CAMPUS,
    isActive: true,
    createdAt: getDateString(365),
    updatedAt: getDateString(30),
  },

  // 9. HAEF Report
  {
    id: "rt-009",
    name: "HAEF Report",
    description:
      "Quarterly report on Harvesters Africa Education Foundation project reach and impact.",
    code: "HAEF",
    category: ReportCategory.SPECIAL,
    formDefinition: {
      sections: [
        {
          id: "sec-haef-001",
          title: "HAEF Metrics",
          displayOrder: 1,
          fields: [
            {
              id: "f-haef-001",
              name: "projectReach",
              label: "Project Reach",
              type: FormFieldType.NUMBER,
              isRequired: true,
              minValue: 0,
              displayOrder: 1,
            },
            {
              id: "f-haef-002",
              name: "projectImpact",
              label: "Project Impact",
              type: FormFieldType.TEXTAREA,
              isRequired: true,
              placeholder: "Describe the impact of the project...",
              displayOrder: 2,
            },
            {
              id: "f-haef-003",
              name: "supportingDocuments",
              label: "Supporting Documents",
              type: FormFieldType.MULTI_FILE_UPLOAD,
              isRequired: false,
              acceptedFileTypes: ["image/jpeg", "image/png", "application/pdf"],
              maxFileSize: 5,
              maxFiles: 10,
              uploadFolder: "reports",
              helpText:
                "Upload supporting documents (PDF or images, max 10 files)",
              displayOrder: 3,
            },
          ],
        },
      ],
      validationRules: [],
    },
    allowedSubmitterRoles: [UserRole.SUPERADMIN, UserRole.CAMPUS_ADMIN],
    allowedReviewerRoles: [UserRole.SUPERADMIN],
    frequency: ReportFrequency.QUARTERLY,
    isActive: true,
    createdAt: getDateString(365),
    updatedAt: getDateString(30),
  },

  // 10. Spiritual Report
  {
    id: "rt-010",
    name: "Spiritual Report",
    description: "Monthly report tracking baptisms.",
    code: "SPIRITUAL",
    category: ReportCategory.MINISTRY,
    formDefinition: {
      sections: [
        {
          id: "sec-spr-001",
          title: "Spiritual Metrics",
          displayOrder: 1,
          fields: [
            {
              id: "f-spr-001",
              name: "numberOfPeopleBaptized",
              label: "Number of People Baptized",
              type: FormFieldType.NUMBER,
              isRequired: true,
              minValue: 0,
              displayOrder: 1,
            },
          ],
        },
      ],
      validationRules: [],
    },
    allowedSubmitterRoles: [
      UserRole.SUPERADMIN,
      UserRole.CAMPUS_ADMIN,
      UserRole.HOD,
    ],
    allowedReviewerRoles: [UserRole.SUPERADMIN, UserRole.ZONAL_LEADER],
    frequency: ReportFrequency.MONTHLY,
    organizationalLevel: OrganizationalLevel.CAMPUS,
    isActive: true,
    createdAt: getDateString(365),
    updatedAt: getDateString(30),
  },

  // 11. Relationship Breakthrough Report
  {
    id: "rt-011",
    name: "Relationship Breakthrough Report",
    description:
      "Monthly report on marriages, baby dedications, and testimonies.",
    code: "RELATIONSHIP_BREAKTHROUGH",
    category: ReportCategory.MINISTRY,
    formDefinition: {
      sections: [
        {
          id: "sec-rb-001",
          title: "Relationship Breakthrough Metrics",
          displayOrder: 1,
          fields: [
            {
              id: "f-rb-001",
              name: "marriagesConducted",
              label: "Number of Marriages Conducted",
              type: FormFieldType.NUMBER,
              isRequired: true,
              minValue: 0,
              displayOrder: 1,
            },
            {
              id: "f-rb-002",
              name: "babiesDedicated",
              label: "Number of Babies Dedicated",
              type: FormFieldType.NUMBER,
              isRequired: true,
              minValue: 0,
              displayOrder: 2,
            },
            {
              id: "f-rb-003",
              name: "testimoniesCaptured",
              label: "Number of Testimonies Captured",
              type: FormFieldType.NUMBER,
              isRequired: true,
              minValue: 0,
              displayOrder: 3,
            },
            {
              id: "f-rb-004",
              name: "evidencePhotos",
              label: "Evidence Photos",
              type: FormFieldType.MULTI_FILE_UPLOAD,
              isRequired: false,
              acceptedFileTypes: ["image/jpeg", "image/png", "image/webp"],
              maxFileSize: 5,
              maxFiles: 20,
              uploadFolder: "reports",
              helpText: "Upload photos of events (max 20 images)",
              displayOrder: 4,
            },
          ],
        },
      ],
      validationRules: [],
    },
    allowedSubmitterRoles: [
      UserRole.SUPERADMIN,
      UserRole.CAMPUS_ADMIN,
      UserRole.HOD,
    ],
    allowedReviewerRoles: [
      UserRole.SUPERADMIN,
      UserRole.ZONAL_LEADER,
      UserRole.CAMPUS_ADMIN,
    ],
    frequency: ReportFrequency.MONTHLY,
    organizationalLevel: OrganizationalLevel.CAMPUS,
    isActive: true,
    createdAt: getDateString(365),
    updatedAt: getDateString(30),
  },
];

// ============================================================================
// MOCK STRATEGIC INDICATORS
// ============================================================================

export const mockStrategicIndicators: StrategicIndicator[] = [
  {
    id: "si-001",
    name: "Membership Growth",
    description: "Track overall membership growth and retention.",
    category: StrategicIndicatorCategory.MEMBERSHIP,
    isActive: true,
    displayOrder: 1,
    applicableRoles: [UserRole.SUPERADMIN, UserRole.CAMPUS_ADMIN],
    campusLevel: true,
    groupLevel: false,
    createdAt: getDateString(365),
    updatedAt: getDateString(30),
  },
  {
    id: "si-002",
    name: "Attendance Performance",
    description: "Track Sunday and midweek attendance trends.",
    category: StrategicIndicatorCategory.ATTENDANCE,
    isActive: true,
    displayOrder: 2,
    applicableRoles: [UserRole.SUPERADMIN, UserRole.CAMPUS_ADMIN, UserRole.HOD],
    campusLevel: true,
    groupLevel: true,
    createdAt: getDateString(365),
    updatedAt: getDateString(30),
  },
  {
    id: "si-003",
    name: "Outreach & Evangelism",
    description: "Track evangelism efforts and salvations.",
    category: StrategicIndicatorCategory.OUTREACH,
    isActive: true,
    displayOrder: 3,
    applicableRoles: [UserRole.SUPERADMIN, UserRole.CAMPUS_ADMIN],
    campusLevel: true,
    groupLevel: false,
    createdAt: getDateString(365),
    updatedAt: getDateString(30),
  },
  {
    id: "si-004",
    name: "Programs & Discipleship",
    description:
      "Track discipleship programs, courses, and leadership development.",
    category: StrategicIndicatorCategory.PROGRAMS,
    isActive: true,
    displayOrder: 4,
    applicableRoles: [UserRole.SUPERADMIN, UserRole.CAMPUS_ADMIN],
    campusLevel: true,
    groupLevel: false,
    createdAt: getDateString(365),
    updatedAt: getDateString(30),
  },
];

// ============================================================================
// MOCK KEY METRICS
// ============================================================================

export const mockKeyMetrics: KeyMetric[] = [
  {
    id: "km-001",
    strategicIndicatorId: "si-001",
    name: "New Members Added",
    description: "Number of new members who joined this period.",
    dataType: MetricDataType.NUMBER,
    unit: "people",
    isRequired: true,
    minValue: 0,
    allowNegative: false,
    autoCalculate: false,
    displayOrder: 1,
    isActive: true,
    createdAt: getDateString(365),
    updatedAt: getDateString(30),
  },
  {
    id: "km-002",
    strategicIndicatorId: "si-001",
    name: "First Timers",
    description: "Number of first-time visitors.",
    dataType: MetricDataType.NUMBER,
    unit: "people",
    isRequired: true,
    minValue: 0,
    allowNegative: false,
    autoCalculate: false,
    displayOrder: 2,
    isActive: true,
    createdAt: getDateString(365),
    updatedAt: getDateString(30),
  },
  {
    id: "km-003",
    strategicIndicatorId: "si-002",
    name: "Sunday Service Attendance",
    description: "Total Sunday attendance count.",
    dataType: MetricDataType.NUMBER,
    unit: "people",
    isRequired: true,
    minValue: 0,
    allowNegative: false,
    autoCalculate: false,
    displayOrder: 1,
    isActive: true,
    createdAt: getDateString(365),
    updatedAt: getDateString(30),
  },
  {
    id: "km-004",
    strategicIndicatorId: "si-002",
    name: "Midweek Service Attendance",
    description: "Total midweek service attendance.",
    dataType: MetricDataType.NUMBER,
    unit: "people",
    isRequired: true,
    minValue: 0,
    allowNegative: false,
    autoCalculate: false,
    displayOrder: 2,
    isActive: true,
    createdAt: getDateString(365),
    updatedAt: getDateString(30),
  },
  {
    id: "km-005",
    strategicIndicatorId: "si-003",
    name: "Salvations",
    description: "Total salvations recorded.",
    dataType: MetricDataType.NUMBER,
    unit: "people",
    isRequired: true,
    minValue: 0,
    allowNegative: false,
    autoCalculate: false,
    displayOrder: 1,
    isActive: true,
    createdAt: getDateString(365),
    updatedAt: getDateString(30),
  },
  {
    id: "km-006",
    strategicIndicatorId: "si-004",
    name: "Discipleship Course Attendance",
    description: "Total attendance in discipleship courses.",
    dataType: MetricDataType.NUMBER,
    unit: "people",
    isRequired: true,
    minValue: 0,
    allowNegative: false,
    autoCalculate: false,
    displayOrder: 1,
    isActive: true,
    createdAt: getDateString(365),
    updatedAt: getDateString(30),
  },
];

// ============================================================================
// MOCK REPORT SUBMISSIONS (Comprehensive - ~50 submissions across report types)
// ============================================================================

const CAMPUS_IDS = [
  "campus-lagos-lekki",
  "campus-lagos-gbagada",
  "campus-london",
];
const SUBMITTER_IDS = [
  "user-campus-admin-1",
  "user-campus-admin-2",
  "user-hod-1",
];
const STATUSES: ReportStatus[] = [
  ReportStatus.DRAFT,
  ReportStatus.SUBMITTED,
  ReportStatus.APPROVED,
  ReportStatus.REVIEWED,
  ReportStatus.FINALIZED,
  ReportStatus.REQUIRES_EDITS,
];

function generateAttendanceQualityData(): Record<string, unknown> {
  return {
    sundayAttendance: Math.floor(Math.random() * 800) + 200,
    firstTimerAttendance: Math.floor(Math.random() * 50) + 5,
    workersAttendance: Math.floor(Math.random() * 100) + 30,
    midweekAttendance: Math.floor(Math.random() * 400) + 100,
    sound: QUALITY_OPTIONS[Math.floor(Math.random() * 4)].value,
    light: QUALITY_OPTIONS[Math.floor(Math.random() * 4)].value,
    staging: QUALITY_OPTIONS[Math.floor(Math.random() * 4)].value,
    music: QUALITY_OPTIONS[Math.floor(Math.random() * 4)].value,
    parkingSpace: QUALITY_OPTIONS[Math.floor(Math.random() * 4)].value,
    greeters: QUALITY_OPTIONS[Math.floor(Math.random() * 4)].value,
    ushersAndProtocol: QUALITY_OPTIONS[Math.floor(Math.random() * 4)].value,
  };
}

function generateSalvationData(): Record<string, unknown> {
  return {
    salvationInCellOutreach: Math.floor(Math.random() * 20) + 1,
    salvationInChurch: Math.floor(Math.random() * 30) + 2,
  };
}

function generateSmallGroupCellData(): Record<string, unknown> {
  return {
    numberOfCells: Math.floor(Math.random() * 30) + 5,
    numberOfLeaders: Math.floor(Math.random() * 20) + 5,
    numberOfAssistantLeaders: Math.floor(Math.random() * 15) + 3,
    attendance: Math.floor(Math.random() * 200) + 50,
  };
}

function generateNextGenData(): Record<string, unknown> {
  return {
    kidZoneTotalAttendance: Math.floor(Math.random() * 100) + 20,
    kidZoneFirstTimerAttendance: Math.floor(Math.random() * 15) + 1,
    kidZoneAssimilation: Math.floor(Math.random() * 10) + 1,
    stirHouseTotalAttendance: Math.floor(Math.random() * 80) + 15,
    stirHouseFirstTimerAttendance: Math.floor(Math.random() * 10) + 1,
    stirHouseAssimilation: Math.floor(Math.random() * 8) + 1,
  };
}

function generateSpecialProgramData(): Record<string, unknown> {
  return {
    churchPlantings: Math.floor(Math.random() * 5) + 1,
    churchPlanters: Math.floor(Math.random() * 20) + 5,
    churchPlantersSmallGroup: Math.floor(Math.random() * 10) + 2,
    reach: Math.floor(Math.random() * 5000) + 500,
    distribution: Math.floor(Math.random() * 3000) + 200,
    volunteers: Math.floor(Math.random() * 100) + 20,
    registration: Math.floor(Math.random() * 500) + 50,
    attendance: Math.floor(Math.random() * 2000) + 200,
    salvation: Math.floor(Math.random() * 50) + 5,
    assimilation: Math.floor(Math.random() * 30) + 5,
    nextStep: Math.floor(Math.random() * 40) + 5,
    workersAttendance: Math.floor(Math.random() * 80) + 20,
    firstTimers: Math.floor(Math.random() * 100) + 10,
  };
}

function generateDiscipleshipData(): Record<string, unknown> {
  const courses = [
    "Believers' Class",
    "Workers Training",
    "Leadership Academy",
    "Marriage Course",
  ];
  const selectedCourses = courses.slice(0, Math.floor(Math.random() * 3) + 1);
  return {
    nameOfCourses: selectedCourses.join("\n"),
    numberOfCourses: selectedCourses.length,
    attendance: Math.floor(Math.random() * 100) + 20,
    numberOfPastoralLeaders: Math.floor(Math.random() * 10) + 2,
  };
}

function generatePartnershipData(): Record<string, unknown> {
  return {
    numberOfPartners: Math.floor(Math.random() * 200) + 50,
  };
}

function generateSpiritualData(): Record<string, unknown> {
  return {
    numberOfPeopleBaptized: Math.floor(Math.random() * 30) + 1,
  };
}

function generateRelationshipBreakthroughData(): Record<string, unknown> {
  return {
    marriagesConducted: Math.floor(Math.random() * 5),
    babiesDedicated: Math.floor(Math.random() * 8) + 1,
    testimoniesCaptured: Math.floor(Math.random() * 15) + 2,
  };
}

function generateHaefData(): Record<string, unknown> {
  return {
    projectReach: Math.floor(Math.random() * 1000) + 100,
    projectImpact:
      "Provided educational materials and support to underprivileged communities. Students showed 40% improvement in academic performance.",
  };
}

function generateNlpData(): Record<string, unknown> {
  return {
    nlpPeakAttendance: Math.floor(Math.random() * 500) + 100,
  };
}

// Data generators mapped to report type codes
const DATA_GENERATORS: Record<string, () => Record<string, unknown>> = {
  GROUP_SPECIAL_PROGRAM: generateSpecialProgramData,
  ATTENDANCE_QUALITY: generateAttendanceQualityData,
  NLP_REPORT: generateNlpData,
  SALVATION_REPORT: generateSalvationData,
  SMALL_GROUP_CELL: generateSmallGroupCellData,
  DISCIPLESHIP_ASSIMILATION: generateDiscipleshipData,
  NEXT_GEN: generateNextGenData,
  PARTNERSHIP: generatePartnershipData,
  HAEF: generateHaefData,
  SPIRITUAL: generateSpiritualData,
  RELATIONSHIP_BREAKTHROUGH: generateRelationshipBreakthroughData,
};

// Generate report submissions programmatically
function generateReportSubmissions(): ReportSubmission[] {
  const submissions: ReportSubmission[] = [];
  let counter = 1;
  const now = new Date();

  for (const reportType of mockReportTypes) {
    const generator = DATA_GENERATORS[reportType.code];
    if (!generator) continue;

    // Generate submissions for the last 12 weeks for weekly, 6 months for monthly, 2 quarters for quarterly
    let periods: number;
    switch (reportType.frequency) {
      case ReportFrequency.WEEKLY:
        periods = 12;
        break;
      case ReportFrequency.MONTHLY:
        periods = 6;
        break;
      case ReportFrequency.QUARTERLY:
        periods = 2;
        break;
      default:
        periods = 3;
        break;
    }

    for (let p = 0; p < periods; p++) {
      for (let c = 0; c < CAMPUS_IDS.length; c++) {
        const campusId = CAMPUS_IDS[c];
        const submitterId = SUBMITTER_IDS[c % SUBMITTER_IDS.length];
        const statusIdx = Math.floor(Math.random() * STATUSES.length);
        const status = STATUSES[statusIdx];

        let daysAgo: number;
        let reportMonth: number;
        let reportWeek: number | undefined;
        let periodStart: Date;
        let periodEnd: Date;

        if (reportType.frequency === ReportFrequency.WEEKLY) {
          daysAgo = p * 7;
          const reportDate = new Date(now.getTime() - daysAgo * 86400000);
          reportMonth = reportDate.getMonth() + 1;
          reportWeek = getWeekNumber(reportDate);
          periodStart = new Date(reportDate.getTime() - 6 * 86400000);
          periodEnd = reportDate;
        } else if (reportType.frequency === ReportFrequency.MONTHLY) {
          daysAgo = p * 30;
          const reportDate = new Date(now.getTime() - daysAgo * 86400000);
          reportMonth = reportDate.getMonth() + 1;
          periodStart = new Date(
            reportDate.getFullYear(),
            reportDate.getMonth(),
            1
          );
          periodEnd = new Date(
            reportDate.getFullYear(),
            reportDate.getMonth() + 1,
            0
          );
        } else if (reportType.frequency === ReportFrequency.QUARTERLY) {
          daysAgo = p * 90;
          const reportDate = new Date(now.getTime() - daysAgo * 86400000);
          reportMonth = reportDate.getMonth() + 1;
          const quarterStart = Math.floor(reportDate.getMonth() / 3) * 3;
          periodStart = new Date(reportDate.getFullYear(), quarterStart, 1);
          periodEnd = new Date(reportDate.getFullYear(), quarterStart + 3, 0);
        } else {
          daysAgo = p * 14 + Math.floor(Math.random() * 10);
          const reportDate = new Date(now.getTime() - daysAgo * 86400000);
          reportMonth = reportDate.getMonth() + 1;
          periodStart = new Date(reportDate.getTime() - 7 * 86400000);
          periodEnd = reportDate;
        }

        const reportDate = new Date(now.getTime() - daysAgo * 86400000);
        const isSubmitted = status !== ReportStatus.DRAFT;
        const isApproved = [
          ReportStatus.APPROVED,
          ReportStatus.REVIEWED,
          ReportStatus.FINALIZED,
        ].includes(status);
        const isFinalized = status === ReportStatus.FINALIZED;

        const submission: ReportSubmission = {
          id: `rs-${String(counter).padStart(4, "0")}`,
          reportTypeId: reportType.id,
          reportYear: reportDate.getFullYear(),
          reportMonth,
          reportWeek,
          periodStartDate: periodStart!.toISOString(),
          periodEndDate: periodEnd!.toISOString(),
          submittedById: submitterId,
          submitterRole: UserRole.CAMPUS_ADMIN,
          organizationalLevelType: OrganizationalLevel.CAMPUS,
          organizationalUnitId: campusId,
          formData: generator(),
          status,
          submittedAt: isSubmitted ? getDateString(daysAgo - 1) : undefined,
          reviewedById: isApproved ? "user-zonal-leader-1" : undefined,
          reviewedAt: isApproved ? getDateString(daysAgo - 2) : undefined,
          reviewerNotes: isApproved
            ? "Looks good. Numbers are consistent with trends."
            : undefined,
          approvedById: isApproved ? "user-zonal-leader-1" : undefined,
          approvedAt: isApproved ? getDateString(daysAgo - 2) : undefined,
          approverNotes: isApproved ? "Approved." : undefined,
          finalReviewedById: isFinalized ? "user-superadmin" : undefined,
          finalReviewedAt: isFinalized ? getDateString(daysAgo - 3) : undefined,
          finalReviewerRole: isFinalized ? UserRole.SUPERADMIN : undefined,
          lastEditedAt: getDateString(daysAgo),
          isLocked: isApproved,
          createdAt: getDateString(daysAgo + 1),
          updatedAt: getDateString(daysAgo),
        };

        submissions.push(submission);
        counter++;
      }
    }
  }

  return submissions;
}

export const mockReportSubmissions: ReportSubmission[] =
  generateReportSubmissions();

// ============================================================================
// MOCK METRIC ENTRIES
// ============================================================================

export const mockMetricEntries: MetricEntry[] = [
  {
    id: "me-001",
    reportSubmissionId: "rs-0001",
    keyMetricId: "km-001",
    strategicIndicatorId: "si-001",
    monthlyGoal: 50,
    monthlyAchieved: 42,
    yearOnYearGoal: 600,
    performancePercentage: 84,
    variance: -8,
    monthlyGoalLocked: true,
    monthlyAchievedLocked: false,
    yearOnYearGoalLocked: true,
    lastSavedAt: getDateString(0),
    createdAt: getDateString(7),
    updatedAt: getDateString(0),
  },
  {
    id: "me-002",
    reportSubmissionId: "rs-0001",
    keyMetricId: "km-002",
    strategicIndicatorId: "si-001",
    monthlyGoal: 30,
    monthlyAchieved: 35,
    yearOnYearGoal: 360,
    performancePercentage: 117,
    variance: 5,
    monthlyGoalLocked: true,
    monthlyAchievedLocked: false,
    yearOnYearGoalLocked: true,
    lastSavedAt: getDateString(0),
    createdAt: getDateString(7),
    updatedAt: getDateString(0),
  },
  {
    id: "me-003",
    reportSubmissionId: "rs-0001",
    keyMetricId: "km-003",
    strategicIndicatorId: "si-002",
    monthlyGoal: 500,
    monthlyAchieved: 450,
    yearOnYearGoal: 6000,
    performancePercentage: 90,
    variance: -50,
    monthlyGoalLocked: true,
    monthlyAchievedLocked: false,
    yearOnYearGoalLocked: true,
    lastSavedAt: getDateString(0),
    createdAt: getDateString(7),
    updatedAt: getDateString(0),
  },
  {
    id: "me-004",
    reportSubmissionId: "rs-0001",
    keyMetricId: "km-004",
    strategicIndicatorId: "si-002",
    monthlyGoal: 250,
    monthlyAchieved: 200,
    yearOnYearGoal: 3000,
    performancePercentage: 80,
    variance: -50,
    monthlyGoalLocked: true,
    monthlyAchievedLocked: false,
    yearOnYearGoalLocked: true,
    lastSavedAt: getDateString(0),
    createdAt: getDateString(7),
    updatedAt: getDateString(0),
  },
];

// ============================================================================
// MOCK REPORT COMMENTS
// ============================================================================

export const mockReportComments: ReportComment[] = [
  {
    id: "rc-001",
    reportSubmissionId: "rs-0001",
    userId: "user-zonal-leader-1",
    userRole: UserRole.ZONAL_LEADER,
    commentType: ReportCommentType.FEEDBACK,
    content:
      "Great improvement in first timer attendance this week. Keep up the momentum with follow-up calls.",
    isInternal: false,
    createdAt: getDateString(5),
    updatedAt: getDateString(5),
  },
  {
    id: "rc-002",
    reportSubmissionId: "rs-0004",
    userId: "user-zonal-leader-1",
    userRole: UserRole.ZONAL_LEADER,
    commentType: ReportCommentType.REQUEST_EDIT,
    content:
      "Midweek attendance numbers seem lower than expected. Please verify and provide additional context.",
    isInternal: false,
    createdAt: getDateString(3),
    updatedAt: getDateString(3),
  },
  {
    id: "rc-003",
    reportSubmissionId: "rs-0004",
    userId: "user-campus-admin-1",
    userRole: UserRole.CAMPUS_ADMIN,
    commentType: ReportCommentType.CLARIFICATION,
    content:
      "The midweek service was affected by a public holiday — adjusted numbers reflect actual attendance.",
    isInternal: false,
    createdAt: getDateString(2),
    updatedAt: getDateString(2),
  },
  {
    id: "rc-004",
    reportSubmissionId: "rs-0007",
    userId: "user-superadmin",
    userRole: UserRole.SUPERADMIN,
    commentType: ReportCommentType.APPROVAL_NOTE,
    content:
      "Excellent program outcomes. The church planting numbers are ahead of our annual target.",
    isInternal: false,
    createdAt: getDateString(1),
    updatedAt: getDateString(1),
  },
];

// ============================================================================
// MOCK REFERRAL LINKS
// ============================================================================

export const mockReferralLinks: ReferralLink[] = [
  {
    id: "rl-001",
    code: "REF-LEKKI-HOD1",
    createdById: "user-campus-admin-1",
    createdByRole: UserRole.CAMPUS_ADMIN,
    assignedRole: UserRole.HOD,
    organizationalLevelType: OrganizationalLevel.CAMPUS,
    organizationalUnitId: "campus-lagos-lekki",
    isUsed: false,
    isActive: true,
    expiresAt: getDateString(-30),
    createdAt: getDateString(10),
    updatedAt: getDateString(10),
  },
  {
    id: "rl-002",
    code: "REF-GBG-LEADER1",
    createdById: "user-campus-admin-2",
    createdByRole: UserRole.CAMPUS_ADMIN,
    assignedRole: UserRole.SMALL_GROUP_LEADER,
    organizationalLevelType: OrganizationalLevel.CAMPUS,
    organizationalUnitId: "campus-lagos-gbagada",
    isUsed: true,
    usedById: "user-sgl-1",
    usedAt: getDateString(5),
    isActive: true,
    createdAt: getDateString(15),
    updatedAt: getDateString(5),
  },
  {
    id: "rl-003",
    code: "REF-ZONE-ADMIN",
    createdById: "user-superadmin",
    createdByRole: UserRole.SUPERADMIN,
    assignedRole: UserRole.CAMPUS_ADMIN,
    organizationalLevelType: OrganizationalLevel.ZONE,
    organizationalUnitId: "zone-lagos",
    isUsed: false,
    isActive: true,
    expiresAt: getDateString(-60),
    createdAt: getDateString(5),
    updatedAt: getDateString(5),
  },
];

// ============================================================================
// MOCK REPORT NOTIFICATIONS
// ============================================================================

export const mockReportNotifications: ReportNotification[] = [
  {
    id: "rn-001",
    userId: "user-zonal-leader-1",
    reportSubmissionId: "rs-0001",
    notificationType: ReportNotificationKind.REPORT_SUBMITTED,
    title: "New Report Submitted",
    message:
      "A new Attendance & Quality report has been submitted by Lekki Campus for review.",
    isRead: false,
    emailSent: true,
    emailSentAt: getDateString(1),
    createdAt: getDateString(1),
  },
  {
    id: "rn-002",
    userId: "user-campus-admin-1",
    reportSubmissionId: "rs-0004",
    notificationType: ReportNotificationKind.EDITS_REQUESTED,
    title: "Report Edits Required",
    message:
      "Your Attendance report requires edits. Please review the feedback and resubmit.",
    isRead: true,
    readAt: getDateString(2),
    emailSent: true,
    emailSentAt: getDateString(3),
    createdAt: getDateString(3),
  },
  {
    id: "rn-003",
    userId: "user-campus-admin-2",
    reportSubmissionId: "rs-0007",
    notificationType: ReportNotificationKind.REPORT_APPROVED,
    title: "Report Approved",
    message: "Your Group Special Program report has been approved.",
    isRead: false,
    emailSent: true,
    emailSentAt: getDateString(0),
    createdAt: getDateString(0),
  },
  {
    id: "rn-004",
    userId: "user-campus-admin-1",
    reportSubmissionId: "rs-0010",
    notificationType: ReportNotificationKind.DEADLINE_APPROACHING,
    title: "Report Deadline in 24 Hours",
    message: "Reminder: Your weekly Salvation Report is due tomorrow.",
    isRead: false,
    emailSent: true,
    emailSentAt: getDateString(0),
    createdAt: getDateString(0),
  },
];
