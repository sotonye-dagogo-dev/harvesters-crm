# GitHub Copilot Instructions for Harvesters Small Groups CRM

## Project Overview

Harvesters Small Groups CRM is a centralized, data-driven web application that enables Harvesters International Christian Centre to effectively manage small group meetings, track member engagement, and support pastoral care through structured insights, accountability, and informed decision-making. Built for Harvesters' vision of changing lives by pioneering thriving churches across Nigeria, the United Kingdom, and the United States of America.

## Note

- Make sure to follow the coding standards and architectural guidelines outlined in the project documentation.
- Make use of plan and project context files for reference. Provide as close to production-ready code as possible.
- Leave nothing unimplemented but with flexibility and consideration of scalability.
- Store any summary files in the '.github/summaries' directory for organization.
- When an error/issue is encountered, find and fix all instances of that error/issue throughout the entire codebase.

## Tech Stack

- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + Ant Design (antd)
- **State Management**: React Context API
- **API**: Mock backend (TypeScript-based, migration-ready)
- **Authentication**: JWT tokens with httpOnly cookies
- **Database (Future)**: PostgreSQL with Prisma ORM
- **Caching (Future)**: Redis
- **File Storage (Future)**: Cloudinary

## Code Style Guidelines

### TypeScript (Strict Compliance)

**CRITICAL REQUIREMENTS:**
- Use strict TypeScript settings (strict: true in tsconfig.json)
- **ZERO tolerance for `any` type** - always use proper types/interfaces
- **ZERO tolerance for type assertions (`as`)** - fix the root type instead
- Enable all strict checks: noImplicitAny, strictNullChecks, strictFunctionTypes, strictBindCallApply
- Use type inference where appropriate but be explicit for function returns
- Prefer `interface` over `type` for object shapes (better error messages)
- Use proper generics for reusable components
- Apart from component interfaces, globally define all types and interfaces in `lib/types.ts` file
- No need to manually import custom types and interfaces in files, as they are already included in `tsconfig.json`
- Use `satisfies` operator for type validation without widening
- Always handle null/undefined cases explicitly
- Use discriminated unions for variant types
- Avoid non-null assertions (!) except when absolutely certain

**Type Safety Examples:**
```typescript
// ✅ GOOD: Explicit typing with null handling
interface User {
  id: string;
  name: string;
  email: string | null;
}

function getUser(id: string): User | null {
  const user = db.users.find(u => u.id === id);
  return user ?? null;
}

const user = getUser('123');
if (user) {
  console.log(user.name); // Safe access
}

// ❌ BAD: Using any
function getBadUser(id: string): any { // NEVER DO THIS
  return db.users.find(u => u.id === id);
}

// ❌ BAD: Type assertion
const badUser = getUser('123') as User; // NEVER DO THIS

// ✅ GOOD: Discriminated union
type ApiResponse<T> = 
  | { success: true; data: T }
  | { success: false; error: string };

function handleResponse<T>(response: ApiResponse<T>) {
  if (response.success) {
    return response.data; // TypeScript knows data exists
  } else {
    throw new Error(response.error); // TypeScript knows error exists
  }
}
```

### React/Next.js

- Use App Router exclusively (not Pages Router)
- Prefer Server Components by default
- Mark Client Components with `'use client'` directive only when needed
- Use proper loading.tsx, error.tsx, and not-found.tsx patterns
- Implement proper metadata exports
- Use Server Actions for mutations

### Styling

- Use Tailwind CSS utility classes expertly for layout and custom styles
- Reduce vanilla CSS to absolute bare minimum by using '[]' in tailwind classes when needed and @apply directive in global CSS
- Use Ant Design components for common UI elements
- Combine Tailwind and Ant Design styles as needed
- Mobile-first responsive design
- Ensure dark mode support

### SEO

- Optimize metadata for SEO
- Implement Open Graph tags for social sharing
- Generate a sitemap

### PWA Features

- Implement service workers for offline support
- Ensure the app is installable on devices
- Set up push notifications for meeting reminders and updates

### Component Structure

```typescript
// Example structure
interface ComponentProps {
  // Props definition
}

export function ComponentName({ prop }: ComponentProps) {
  // Component logic
}
```

### File Naming

- Components: PascalCase (e.g., `GroupCard.tsx`)
- Utilities: camelCase (e.g., `formatDate.ts`)
- API routes: lowercase with hyphens (e.g., `group-members`)

### Ant Design Usage

- Import components from 'antd'
- Use Ant Design theme configuration
- Combine with Tailwind for custom styling
- Use Ant Design icons from '@ant-design/icons'
- Leverage Ant Design's Form, Table, Modal, and DatePicker components

### API Patterns

- Use Server Actions for mutations
- Use async Server Components for data fetching
- Mock data structure should match production API shape
- Handle loading and error states properly
- Implement proper error handling and user feedback

## Production-Ready Code Standards

### CRITICAL: Code Quality Requirements

**ZERO TOLERANCE POLICY:**
- ❌ No `any` types
- ❌ No ignored TypeScript errors (@ts-ignore, @ts-expect-error)
- ❌ No console.log in production code (use proper logging)
- ❌ No TODO comments without accompanying GitHub issue references
- ❌ No unused imports or variables
- ❌ No magic numbers or hardcoded strings (use constants)
- ❌ No deeply nested code (max 3 levels of nesting)
- ❌ No functions longer than 50 lines (refactor into smaller functions)
- ❌ No duplicate code (DRY principle)
- ❌ No unhandled promise rejections

### Modularity & Reusability

**Component Design Principles:**

1. **Single Responsibility**: Each component/function does ONE thing well
2. **Composability**: Components should be composable and reusable
3. **Dependency Injection**: Pass dependencies as props/params, not hardcode
4. **Interface Segregation**: Components only receive props they actually use
5. **Open/Closed**: Open for extension, closed for modification

```typescript
// ✅ GOOD: Modular, reusable, single responsibility
interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  onRowClick?: (row: T) => void;
  loading?: boolean;
  emptyMessage?: string;
}

export function DataTable<T>({
  data,
  columns,
  onRowClick,
  loading = false,
  emptyMessage = 'No data available'
}: DataTableProps<T>) {
  if (loading) return <LoadingSkeleton />;
  if (data.length === 0) return <EmptyState message={emptyMessage} />;
  
  return (
    <Table>
      {/* Render table */}
    </Table>
  );
}

// ❌ BAD: Hardcoded, not reusable, multiple responsibilities
function UserTableWithEverything() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetch('/api/users').then(/*...*/);
  }, []);
  
  // Mixing data fetching, rendering, business logic - NOT MODULAR
  return <table>{/* ... */}</table>;
}

// ✅ GOOD: Separation of concerns
function UserTable() {
  const { users, loading } = useUsers(); // Data fetching hook
  const columns = useUserTableColumns(); // Column config
  
  return (
    <DataTable
      data={users}
      columns={columns}
      loading={loading}
      emptyMessage="No users found"
    />
  );
}
```

**Utility Function Patterns:**

```typescript
// ✅ GOOD: Pure, testable, reusable
export function formatCurrency(
  amount: number,
  currency: string = 'NGN'
): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency
  }).format(amount);
}

export function calculatePercentage(
  achieved: number,
  goal: number
): number {
  if (goal === 0) return 0;
  return Math.round((achieved / goal) * 100 * 10) / 10; // Round to 1 decimal
}

// ❌ BAD: Side effects, not testable
function badFormatCurrency(amount: number) {
  const formatted = '$' + amount; // Hardcoded, inflexible
  console.log('Formatting:', formatted); // Side effect
  localStorage.setItem('lastFormatted', formatted); // Side effect
  return formatted;
}
```

### ACID Properties in API/Backend

**CRITICAL: All database operations must maintain ACID guarantees**

#### Atomicity
All-or-nothing operations - if one part fails, entire operation rolls back.

```typescript
// ✅ GOOD: Atomic transaction
export async function createReportWithMetrics(
  reportData: CreateReportInput,
  metricEntries: CreateMetricEntryInput[]
) {
  return await prisma.$transaction(async (tx) => {
    // Create report
    const report = await tx.reportSubmission.create({
      data: reportData
    });
    
    // Create all metric entries
    const metrics = await tx.metricEntry.createMany({
      data: metricEntries.map(entry => ({
        ...entry,
        reportSubmissionId: report.id
      }))
    });
    
    // Create audit log
    await tx.auditLog.create({
      data: {
        action: 'REPORT_CREATED',
        userId: reportData.submittedById,
        resourceId: report.id
      }
    });
    
    return { report, metrics };
  });
  
  // If ANY operation fails, ALL are rolled back
}

// ❌ BAD: Non-atomic, can leave partial data
async function badCreateReport(reportData: any, metrics: any[]) {
  const report = await prisma.reportSubmission.create({ data: reportData });
  // If this fails, report is created but metrics aren't - INCONSISTENT STATE
  await prisma.metricEntry.createMany({ data: metrics });
}
```

#### Consistency
Database remains in valid state before and after transaction.

```typescript
// ✅ GOOD: Validates constraints
export async function transferMember(
  memberId: string,
  fromGroupId: string,
  toGroupId: string
) {
  return await prisma.$transaction(async (tx) => {
    // Verify member exists and belongs to fromGroup
    const member = await tx.user.findFirst({
      where: { id: memberId, groupId: fromGroupId }
    });
    
    if (!member) {
      throw new Error('Member not found in source group');
    }
    
    // Verify target group exists and has capacity
    const toGroup = await tx.group.findUnique({
      where: { id: toGroupId },
      include: { _count: { select: { members: true } } }
    });
    
    if (!toGroup) {
      throw new Error('Target group not found');
    }
    
    if (toGroup._count.members >= 20) {
      throw new Error('Target group is at capacity');
    }
    
    // Execute transfer
    await tx.user.update({
      where: { id: memberId },
      data: { groupId: toGroupId }
    });
    
    return member;
  });
}
```

#### Isolation
Concurrent transactions don't interfere with each other.

```typescript
// ✅ GOOD: Proper isolation with row locking
export async function incrementAttendanceCount(meetingId: string) {
  return await prisma.$transaction(async (tx) => {
    // Lock the row to prevent concurrent updates
    const meeting = await tx.meeting.findUnique({
      where: { id: meetingId }
    });
    
    if (!meeting) throw new Error('Meeting not found');
    
    // Update with current value + 1
    return await tx.meeting.update({
      where: { id: meetingId },
      data: { attendeeCount: meeting.attendeeCount + 1 }
    });
  });
}

// ❌ BAD: Race condition
async function badIncrementCount(meetingId: string) {
  const meeting = await prisma.meeting.findUnique({ where: { id: meetingId } });
  // Another request might read same value here - RACE CONDITION
  await prisma.meeting.update({
    where: { id: meetingId },
    data: { attendeeCount: meeting!.attendeeCount + 1 }
  });
}
```

#### Durability
Committed data persists even after system failure.

```typescript
// ✅ GOOD: Ensure data is committed before returning success
export async function submitReport(reportId: string) {
  const updated = await prisma.reportSubmission.update({
    where: { id: reportId },
    data: {
      status: 'SUBMITTED',
      submittedAt: new Date()
    }
  });
  
  // Invalidate cache AFTER database commit
  await cache.del(`report:${reportId}`);
  
  // Send notification AFTER database commit
  await sendNotification(updated.submittedById, 'REPORT_SUBMITTED');
  
  return updated;
}
```

### Error Handling & Resilience

**CRITICAL: All errors must be handled gracefully**

```typescript
// ✅ GOOD: Comprehensive error handling
export async function createMeeting(
  data: CreateMeetingInput
): Promise<ApiResponse<Meeting>> {
  try {
    // Input validation
    const validated = createMeetingSchema.parse(data);
    
    // Business logic validation
    const group = await prisma.group.findUnique({
      where: { id: validated.groupId }
    });
    
    if (!group) {
      return {
        success: false,
        error: 'Group not found',
        code: 'GROUP_NOT_FOUND'
      };
    }
    
    // Create meeting
    const meeting = await prisma.meeting.create({
      data: validated
    });
    
    // Success response
    return {
      success: true,
      data: meeting
    };
    
  } catch (error) {
    // Log error with context
    logger.error('Failed to create meeting', {
      error,
      data,
      userId: data.createdById
    });
    
    // Handle specific error types
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return {
          success: false,
          error: 'Meeting already exists for this date',
          code: 'DUPLICATE_MEETING'
        };
      }
    }
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Invalid input data',
        code: 'VALIDATION_ERROR',
        details: error.errors
      };
    }
    
    // Generic error response (don't expose internals)
    return {
      success: false,
      error: 'Failed to create meeting. Please try again.',
      code: 'INTERNAL_ERROR'
    };
  }
}

// ❌ BAD: No error handling
async function badCreateMeeting(data: any) {
  const meeting = await prisma.meeting.create({ data }); // Can throw unhandled errors
  return meeting;
}
```

**Error Boundary Pattern:**

```typescript
// components/ui/ErrorBoundary.tsx
import React from 'react';
import { Button, Result } from 'antd';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to error tracking service
    logger.error('React Error Boundary caught error', {
      error,
      errorInfo,
      componentStack: errorInfo.componentStack
    });
  }
  
  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <Result
          status="error"
          title="Something went wrong"
          subTitle="We're sorry for the inconvenience. Please try refreshing the page."
          extra={
            <Button type="primary" onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          }
        />
      );
    }
    
    return this.props.children;
  }
}
```

## Intelligent Routing Architecture

### Consolidated API Routes Pattern

**Key Principle:** Single API route handles all organizational levels dynamically instead of separate routes per level.

```typescript
// app/api/organizational-units/[levelType]/[unitId]/route.ts
import { NextRequest, NextResponse } from 'next/server';

type OrganizationalLevel = 'CELL' | 'ZONE' | 'AREA' | 'COMMUNITY' | 'DISTRICT' | 'CAMPUS' | 'GROUP';

export async function GET(
  request: NextRequest,
  { params }: { params: { levelType: string; unitId: string } }
) {
  const { levelType, unitId } = params;
  
  // Validate level type
  const validLevels: OrganizationalLevel[] = ['CELL', 'ZONE', 'AREA', 'COMMUNITY', 'DISTRICT', 'CAMPUS', 'GROUP'];
  if (!validLevels.includes(levelType as OrganizationalLevel)) {
    return NextResponse.json({ error: 'Invalid organizational level' }, { status: 400 });
  }
  
  try {
    // Fetch unit data dynamically based on level type
    const unit = await db.organizationalUnits.findFirst({
      where: {
        id: unitId,
        levelType: levelType as OrganizationalLevel
      },
      include: {
        leader: true,
        members: true,
        parentUnit: true,
        childUnits: true
      }
    });
    
    if (!unit) {
      return NextResponse.json({ error: 'Unit not found' }, { status: 404 });
    }
    
    return NextResponse.json(unit);
  } catch (error) {
    console.error('Error fetching organizational unit:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { levelType: string; unitId: string } }
) {
  const { levelType, unitId } = params;
  const body = await request.json();
  
  try {
    const updated = await db.organizationalUnits.update({
      where: { id: unitId, levelType: levelType as OrganizationalLevel },
      data: body
    });
    
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating organizational unit:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### Universal Leader Dashboard Pattern

**Key Principle:** Single dashboard page component serves all level leaders with intelligent rendering based on user's organizational level.

```typescript
// app/leader/dashboard/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { UniversalLeaderDashboard } from '@/components/features/leadership/UniversalLeaderDashboard';

export default async function LeaderDashboardPage() {
  const token = cookies().get('accessToken');
  if (!token) redirect('/login');
  
  // Get current user from token
  const user = await getCurrentUser(token.value);
  
  if (!user || !user.organizationalLevel) {
    redirect('/profile/complete');
  }
  
  // Verify user has leader role
  const leaderRoles = ['CELL_LEADER', 'ZONAL_LEADER', 'CAMPUS_ADMIN', 'GROUP_ADMIN', 'SUPERADMIN'];
  if (!leaderRoles.includes(user.role)) {
    redirect('/member/dashboard');
  }
  
  return (
    <UniversalLeaderDashboard
      user={user}
      levelType={user.organizationalLevel}
      unitId={user.organizationalUnitId}
    />
  );
}
```

```typescript
// components/features/leadership/UniversalLeaderDashboard.tsx
import { MetricsOverview } from './MetricsOverview';
import { UnitHierarchy } from './UnitHierarchy';
import { ReportsSection } from './ReportsSection';
import { MembersSection } from './MembersSection';

interface UniversalLeaderDashboardProps {
  user: User;
  levelType: OrganizationalLevel;
  unitId: string;
}

export async function UniversalLeaderDashboard({
  user,
  levelType,
  unitId
}: UniversalLeaderDashboardProps) {
  // Fetch unit data using consolidated API
  const unit = await fetch(`/api/organizational-units/${levelType}/${unitId}`).then(r => r.json());
  
  // Determine level-specific labels
  const levelLabels = {
    CELL: { singular: 'Cell', plural: 'Cells', parent: 'Zone', child: null },
    ZONE: { singular: 'Zone', plural: 'Zones', parent: 'Area', child: 'Cell' },
    AREA: { singular: 'Area', plural: 'Areas', parent: 'Community', child: 'Zone' },
    COMMUNITY: { singular: 'Community', plural: 'Communities', parent: 'District', child: 'Area' },
    DISTRICT: { singular: 'District', plural: 'Districts', parent: 'Campus', child: 'Community' },
    CAMPUS: { singular: 'Campus', plural: 'Campuses', parent: 'Group', child: 'District' },
    GROUP: { singular: 'Group', plural: 'Groups', parent: null, child: 'Campus' }
  };
  
  const labels = levelLabels[levelType];
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{labels.singular} Dashboard</h1>
        <p className="text-gray-600">{unit.name}</p>
      </div>
      
      {/* Metrics Overview - same component, different data */}
      <MetricsOverview
        levelType={levelType}
        unitId={unitId}
        labels={labels}
      />
      
      {/* Unit Hierarchy - shows parent and child units */}
      <UnitHierarchy
        unit={unit}
        levelType={levelType}
        labels={labels}
      />
      
      {/* Reports Section - filtered by level */}
      <ReportsSection
        levelType={levelType}
        unitId={unitId}
        canSubmit={true}
        canReview={['CAMPUS_ADMIN', 'GROUP_ADMIN', 'SUPERADMIN'].includes(user.role)}
      />
      
      {/* Members Section - filtered by level */}
      <MembersSection
        levelType={levelType}
        unitId={unitId}
        canManage={true}
      />
    </div>
  );
}
```

### Dynamic Data Fetching Pattern

```typescript
// lib/utils/organizationalData.ts
export async function getOrganizationalUnitData(
  levelType: OrganizationalLevel,
  unitId: string
) {
  const response = await fetch(`/api/organizational-units/${levelType}/${unitId}`, {
    cache: 'no-store' // Always get fresh data
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch ${levelType} data`);
  }
  
  return response.json();
}

export async function getUnitMembers(
  levelType: OrganizationalLevel,
  unitId: string
) {
  const response = await fetch(`/api/organizational-units/${levelType}/${unitId}/members`, {
    cache: 'no-store'
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch members`);
  }
  
  return response.json();
}

export async function getUnitReports(
  levelType: OrganizationalLevel,
  unitId: string,
  filters?: { status?: string; startDate?: string; endDate?: string }
) {
  const params = new URLSearchParams(filters as Record<string, string>);
  const response = await fetch(
    `/api/organizational-units/${levelType}/${unitId}/reports?${params}`,
    { cache: 'no-store' }
  );
  
  if (!response.ok) {
    throw new Error(`Failed to fetch reports`);
  }
  
  return response.json();
}
```

## Common Patterns

### Authentication

```typescript
// Check auth in Server Components
import { cookies } from "next/headers";

const token = cookies().get("accessToken");
```

### Data Fetching

```typescript
// Server Component
async function getData() {
  const res = await fetch("http://localhost:3001/endpoint");
  return res.json();
}
```

### Form Handling

- Use Ant Design Form components
- Implement proper validation
- Use Server Actions for submissions
- Provide clear error messages

## Directory Structure Preferences

```
app/
├── (auth)/
│   ├── login/
│   ├── register/
│   └── layout.tsx
├── (superadmin)/
│   ├── dashboard/
│   ├── groups/
│   ├── members/
│   ├── analytics/
│   └── layout.tsx
├── (leader)/
│   ├── dashboard/
│   ├── my-group/
│   ├── meetings/
│   ├── members/
│   └── layout.tsx
├── (member)/
│   ├── dashboard/
│   ├── my-group/
│   ├── history/
│   └── layout.tsx
├── api/
│   ├── auth/
│   ├── users/
│   ├── groups/
│   ├── meetings/
│   ├── interactions/
│   └── analytics/
├── components/
│   ├── ui/
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Card/
│   │   └── Table/
│   └── features/
│       ├── auth/
│       ├── groups/
│       ├── meetings/
│       ├── members/
│       └── navigation/
├── lib/
│   ├── utils/
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   ├── format.ts
│   │   └── validation.ts
│   ├── types.ts
│   ├── constants/
│   │   └── index.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   └── useGroup.ts
│   └── data/
│       ├── mockData.ts
│       └── database.ts
├── providers/
│   ├── AntdProvider.tsx
│   └── AuthProvider.tsx
├── styles/
│   └── globals.css
└── layout.tsx
```

## Testing Approach

- Write tests for utilities
- Test component logic, not implementation details
- Mock external dependencies
- Use meaningful test descriptions
- Test role-based access control thoroughly

## Performance Considerations

**CRITICAL: Performance is a feature, not an afterthought**

### Frontend Performance

1. **Image Optimization**
   - Always use Next.js Image component
   - Specify width and height to prevent layout shift
   - Use appropriate sizes prop for responsive images
   - Lazy load images below the fold
   ```typescript
   // ✅ GOOD
   <Image
     src={user.avatar}
     alt={user.name}
     width={100}
     height={100}
     sizes="(max-width: 768px) 50px, 100px"
     priority={false}
   />
   ```

2. **Code Splitting & Lazy Loading**
   - Use dynamic imports for heavy components
   - Lazy load route components
   - Split vendor bundles appropriately
   ```typescript
   // ✅ GOOD: Lazy load heavy components
   const ReportChart = dynamic(() => import('@/components/features/reports/ReportChart'), {
     loading: () => <LoadingSkeleton />,
     ssr: false // Don't render on server if not needed
   });
   ```

3. **React Optimization**
   - Use React.memo for expensive component renders
   - Use useMemo for expensive computations
   - Use useCallback for stable function references
   - Avoid unnecessary re-renders
   ```typescript
   // ✅ GOOD: Memoize expensive computations
   const metrics = useMemo(() => {
     return calculateComplexMetrics(data);
   }, [data]);
   
   // ✅ GOOD: Memoize components
   const MemberCard = React.memo(function MemberCard({ member }: { member: User }) {
     return <Card>{/* ... */}</Card>;
   });
   ```

4. **Bundle Size Optimization**
   - Tree-shake unused code
   - Use barrel exports sparingly
   - Import only what you need from libraries
   ```typescript
   // ✅ GOOD: Import specific components
   import { Button, Table } from 'antd';
   
   // ❌ BAD: Import everything
   import * as AntD from 'antd';
   ```

5. **Data Fetching Optimization**
   - Implement proper pagination (cursor-based, not offset)
   - Use infinite scroll for long lists
   - Prefetch data for predictable navigation
   - Use SWR or React Query for client-side caching
   ```typescript
   // ✅ GOOD: Cursor-based pagination
   const { data, fetchNextPage } = useInfiniteQuery({
     queryKey: ['reports'],
     queryFn: ({ pageParam = null }) => 
       fetchReports({ cursor: pageParam, limit: 20 }),
     getNextPageParam: (lastPage) => lastPage.nextCursor,
   });
   ```

### Backend Performance

1. **Database Query Optimization**
   - Use indexes on frequently queried fields
   - Select only necessary fields
   - Use proper joins instead of N+1 queries
   - Implement database-level pagination
   ```typescript
   // ✅ GOOD: Optimized query
   const reports = await prisma.reportSubmission.findMany({
     where: { status: 'SUBMITTED' },
     select: {
       id: true,
       reportWeek: true,
       submittedBy: {
         select: { id: true, firstName: true, lastName: true }
       }
     },
     take: 20,
     cursor: cursor ? { id: cursor } : undefined,
     orderBy: { createdAt: 'desc' }
   });
   
   // ❌ BAD: Fetches all fields, no pagination
   const badReports = await prisma.reportSubmission.findMany({
     where: { status: 'SUBMITTED' }
   });
   ```

2. **Caching Strategy**
   - Cache expensive computations
   - Use Redis for session and frequently accessed data
   - Implement cache invalidation on writes
   - Set appropriate TTLs
   ```typescript
   // ✅ GOOD: Proper caching
   async function getGroupAnalytics(groupId: string) {
     const cacheKey = `analytics:group:${groupId}`;
     const cached = await redis.get(cacheKey);
     
     if (cached) return JSON.parse(cached);
     
     const analytics = await computeExpensiveAnalytics(groupId);
     await redis.set(cacheKey, JSON.stringify(analytics), 'EX', 600); // 10min TTL
     
     return analytics;
   }
   ```

3. **API Response Optimization**
   - Return only necessary data
   - Use compression (gzip)
   - Implement ETag for conditional requests
   - Use streaming for large datasets

4. **Rate Limiting & Throttling**
   - Prevent abuse with rate limits
   - Implement backoff strategies
   - Queue heavy background jobs

### Performance Metrics

**Target Metrics:**
- First Contentful Paint (FCP): < 1.8s
- Largest Contentful Paint (LCP): < 2.5s
- Time to Interactive (TTI): < 3.8s
- Cumulative Layout Shift (CLS): < 0.1
- First Input Delay (FID): < 100ms
- Bundle Size: < 200KB (gzipped)
- API Response Time: < 200ms (p95)
- Database Query Time: < 50ms (p95)

## Accessibility (WCAG 2.1 AA Compliance)

**CRITICAL: Accessibility is mandatory, not optional**

### Semantic HTML
- Use proper HTML5 semantic elements (header, nav, main, article, section, aside, footer)
- Use headings (h1-h6) in logical order
- Use buttons for actions, links for navigation
- Use lists (ul, ol) for related items

```typescript
// ✅ GOOD: Semantic structure
<main>
  <h1>Dashboard</h1>
  <nav aria-label="Main navigation">
    <ul>
      <li><a href="/reports">Reports</a></li>
    </ul>
  </nav>
  <section aria-labelledby="recent-reports">
    <h2 id="recent-reports">Recent Reports</h2>
  </section>
</main>

// ❌ BAD: Divs everywhere
<div>
  <div className="title">Dashboard</div>
  <div className="nav">...</div>
</div>
```

### ARIA Labels & Roles
- Implement proper ARIA labels for all interactive elements
- Use aria-describedby for additional context
- Use aria-live for dynamic content updates
- Use proper roles when semantic HTML isn't sufficient

```typescript
// ✅ GOOD: Proper ARIA usage
<button
  onClick={handleSubmit}
  aria-label="Submit report for review"
  aria-describedby="submit-help"
  disabled={loading}
  aria-busy={loading}
>
  Submit
</button>
<span id="submit-help" className="sr-only">
  This will submit your report and notify the reviewer
</span>

// Dynamic content
<div role="status" aria-live="polite" aria-atomic="true">
  {successMessage}
</div>
```

### Keyboard Navigation
- All interactive elements must be keyboard accessible
- Implement logical tab order
- Provide keyboard shortcuts for common actions
- Show focus indicators clearly
- Handle Escape key to close modals

```typescript
// ✅ GOOD: Keyboard support
function Modal({ isOpen, onClose, children }: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);
  
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {children}
    </div>
  );
}
```

### Color Contrast
- Minimum contrast ratio 4.5:1 for normal text
- Minimum contrast ratio 3:1 for large text (18pt+)
- Don't rely on color alone to convey information

### Form Accessibility
- Associate labels with inputs
- Provide clear error messages
- Use fieldsets for related form controls
- Indicate required fields

```typescript
// ✅ GOOD: Accessible form
<Form.Item
  label="Email Address"
  required
  validateStatus={errors.email ? 'error' : ''}
  help={errors.email}
>
  <Input
    type="email"
    name="email"
    aria-required="true"
    aria-invalid={!!errors.email}
    aria-describedby={errors.email ? 'email-error' : undefined}
  />
  {errors.email && (
    <span id="email-error" role="alert">
      {errors.email}
    </span>
  )}
</Form.Item>
```

### Screen Reader Support
- Use Ant Design's built-in accessibility features
- Test with NVDA (Windows) and VoiceOver (Mac)
- Provide descriptive alt text for images
- Use sr-only class for screen reader only content

### Focus Management
- Trap focus in modals
- Return focus after modal closes
- Provide skip links for keyboard users

```typescript
// ✅ GOOD: Focus management
function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!isActive || !containerRef.current) return;
    
    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    firstElement?.focus();
    
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };
    
    container.addEventListener('keydown', handleTab);
    return () => container.removeEventListener('keydown', handleTab);
  }, [isActive]);
  
  return containerRef;
}
```

## UI/UX Excellence Standards

**CRITICAL: User experience is paramount**

### Design Principles

1. **Clarity Over Cleverness**
   - Clear labels and instructions
   - Predictable behavior
   - Obvious next steps
   - No ambiguous states

2. **Consistency**
   - Consistent button styles and placement
   - Consistent terminology throughout
   - Consistent spacing and typography
   - Consistent feedback patterns

3. **Responsiveness**
   - Mobile-first design
   - Touch-friendly targets (min 44x44px)
   - Responsive layouts at all breakpoints
   - Optimized for tablets and desktops

4. **Feedback & Confirmation**
   - Immediate feedback for all actions
   - Loading states for async operations
   - Success/error messages for mutations
   - Confirmation dialogs for destructive actions

```typescript
// ✅ GOOD: Comprehensive user feedback
async function handleSubmit() {
  setLoading(true);
  
  try {
    await submitReport(data);
    message.success('Report submitted successfully');
    router.push('/reports');
  } catch (error) {
    message.error(
      error instanceof Error 
        ? error.message 
        : 'Failed to submit report. Please try again.'
    );
  } finally {
    setLoading(false);
  }
}

// ❌ BAD: No feedback
async function badHandleSubmit() {
  await submitReport(data);
  router.push('/reports');
}
```

5. **Error Prevention**
   - Validate inputs in real-time
   - Disable invalid actions
   - Provide helpful constraints
   - Autosave important data

```typescript
// ✅ GOOD: Prevent errors
<Form.Item
  label="Email"
  validateStatus={emailError ? 'error' : validateEmail(email) ? 'success' : ''}
  help={emailError || 'Enter a valid email address'}
>
  <Input
    type="email"
    value={email}
    onChange={(e) => {
      setEmail(e.target.value);
      setEmailError(null);
    }}
    onBlur={() => {
      if (!validateEmail(email)) {
        setEmailError('Invalid email format');
      }
    }}
  />
</Form.Item>
```

6. **Progressive Disclosure**
   - Show essential information first
   - Hide advanced options behind toggles
   - Use accordions for optional content
   - Implement "show more" patterns

7. **Empty States**
   - Never show empty tables/lists without context
   - Provide helpful empty state illustrations
   - Offer clear calls-to-action
   - Guide users to first steps

```typescript
// ✅ GOOD: Helpful empty state
{reports.length === 0 ? (
  <EmptyState
    icon={<FileOutlined style={{ fontSize: 64 }} />}
    title="No reports yet"
    description="Submit your first weekly report to get started"
    action={
      <Button type="primary" onClick={() => router.push('/reports/create')}>
        Create Report
      </Button>
    }
  />
) : (
  <ReportsList reports={reports} />
)}
```

### Loading States

**All async operations must have loading states:**

```typescript
// ✅ GOOD: Comprehensive loading states
function ReportsPage() {
  const { data: reports, isLoading, error } = useReports();
  
  if (isLoading) {
    return <LoadingSkeleton type="table" rows={10} />;
  }
  
  if (error) {
    return (
      <Result
        status="error"
        title="Failed to load reports"
        subTitle={error.message}
        extra={<Button onClick={() => window.location.reload()}>Retry</Button>}
      />
    );
  }
  
  return <ReportsTable data={reports} />;
}
```

### Form UX Best Practices

1. **Field Validation**
   - Validate on blur, not on every keystroke
   - Show success indicators for valid fields
   - Provide specific error messages
   - Highlight problematic fields clearly

2. **Submit Buttons**
   - Disable while submitting
   - Show loading indicator
   - Keep user on page until success/error
   - Don't double-submit

3. **Autosave**
   - Implement for long forms
   - Show save status clearly
   - Handle conflicts gracefully
   - Provide manual save option

### Mobile UX Considerations

- Touch targets minimum 44x44px
- Thumb-friendly button placement
- Swipe gestures where appropriate
- Optimized keyboards (email, number, tel)
- Pull-to-refresh for lists
- Bottom sheets instead of modals

### Micro-interactions

- Button hover/active states
- Smooth transitions (150-300ms)
- Subtle animations for state changes
- Loading spinners for delays > 300ms
- Skeleton screens for content loading

## Code Readability & Maintainability

**CRITICAL: Code is read more than written**

### Naming Conventions

1. **Be Descriptive, Not Cryptic**
```typescript
// ✅ GOOD
const userSubmittedReports = reports.filter(r => r.submittedById === userId);
const hasUnreadNotifications = notifications.some(n => !n.isRead);

// ❌ BAD
const usr = reports.filter(r => r.sid === uid);
const flag = notifications.some(n => !n.rd);
```

2. **Use Verbs for Functions**
```typescript
// ✅ GOOD
function calculatePercentage(achieved: number, goal: number): number
function validateEmail(email: string): boolean
function fetchUserReports(userId: string): Promise<Report[]>

// ❌ BAD
function percentage(a: number, b: number): number
function email(e: string): boolean
function reports(id: string): Promise<Report[]>
```

3. **Boolean Names Should Answer Yes/No**
```typescript
// ✅ GOOD
const isLoading = true;
const hasPermission = checkPermission(user, 'EDIT_REPORT');
const canSubmit = formIsValid && !isSubmitting;

// ❌ BAD
const loading = true;
const permission = checkPermission(user, 'EDIT_REPORT');
const submit = formIsValid && !isSubmitting;
```

### Function Organization

1. **Small, Focused Functions** (max 50 lines)
```typescript
// ✅ GOOD: Single responsibility
function validateReportData(data: ReportInput): ValidationResult {
  const errors: string[] = [];
  
  if (!data.reportWeek || data.reportWeek < 1 || data.reportWeek > 53) {
    errors.push('Invalid report week');
  }
  
  if (!data.metricEntries || data.metricEntries.length === 0) {
    errors.push('At least one metric entry required');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

function submitReport(data: ReportInput): Promise<Report> {
  const validation = validateReportData(data);
  if (!validation.valid) {
    throw new ValidationError(validation.errors);
  }
  
  return apiClient.post('/reports', data);
}

// ❌ BAD: Does too much
function submitReport(data: any) {
  // Validation
  if (!data.reportWeek || data.reportWeek < 1 || data.reportWeek > 53) {
    throw new Error('Invalid week');
  }
  // ... 100 more lines of validation and submission
}
```

2. **Extract Magic Numbers**
```typescript
// ✅ GOOD
const MAX_REPORT_WEEK = 53;
const MIN_REPORT_WEEK = 1;
const AUTO_SAVE_INTERVAL_MS = 30000;
const CACHE_TTL_MINUTES = 10;

// ❌ BAD
if (week >= 1 && week <= 53) { }
setInterval(autoSave, 30000);
redis.set(key, data, 'EX', 600);
```

3. **Group Related Logic**
```typescript
// ✅ GOOD: Organized by feature
// lib/utils/reportValidation.ts
export function validateReportData() { }
export function validateMetricEntry() { }

// lib/utils/reportCalculations.ts
export function calculatePerformance() { }
export function calculateVariance() { }

// lib/utils/reportFormatting.ts
export function formatReportDate() { }
export function formatMetricValue() { }
```

### Comments & Documentation

1. **Comment Why, Not What**
```typescript
// ✅ GOOD
// Lock metric goals after first submission to prevent gaming the system
if (report.status !== 'DRAFT') {
  metricEntry.monthlyGoalLocked = true;
}

// ❌ BAD
// Set monthlyGoalLocked to true
metricEntry.monthlyGoalLocked = true;
```

2. **JSDoc for Public APIs**
```typescript
// ✅ GOOD
/**
 * Calculate performance percentage for a metric entry
 * @param achieved - Actual value achieved
 * @param goal - Target goal value
 * @returns Performance percentage rounded to 1 decimal place
 * @throws {Error} If goal is negative
 */
export function calculatePerformance(achieved: number, goal: number): number {
  if (goal < 0) throw new Error('Goal cannot be negative');
  if (goal === 0) return 0;
  return Math.round((achieved / goal) * 100 * 10) / 10;
}
```

3. **TODO Comments Must Reference Issues**
```typescript
// ✅ GOOD
// TODO(#123): Implement real-time collaboration for reports

// ❌ BAD
// TODO: fix this later
// TODO: optimize
```

### File Organization

1. **Imports Order**
```typescript
// ✅ GOOD: Organized imports
// External libraries
import React, { useState, useEffect } from 'react';
import { Button, Form, Input } from 'antd';
import { useRouter } from 'next/navigation';

// Internal absolute imports
import { validateEmail } from '@/lib/utils/validation';
import { User } from '@/lib/types';

// Relative imports
import { UserCard } from './UserCard';
import styles from './Dashboard.module.css';
```

2. **Component Structure**
```typescript
// ✅ GOOD: Consistent structure
// 1. Imports
import React from 'react';

// 2. Types/Interfaces
interface Props {
  user: User;
  onUpdate: (user: User) => void;
}

// 3. Constants
const MAX_NAME_LENGTH = 50;

// 4. Component
export function UserProfile({ user, onUpdate }: Props) {
  // 4a. Hooks
  const [editing, setEditing] = useState(false);
  const router = useRouter();
  
  // 4b. Derived state
  const canEdit = user.role === 'ADMIN';
  
  // 4c. Event handlers
  const handleSave = () => {
    // ...
  };
  
  // 4d. Effects
  useEffect(() => {
    // ...
  }, []);
  
  // 4e. Render
  return (
    // ...
  );
}

// 5. Helper functions (if component-specific)
function formatUserName(user: User): string {
  return `${user.firstName} ${user.lastName}`;
}
```

### Error Messages

```typescript
// ✅ GOOD: Helpful error messages
if (!user) {
  throw new Error(
    `User not found with ID: ${userId}. Please verify the user exists.`
  );
}

if (group.members.length >= MAX_GROUP_SIZE) {
  throw new Error(
    `Group "${group.name}" is at capacity (${MAX_GROUP_SIZE} members). ` +
    `Please select a different group or contact an administrator.`
  );
}

// ❌ BAD: Cryptic errors
if (!user) {
  throw new Error('Not found');
}

if (group.members.length >= MAX_GROUP_SIZE) {
  throw new Error('Full');
}
```

## State Management

- Use React Context for global state (auth, theme, user role)
- Use local state with hooks for component-specific state
- Avoid unnecessary re-renders by memoizing components and values
- Use Server Actions for server state mutations

## Backend Architecture

### Current (Phase 3-4): Mock Backend

- TypeScript-based mock data in `app/lib/data/mockData.ts`
- In-memory database service in `app/lib/data/database.ts`
- Next.js API routes in `app/api/`
- No persistence across restarts
- Structure matches production database schema

### Production (Phase 5): Database Integration

#### Prisma ORM

- Use Prisma Client for all database operations
- Never write raw SQL (Prisma prevents SQL injection)
- Always use singleton pattern: `import { prisma } from '@/lib/db/prisma'`
- Use transactions for multi-step operations
- Select only needed fields: `select: { id: true, name: true }`
- Use proper relations: `include: { leader: true, members: true }`
- Implement cursor-based pagination, not offset-based

```typescript
// Good: Cursor-based pagination
const meetings = await prisma.meeting.findMany({
  take: 20,
  cursor: cursor ? { id: cursor } : undefined,
  skip: cursor ? 1 : 0,
  orderBy: { createdAt: "desc" },
});

// Bad: Offset-based pagination (slow at scale)
const meetings = await prisma.meeting.findMany({
  take: 20,
  skip: page * 20, // Don't do this
});
```

#### Cloudinary Image Management

- Upload meeting screenshots using `uploadImage()` from `lib/utils/cloudinary.ts`
- Always delete old images before uploading new ones
- Store Cloudinary URLs in database, not local paths
- Use appropriate upload preset (avatar or meetingImage)
- Validate files client-side before upload
- Handle upload failures gracefully

```typescript
// Image upload pattern
try {
  // Validate
  const validation = validateImageFile(file);
  if (!validation.valid) throw new Error(validation.error);

  // Convert to base64
  const base64 = await fileToBase64(file);

  // Upload
  const result = await uploadImage(base64, "meetingImage");

  // Store URL in database
  await prisma.meeting.update({
    where: { id: meetingId },
    data: { screenshotUrl: result.url },
  });
} catch (error) {
  // Handle error
}
```

#### Redis Caching

- Check cache before database queries
- Set appropriate TTLs (5-30 minutes)
- Invalidate cache on writes
- Use structured cache keys: `{resource}:{id}:{variant}`

```typescript
import { cache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache/redis';

// Cache pattern
const cacheKey = CACHE_KEYS.groupMembers(groupId);
const cached = await cache.get(cacheKey);

if (cached) return cached;

const data = await prisma.member.findMany({...});
await cache.set(cacheKey, data, CACHE_TTL.members);

return data;
```

#### Rate Limiting

- Apply rate limits to all API routes
- Use `rateLimitByUser()` for authenticated routes
- Use `rateLimitByIP()` for public routes
- Return 429 status with Retry-After header

```typescript
import { rateLimitByUser } from "@/lib/utils/rateLimiter";

const rateLimit = await rateLimitByUser(userId, {
  maxRequests: 10,
  windowSeconds: 3600, // 1 hour
});

if (!rateLimit.success) {
  return NextResponse.json(
    { error: "Rate limit exceeded" },
    { status: 429, headers: { "Retry-After": String(rateLimit.reset) } }
  );
}
```

#### Security Best Practices

- Always hash passwords with bcrypt (10+ salt rounds)
- Never log sensitive data (passwords, tokens, phone numbers)
- Validate all inputs with Zod schemas
- Use parameterized queries (Prisma does this)
- Implement CORS for production domain only
- Set secure cookie flags in production
- Rate limit all endpoints
- Sanitize user-generated content
- Implement role-based access control at API level

#### Error Handling

- Use try-catch for all async operations
- Log errors with context (user ID, request ID)
- Return user-friendly error messages
- Don't expose stack traces in production
- Handle Prisma errors specifically

```typescript
try {
  // Database operation
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Resource already exists" },
        { status: 409 }
      );
    }
  }
  console.error("Database error:", error);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
```

#### Performance Guidelines

- Use indexes for frequently queried fields
- Avoid N+1 queries (use `include` or `select` with relations)
- Implement pagination on all list endpoints
- Cache expensive queries
- Use connection pooling (Prisma default)
- Monitor slow queries in production
- Use database-level constraints (unique, foreign keys)

#### Migration Strategy

- Never modify Prisma schema directly in production
- Always create migration: `npx prisma migrate dev`
- Review generated SQL before applying
- Test migrations on staging first
- Use `prisma migrate deploy` for production
- Keep migrations in version control
- Document breaking changes

## Leadership Reporting System Patterns

> **Reference:** See `.github/prd-implementation-plan.md` for complete specifications

**Organizational Hierarchy:** Cell → Zone → Area → Community → District → Campus → Group  
**Reporting Hierarchy:** Campus Leaders → Campus Pastor → Group Admin → Church Ministry → SPO → CEO

### Dynamic Form System Architecture

**Key Principle:** Report forms are dynamically rendered based on ReportType configuration. No code changes needed to create new report types.

#### FormDefinition Structure

```typescript
interface ReportType {
  id: string;
  name: string;
  code: string; // Unique: "CAMPUS_WEEKLY", "MINISTRY_MONTHLY"
  category: 'CAMPUS' | 'GROUP' | 'MINISTRY' | 'SPECIAL';
  formDefinition: FormDefinition; // Dynamic form schema
  allowedSubmitterRoles: UserRole[];
  allowedReviewerRoles: UserRole[];
  frequency: 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'AD_HOC';
  organizationalLevel?: 'CELL' | 'ZONE' | 'AREA' | 'COMMUNITY' | 'DISTRICT' | 'CAMPUS' | 'GROUP';
}

interface FormDefinition {
  sections: FormSection[];
  validationRules: ValidationRule[];
}

interface FormSection {
  id: string;
  title: string;
  description?: string;
  displayOrder: number;
  fields: FormField[];
}

interface FormField {
  id: string;
  name: string;
  label: string;
  type: 'TEXT' | 'NUMBER' | 'DATE' | 'SELECT' | 'TEXTAREA' | 'CHECKBOX' | 'STRATEGIC_INDICATOR';
  placeholder?: string;
  helpText?: string;
  isRequired: boolean;
  options?: { label: string; value: string }[]; // For SELECT type
  
  // Validation
  minValue?: number;
  maxValue?: number;
  pattern?: string;
  
  // Field locking configuration
  lockingConfig?: {
    lockAfterSubmit?: boolean;
    lockAfterDate?: string; // ISO date
    lockAfterValue?: boolean; // Lock after first value entry
  };
  
  displayOrder: number;
}
```

#### DynamicFormRenderer Pattern

```typescript
// components/features/reports/DynamicFormRenderer.tsx
import { Form, Input, InputNumber, DatePicker, Select, Checkbox, Card } from 'antd';

interface DynamicFormRendererProps {
  reportType: ReportType;
  initialData?: Record<string, any>;
  mode: 'create' | 'edit' | 'view';
  onSave: (formData: Record<string, any>) => Promise<void>;
}

export function DynamicFormRenderer({ reportType, initialData, mode, onSave }: DynamicFormRendererProps) {
  const [form] = Form.useForm();
  const formDefinition = reportType.formDefinition;
  
  const renderField = (field: FormField): ReactNode => {
    const isLocked = checkFieldLock(field, initialData);
    
    switch (field.type) {
      case 'TEXT':
        return <Input disabled={isLocked || mode === 'view'} placeholder={field.placeholder} />;
      
      case 'NUMBER':
        return (
          <InputNumber 
            disabled={isLocked || mode === 'view'} 
            min={field.minValue} 
            max={field.maxValue} 
            className="w-full"
          />
        );
      
      case 'DATE':
        return <DatePicker disabled={isLocked || mode === 'view'} className="w-full" />;
      
      case 'SELECT':
        return (
          <Select disabled={isLocked || mode === 'view'}>
            {field.options?.map(opt => (
              <Select.Option key={opt.value} value={opt.value}>{opt.label}</Select.Option>
            ))}
          </Select>
        );
      
      case 'TEXTAREA':
        return <TextArea rows={4} disabled={isLocked || mode === 'view'} />;
      
      case 'CHECKBOX':
        return <Checkbox disabled={isLocked || mode === 'view'}>{field.label}</Checkbox>;
      
      case 'STRATEGIC_INDICATOR':
        return <StrategicIndicatorField field={field} disabled={isLocked || mode === 'view'} />;
      
      case 'FILE_UPLOAD':
        return (
          <FileUploadField
            field={field}
            disabled={isLocked || mode === 'view'}
            acceptedTypes={field.acceptedFileTypes}
            maxSize={field.maxFileSize}
            uploadFolder={field.uploadFolder || 'reports'}
          />
        );
      
      case 'MULTI_FILE_UPLOAD':
        return (
          <MultiFileUploadField
            field={field}
            disabled={isLocked || mode === 'view'}
            acceptedTypes={field.acceptedFileTypes}
            maxSize={field.maxFileSize}
            maxFiles={field.maxFiles || 10}
            uploadFolder={field.uploadFolder || 'reports'}
          />
        );
      
      default:
        return null;
    }
  };
  
  const buildValidationRules = (field: FormField): Rule[] => {
    const rules: Rule[] = [];
    
    if (field.isRequired) {
      rules.push({ required: true, message: `${field.label} is required` });
    }
    
    if (field.minValue !== undefined) {
      rules.push({ type: 'number', min: field.minValue, message: `Minimum value is ${field.minValue}` });
    }
    
    if (field.maxValue !== undefined) {
      rules.push({ type: 'number', max: field.maxValue, message: `Maximum value is ${field.maxValue}` });
    }
    
    if (field.pattern) {
      rules.push({ pattern: new RegExp(field.pattern), message: 'Invalid format' });
    }
    
    return rules;
  };
  
  const checkFieldLock = (field: FormField, data?: Record<string, any>): boolean => {
    if (!field.lockingConfig) return false;
    
    if (field.lockingConfig.lockAfterSubmit && data?.status !== 'DRAFT') {
      return true;
    }
    
    if (field.lockingConfig.lockAfterDate) {
      const lockDate = new Date(field.lockingConfig.lockAfterDate);
      if (new Date() > lockDate) return true;
    }
    
    if (field.lockingConfig.lockAfterValue && data?.[field.name] !== undefined) {
      return true;
    }
    
    return false;
  };
  
  return (
    <Form form={form} layout="vertical" initialValues={initialData}>
      {formDefinition.sections.map(section => (
        <Card key={section.id} title={section.title} className="mb-4">
          {section.description && <p className="text-gray-600 mb-4">{section.description}</p>}
          
          {section.fields.map(field => (
            <Form.Item
              key={field.id}
              name={field.name}
              label={
                <span>
                  {field.label}
                  {checkFieldLock(field, initialData) && <LockOutlined className="ml-2 text-gray-400" />}
                </span>
              }
              rules={buildValidationRules(field)}
              help={field.helpText}
            >
              {renderField(field)}
            </Form.Item>
          ))}
        </Card>
      ))}
    </Form>
  );
}
```

#### FileUploadField Component Pattern

```typescript
// components/features/reports/FileUploadField.tsx
import { useState } from 'react';
import { Upload, Button, Image, message, Progress } from 'antd';
import { UploadOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { uploadImage, deleteImage, validateImageFile } from '@/lib/utils/cloudinary';

interface FileUploadFieldProps {
  field: FormField;
  disabled?: boolean;
  acceptedTypes?: string[]; // ['image/jpeg', 'image/png', 'application/pdf']
  maxSize?: number; // in bytes
  uploadFolder?: string;
  value?: string; // Cloudinary URL
  onChange?: (url: string | null) => void;
}

export function FileUploadField({
  field,
  disabled,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/jpg'],
  maxSize = 5242880, // 5MB default
  uploadFolder = 'reports',
  value,
  onChange
}: FileUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileUrl, setFileUrl] = useState<string | null>(value || null);
  const [previewVisible, setPreviewVisible] = useState(false);

  const handleFileChange = async (file: File) => {
    // Validate file
    const validation = validateImageFile(file, { maxSize, acceptedTypes });
    if (!validation.valid) {
      message.error(validation.error);
      return false;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate progress (Cloudinary upload is single request)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // Convert to base64
      const base64 = await fileToBase64(file);

      // Upload to Cloudinary
      const uploadPreset = file.type.startsWith('image/') ? 'reports' : 'documents';
      const result = await uploadImage(base64, uploadPreset, uploadFolder);

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Delete old file if exists
      if (fileUrl) {
        await deleteImage(fileUrl);
      }

      setFileUrl(result.url);
      onChange?.(result.url);
      message.success('File uploaded successfully');
    } catch (error) {
      console.error('Upload failed:', error);
      message.error('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }

    return false; // Prevent default upload
  };

  const handleDelete = async () => {
    if (!fileUrl) return;

    try {
      await deleteImage(fileUrl);
      setFileUrl(null);
      onChange?.(null);
      message.success('File deleted successfully');
    } catch (error) {
      console.error('Delete failed:', error);
      message.error('Failed to delete file');
    }
  };

  return (
    <div className="space-y-2">
      {!fileUrl ? (
        <Upload
          beforeUpload={handleFileChange}
          accept={acceptedTypes.join(',')}
          showUploadList={false}
          disabled={disabled || uploading}
        >
          <Button icon={<UploadOutlined />} disabled={disabled || uploading} loading={uploading}>
            {uploading ? 'Uploading...' : 'Select File'}
          </Button>
        </Upload>
      ) : (
        <div className="flex items-center gap-2">
          {fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
            <Image
              src={fileUrl}
              alt={field.label}
              width={100}
              height={100}
              className="object-cover rounded"
              preview={{
                visible: previewVisible,
                onVisibleChange: setPreviewVisible
              }}
            />
          ) : (
            <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              View Document
            </a>
          )}
          
          <div className="flex gap-1">
            {fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) && (
              <Button
                size="small"
                icon={<EyeOutlined />}
                onClick={() => setPreviewVisible(true)}
              >
                Preview
              </Button>
            )}
            
            {!disabled && (
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={handleDelete}
              >
                Delete
              </Button>
            )}
          </div>
        </div>
      )}

      {uploading && uploadProgress > 0 && (
        <Progress percent={uploadProgress} size="small" status="active" />
      )}

      {field.helpText && <p className="text-sm text-gray-500">{field.helpText}</p>}
    </div>
  );
}

// Helper function
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}
```

#### MultiFileUploadField Component Pattern

```typescript
// components/features/reports/MultiFileUploadField.tsx
import { useState } from 'react';
import { Upload, Button, List, Image, message, Progress } from 'antd';
import { UploadOutlined, DeleteOutlined, FileOutlined } from '@ant-design/icons';
import { uploadImage, deleteImage, validateImageFile } from '@/lib/utils/cloudinary';

interface UploadedFile {
  uid: string;
  name: string;
  url: string;
  type: string;
}

interface MultiFileUploadFieldProps {
  field: FormField;
  disabled?: boolean;
  acceptedTypes?: string[];
  maxSize?: number;
  maxFiles?: number;
  uploadFolder?: string;
  value?: UploadedFile[];
  onChange?: (files: UploadedFile[]) => void;
}

export function MultiFileUploadField({
  field,
  disabled,
  acceptedTypes = ['image/jpeg', 'image/png', 'application/pdf'],
  maxSize = 5242880,
  maxFiles = 10,
  uploadFolder = 'reports',
  value = [],
  onChange
}: MultiFileUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [files, setFiles] = useState<UploadedFile[]>(value);

  const handleFileChange = async (file: File) => {
    if (files.length >= maxFiles) {
      message.error(`Maximum ${maxFiles} files allowed`);
      return false;
    }

    const validation = validateImageFile(file, { maxSize, acceptedTypes });
    if (!validation.valid) {
      message.error(validation.error);
      return false;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const base64 = await fileToBase64(file);
      const uploadPreset = file.type.startsWith('image/') ? 'reports' : 'documents';
      const result = await uploadImage(base64, uploadPreset, uploadFolder);

      clearInterval(progressInterval);
      setUploadProgress(100);

      const newFile: UploadedFile = {
        uid: Date.now().toString(),
        name: file.name,
        url: result.url,
        type: file.type
      };

      const updatedFiles = [...files, newFile];
      setFiles(updatedFiles);
      onChange?.(updatedFiles);
      message.success(`${file.name} uploaded successfully`);
    } catch (error) {
      console.error('Upload failed:', error);
      message.error('Failed to upload file');
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }

    return false;
  };

  const handleDelete = async (fileToDelete: UploadedFile) => {
    try {
      await deleteImage(fileToDelete.url);
      const updatedFiles = files.filter(f => f.uid !== fileToDelete.uid);
      setFiles(updatedFiles);
      onChange?.(updatedFiles);
      message.success('File deleted successfully');
    } catch (error) {
      console.error('Delete failed:', error);
      message.error('Failed to delete file');
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Upload
          beforeUpload={handleFileChange}
          accept={acceptedTypes.join(',')}
          showUploadList={false}
          disabled={disabled || uploading || files.length >= maxFiles}
        >
          <Button
            icon={<UploadOutlined />}
            disabled={disabled || uploading || files.length >= maxFiles}
            loading={uploading}
          >
            {uploading ? 'Uploading...' : 'Add File'}
          </Button>
        </Upload>
        
        <span className="text-sm text-gray-500">
          {files.length} / {maxFiles} files
        </span>
      </div>

      {uploading && uploadProgress > 0 && (
        <Progress percent={uploadProgress} size="small" status="active" />
      )}

      {files.length > 0 && (
        <List
          size="small"
          dataSource={files}
          renderItem={(file) => (
            <List.Item
              actions={[
                !disabled && (
                  <Button
                    key="delete"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDelete(file)}
                  >
                    Delete
                  </Button>
                )
              ].filter(Boolean)}
            >
              <List.Item.Meta
                avatar={
                  file.type.startsWith('image/') ? (
                    <Image
                      src={file.url}
                      alt={file.name}
                      width={40}
                      height={40}
                      className="object-cover rounded"
                    />
                  ) : (
                    <FileOutlined className="text-2xl text-gray-400" />
                  )
                }
                title={
                  <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {file.name}
                  </a>
                }
                description={file.type}
              />
            </List.Item>
          )}
        />
      )}

      {field.helpText && <p className="text-sm text-gray-500">{field.helpText}</p>}
    </div>
  );
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}
```

#### Cloudinary Integration Utilities

```typescript
// lib/utils/cloudinary.ts
/**
 * Cloudinary integration for file uploads in reports
 * Supports images and documents with validation
 */

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
  format: string;
  width?: number;
  height?: number;
  bytes: number;
}

export interface FileValidation {
  valid: boolean;
  error?: string;
}

export async function uploadImage(
  base64File: string,
  uploadPreset: string = 'reports',
  folder: string = 'reports'
): Promise<CloudinaryUploadResult> {
  const formData = new FormData();
  formData.append('file', base64File);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
    {
      method: 'POST',
      body: formData
    }
  );

  if (!response.ok) {
    throw new Error('Upload failed');
  }

  const data = await response.json();

  return {
    url: data.secure_url,
    publicId: data.public_id,
    format: data.format,
    width: data.width,
    height: data.height,
    bytes: data.bytes
  };
}

export async function deleteImage(imageUrl: string): Promise<void> {
  // Extract public_id from Cloudinary URL
  const publicId = extractPublicId(imageUrl);
  
  if (!publicId) {
    throw new Error('Invalid Cloudinary URL');
  }

  // Call backend API to delete (requires Cloudinary API secret)
  const response = await fetch('/api/cloudinary/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ publicId })
  });

  if (!response.ok) {
    throw new Error('Delete failed');
  }
}

function extractPublicId(url: string): string | null {
  // Example URL: https://res.cloudinary.com/cloud/image/upload/v123/folder/file.jpg
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/);
  return match ? match[1] : null;
}

export function validateImageFile(
  file: File,
  options: {
    maxSize?: number;
    acceptedTypes?: string[];
  } = {}
): FileValidation {
  const { maxSize = 5242880, acceptedTypes = ['image/jpeg', 'image/png', 'image/jpg'] } = options;

  // Check file type
  if (!acceptedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type not accepted. Allowed types: ${acceptedTypes.join(', ')}`
    };
  }

  // Check file size
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / 1048576).toFixed(1);
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`
    };
  }

  return { valid: true };
}
```

#### Flexible Organizational Assignment Pattern

```typescript
// utils/organizationalAssignment.ts
/**
 * System supports flexible organizational hierarchy.
 * Current levels: CELL, ZONE, AREA, COMMUNITY, DISTRICT, CAMPUS, GROUP
 * Future levels can be added without code changes.
 */

export type OrganizationalLevel = 
  | 'CELL' 
  | 'ZONE' 
  | 'AREA' 
  | 'COMMUNITY' 
  | 'DISTRICT' 
  | 'CAMPUS' 
  | 'GROUP';

export interface OrganizationalAssignment {
  levelType: OrganizationalLevel;
  unitId: string; // ID of the specific unit (e.g., specific campus ID)
}

// Use this pattern instead of hardcoded zoneId, campusId, etc.
export function assignUserToOrganization(
  userId: string,
  assignment: OrganizationalAssignment
): Promise<User> {
  return db.users.update({
    where: { id: userId },
    data: {
      organizationalLevel: assignment.levelType,
      organizationalUnitId: assignment.unitId
    }
  });
}

// Fetch reports for a specific organizational unit
export function getReportsForUnit(
  levelType: OrganizationalLevel,
  unitId: string
): Promise<ReportSubmission[]> {
  return db.reportSubmissions.findMany({
    where: {
      organizationalLevelType: levelType,
      organizationalUnitId: unitId
    },
    orderBy: { createdAt: 'desc' }
  });
}
```

### Report Submission Workflow

**Key Principle:** Reports follow a strict approval hierarchy with automated notifications at each stage.

```typescript
// Workflow states
enum ReportStatus {
  DRAFT = 'DRAFT',                 // Initial creation, editable
  SUBMITTED = 'SUBMITTED',         // Submitted for review
  REQUIRES_EDITS = 'REQUIRES_EDITS', // Reviewer requested changes
  APPROVED = 'APPROVED',           // Approved by Campus Pastor
  REVIEWED = 'REVIEWED',           // Marked as reviewed by Group Admin/Church Ministry
  FINALIZED = 'FINALIZED'          // Final review by SPO/CEO
}

// Submission flow
Campus Leaders → Submit → Campus Pastor → Approve → 
Group Admin → Review → Church Ministry → Review →
SPO/CEO → Finalize
```

### Field Locking Logic

**Key Principle:** Protect data integrity by locking fields based on submission status and time-based rules.

```typescript
// Field locking rules (FR18-FR22)
// 1. Monthly Goal: Locked after initial submission
// 2. Year-on-Year Goal: Locked after initial submission
// 3. Monthly Achieved: Editable until end of month, then locked

// Implementation pattern
export function canEditMetricField(
  field: 'monthlyGoal' | 'monthlyAchieved' | 'yearOnYearGoal',
  metricEntry: MetricEntry,
  reportStatus: ReportStatus,
  currentDate: Date
): boolean {
  // Locked if report is approved/reviewed
  if (['APPROVED', 'REVIEWED', 'FINALIZED'].includes(reportStatus)) {
    return false;
  }
  
  // Field-specific locks
  if (field === 'monthlyGoal' && metricEntry.monthlyGoalLocked) {
    return false;
  }
  
  if (field === 'yearOnYearGoal' && metricEntry.yearOnYearGoalLocked) {
    return false;
  }
  
  // Time-based lock for monthly achieved
  if (field === 'monthlyAchieved') {
    const endOfMonth = new Date(
      metricEntry.reportSubmission.reportYear,
      metricEntry.reportSubmission.reportMonth,
      0
    );
    if (currentDate > endOfMonth || metricEntry.monthlyAchievedLocked) {
      return false;
    }
  }
  
  return true;
}
```

### Auto-Save Implementation

**Key Principle:** Prevent data loss with automatic saving every 30 seconds.

```typescript
// hooks/useReportAutoSave.ts
import { useEffect, useState } from 'react';
import { useDebounce } from './useDebounce';

export function useReportAutoSave(
  reportId: string,
  metricEntries: MetricEntry[],
  interval: number = 30000 // 30 seconds
) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Debounce changes to detect when user stops typing
  const debouncedEntries = useDebounce(metricEntries, 2000);
  
  useEffect(() => {
    setHasUnsavedChanges(true);
  }, [metricEntries]);
  
  useEffect(() => {
    const saveData = async () => {
      if (!hasUnsavedChanges || metricEntries.length === 0) return;
      
      setIsSaving(true);
      try {
        await fetch(`/api/reports/${reportId}/auto-save`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ metricEntries })
        });
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
      } catch (error) {
        console.error('Auto-save failed:', error);
        // Don't clear hasUnsavedChanges on error
      } finally {
        setIsSaving(false);
      }
    };
    
    const timer = setInterval(saveData, interval);
    return () => clearInterval(timer);
  }, [reportId, debouncedEntries, hasUnsavedChanges, interval]);
  
  return { isSaving, lastSaved, hasUnsavedChanges };
}
```

### Performance Calculation

**Key Principle:** Automatically calculate and display performance metrics for each key metric.

```typescript
// utils/reportCalculations.ts
export function calculateMetricPerformance(metricEntry: MetricEntry) {
  const { monthlyGoal, monthlyAchieved } = metricEntry;
  
  if (!monthlyGoal || monthlyAchieved === null || monthlyAchieved === undefined) {
    return null;
  }
  
  const percentage = (monthlyAchieved / monthlyGoal) * 100;
  const variance = monthlyAchieved - monthlyGoal;
  
  // Determine status
  let status: 'EXCEEDING' | 'ON_TRACK' | 'BELOW_TARGET';
  if (percentage >= 100) status = 'EXCEEDING';
  else if (percentage >= 80) status = 'ON_TRACK';
  else status = 'BELOW_TARGET';
  
  return {
    performancePercentage: Math.round(percentage * 10) / 10,
    variance: Math.round(variance),
    status,
    icon: status === 'EXCEEDING' ? '✅' : status === 'ON_TRACK' ? '⚠️' : '❌'
  };
}

// Calculate overall indicator performance
export function calculateIndicatorPerformance(
  metricEntries: MetricEntry[]
): number {
  const performances = metricEntries
    .map(calculateMetricPerformance)
    .filter(p => p !== null)
    .map(p => p!.performancePercentage);
  
  if (performances.length === 0) return 0;
  
  const average = performances.reduce((sum, val) => sum + val, 0) / performances.length;
  return Math.round(average * 10) / 10;
}
```

### Referral Link Generation

**Key Principle:** Secure, one-time-use registration links with role and organizational pre-assignment.

```typescript
// utils/referralLinks.ts
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 12);

export function generateReferralCode(): string {
  return nanoid(); // Returns: ABC123DEF456
}

// API pattern for creating referral link
export async function createReferralLink(data: {
  createdById: string;
  assignedRole: UserRole;
  campusId?: string;
  departmentId?: string;
  zoneId?: string;
  expiresInDays?: number;
}) {
  const code = generateReferralCode();
  const expiresAt = data.expiresInDays
    ? new Date(Date.now() + data.expiresInDays * 24 * 60 * 60 * 1000)
    : null;
  
  return await db.referralLinks.create({
    code,
    ...data,
    expiresAt,
    isActive: true,
    isUsed: false
  });
}

// Validate during registration
export async function validateReferralCode(code: string): Promise<{
  valid: boolean;
  link?: ReferralLink;
  error?: string;
}> {
  const link = await db.referralLinks.findByCode(code);
  
  if (!link) {
    return { valid: false, error: 'Invalid referral code' };
  }
  
  if (link.isUsed) {
    return { valid: false, error: 'Referral code already used' };
  }
  
  if (!link.isActive) {
    return { valid: false, error: 'Referral code is inactive' };
  }
  
  if (link.expiresAt && new Date() > link.expiresAt) {
    return { valid: false, error: 'Referral code has expired' };
  }
  
  return { valid: true, link };
}
```

### Report Notification System

**Key Principle:** Send timely email and in-app notifications for all workflow state changes.

```typescript
// utils/reportNotifications.ts
export async function sendReportNotification(
  userId: string,
  reportId: string,
  type: ReportNotificationType,
  additionalData?: Record<string, any>
) {
  const user = await db.users.findById(userId);
  const report = await db.reportSubmissions.findById(reportId);
  
  if (!user || !report) return;
  
  const templates = {
    REPORT_SUBMITTED: {
      subject: `New Report Submitted - Week ${report.reportWeek}`,
      body: `${report.submittedBy.firstName} ${report.submittedBy.lastName} has submitted a report for review.`,
      actionUrl: `/reports/review/${reportId}`
    },
    EDITS_REQUESTED: {
      subject: `Report Edits Required - Week ${report.reportWeek}`,
      body: `Your report requires updates. Please review the feedback and resubmit.`,
      actionUrl: `/reports/edit/${reportId}`
    },
    REPORT_APPROVED: {
      subject: `Report Approved - Week ${report.reportWeek}`,
      body: `Your report has been approved by ${additionalData?.approverName}.`,
      actionUrl: `/reports/${reportId}`
    },
    AVAILABLE_FOR_REVIEW: {
      subject: `Report Available for Review - Week ${report.reportWeek}`,
      body: `A consolidated report is ready for your review.`,
      actionUrl: `/reports/review/${reportId}`
    },
    DEADLINE_APPROACHING: {
      subject: `Report Deadline in 24 Hours - Week ${report.reportWeek}`,
      body: `Reminder: Your weekly report is due tomorrow.`,
      actionUrl: `/reports/submit`
    }
  };
  
  const template = templates[type];
  if (!template) return;
  
  // Create in-app notification
  await db.reportNotifications.create({
    userId,
    reportSubmissionId: reportId,
    notificationType: type,
    title: template.subject,
    message: template.body,
    isRead: false
  });
  
  // Send email (integrate with SendGrid/AWS SES)
  await sendEmail({
    to: user.email,
    subject: template.subject,
    html: generateEmailTemplate(template.body, template.actionUrl),
    from: 'reports@harvesters.org'
  });
}
```

### Role-Based Report Access

**Key Principle:** Strict hierarchical access control for report visibility and actions.

```typescript
// middleware/reportAuthorization.ts
export async function authorizeReportAccess(
  userId: string,
  reportId: string,
  action: 'view' | 'edit' | 'submit' | 'review' | 'approve'
): Promise<{ authorized: boolean; message?: string }> {
  const user = await db.users.findById(userId);
  const report = await db.reportSubmissions.findById(reportId);
  
  if (!user || !report) {
    return { authorized: false, message: 'User or report not found' };
  }
  
  switch (action) {
    case 'view':
      // Can view if: submitter, in approval chain, or leadership
      const canView =
        report.submittedById === userId ||
        report.reviewedById === userId ||
        report.approvedById === userId ||
        ['SUPERADMIN', 'SPO', 'CHURCH_MINISTRY'].includes(user.role) ||
        (user.role === 'CAMPUS_ADMIN' && report.campusId === user.campusId) ||
        (user.role === 'ZONAL_LEADER' && report.zoneId === user.zoneId);
      
      return {
        authorized: canView,
        message: canView ? undefined : 'You do not have permission to view this report'
      };
      
    case 'edit':
      // Can edit if: submitter AND status is DRAFT or REQUIRES_EDITS AND not locked
      const canEdit =
        report.submittedById === userId &&
        ['DRAFT', 'REQUIRES_EDITS'].includes(report.status) &&
        !report.isLocked;
      
      return {
        authorized: canEdit,
        message: canEdit ? undefined : 'Report is not editable'
      };
      
    case 'submit':
      // Same as edit
      return authorizeReportAccess(userId, reportId, 'edit');
      
    case 'review':
      // Group Admin, Group Pastor, Church Ministry, SPO, CEO
      const canReview = ['GROUP_ADMIN', 'ZONAL_LEADER', 'CHURCH_MINISTRY', 'SPO', 'SUPERADMIN'].includes(user.role);
      return {
        authorized: canReview,
        message: canReview ? undefined : 'You do not have review permissions'
      };
      
    case 'approve':
      // Campus Pastor or Zonal Leader (Group Pastor)
      const canApprove =
        (user.role === 'CAMPUS_ADMIN' && report.campusId === user.campusId) ||
        (user.role === 'ZONAL_LEADER' && report.zoneId === user.zoneId) ||
        user.role === 'SUPERADMIN';
      
      return {
        authorized: canApprove,
        message: canApprove ? undefined : 'You do not have approval permissions'
      };
      
    default:
      return { authorized: false, message: 'Invalid action' };
  }
}
```

### Report Form Validation

**Key Principle:** Validate all metric entries with Zod schemas before submission.

```typescript
// validation/reportSchemas.ts
import { z } from 'zod';

export const metricEntrySchema = z.object({
  keyMetricId: z.string().cuid('Invalid metric ID'),
  monthlyGoal: z.number().min(0, 'Goal must be non-negative').optional(),
  monthlyAchieved: z.number().min(0, 'Achieved value must be non-negative').optional(),
  yearOnYearGoal: z.number().min(0, 'YoY goal must be non-negative').optional(),
});

export const reportSubmissionSchema = z.object({
  templateId: z.string().cuid('Invalid template ID'),
  reportWeek: z.number().int().min(1).max(53, 'Week must be between 1-53'),
  reportMonth: z.number().int().min(1).max(12, 'Month must be between 1-12'),
  reportYear: z.number().int().min(2020).max(2100, 'Invalid year'),
  campusId: z.string().cuid('Invalid campus ID'),
  metricEntries: z.array(metricEntrySchema).min(1, 'At least one metric required'),
}).refine(
  (data) => {
    // Ensure all required metrics are filled
    return data.metricEntries.every(
      entry => entry.monthlyGoal !== undefined && entry.monthlyAchieved !== undefined
    );
  },
  { message: 'All required metric fields must be completed' }
);
```

### Cron Jobs for Deadline Reminders

**Key Principle:** Automated reminders and auto-approval for timely report processing.

```typescript
// lib/cron/reportDeadlines.ts
// Run daily at 9 AM

export async function sendDeadlineReminders() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Find users with pending reports due tomorrow
  const pendingReports = await db.reportSubmissions.findMany({
    where: {
      status: 'DRAFT',
      periodEndDate: {
        lte: tomorrow
      }
    },
    include: { submittedBy: true }
  });
  
  for (const report of pendingReports) {
    await sendReportNotification(
      report.submittedById,
      report.id,
      'DEADLINE_APPROACHING'
    );
  }
}

export async function autoApproveOverdueReports() {
  const template = await db.reportTemplates.findFirst();
  if (!template?.autoApprovalDays) return;
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - template.autoApprovalDays);
  
  const overdueReports = await db.reportSubmissions.findMany({
    where: {
      status: 'SUBMITTED',
      submittedAt: {
        lte: cutoffDate
      }
    }
  });
  
  for (const report of overdueReports) {
    await db.reportSubmissions.update({
      where: { id: report.id },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
        approverNotes: 'Auto-approved due to no reviewer action within deadline'
      }
    });
    
    // Notify submitter
    await sendReportNotification(
      report.submittedById,
      report.id,
      'REPORT_APPROVED',
      { approverName: 'System (Auto-approval)' }
    );
  }
}
```

## Role-Based Features

### Small Groups Management System

#### Superadmin (CEO)

- Full visibility into all groups and users across all zones
- Assign and revoke any role
- Create or manage zones, campuses, departments, groups, cells
- Monitor overall engagement metrics
- Ensure data integrity and compliance
- Access to all reporting dashboards

#### Zonal Leader (Group Pastor)

- Manage all campuses within their zone
- Assign Campus Admins and HODs
- View zone-wide analytics
- Monitor zone performance
- Approve membership transfers within zone
- Review zone-level reports

#### Campus Admin (Campus Pastor)

- Manage all departments within their campus
- Assign HODs and department leaders
- View campus-wide analytics
- Monitor campus performance
- Approve campus-level membership requests
- Review and approve campus reports

#### HOD (Head of Department / Campus Admin in Reporting)

- Manage all groups/cells within their department
- Assign Small Group Leaders and Cell Leaders
- Track department meetings and attendance
- Log department-level interactions
- View department analytics
- Submit weekly reports for department

#### Small Group Leader

- Create and manage small group meetings
- Track attendance for group members
- Log interactions with group members
- Approve membership requests for their group
- Monitor group performance

#### Cell Leader

- Create and manage cell meetings
- Track attendance for cell members
- Log interactions with cell members
- Approve membership requests for their cell
- Monitor cell performance

#### Member

- Maintain personal profile information
- Request to join or change groups/cells
- Participate in meetings
- View personal participation history
- Access personal analytics

### Leadership Reporting System

#### CEO (Superadmin)

- View all reports across the organization
- Access comprehensive analytics dashboard
- Configure strategic indicators and key metrics
- Manage report templates
- Generate referral links for all roles
- Override any approval or deadline
- Export church-wide reports
- Monitor submission compliance

#### SPO (Senior Pastor Officer)

- Review all group-level reports
- Access church-wide analytics
- Mark reports as finalized
- Generate referral links for leadership
- Export performance reports
- Monitor zone and campus performance

#### Church Ministry

- Central repository for all reports
- Review and store all submitted reports
- Access complete audit trails
- Generate compliance reports
- Support report resolution
- Manage historical report data

#### Group Pastor (Zonal Leader)

- Review all campus reports within their zone
- Approve zone-level consolidated reports
- Mark campus reports as reviewed
- Access zone analytics dashboard
- Generate referral links for Campus Pastors and Admins
- Monitor zone submission compliance

#### Group Admin

- Consolidate reports from multiple campuses
- Submit group-level reports
- View group performance analytics
- Generate referral links for campus level
- Export group reports

#### Campus Pastor (Campus Admin)

- Review reports from all departments in campus
- Approve or request edits on campus reports
- Add feedback and comments to reports
- Access campus analytics dashboard
- Generate referral links for HODs
- Monitor campus submission rates

#### Campus Admin (HOD)

- Submit weekly reports for their department
- Enter metric values (goals and achieved)
- Edit reports until approved or deadline
- View department performance metrics
- Respond to edit requests from reviewers
- Access department-level analytics

## Data Privacy & Compliance

- Respect user privacy in all features
- Implement proper data access controls
- Ensure leaders can only access their group's data
- Provide members control over their data
- Implement audit logs for sensitive operations
- Follow church data protection policies
