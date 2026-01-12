# Known Issues and Fixes Required

## Status: Partially Fixed

Phase 3 and 4 are functionally complete but there are remaining TypeScript errors that need to be addressed before the application can compile successfully.

## Issues Fixed ✅

1. ✅ Added `Gender` enum to types.ts
2. ✅ Added `forceConsistentCasingInFileNames` to tsconfig.json
3. ✅ Fixed `ZodError.errors` to `ZodError.issues`
4. ✅ Added `verifyToken` export as alias to `verifyAccessToken`
5. ✅ Added `updateUserSchema` with `groupId`, `isActive`, and `role` properties
6. ✅ Fixed enum type casting in register route (maritalStatus, employmentStatus)
7. ✅ Fixed database create() calls to pass correct number of arguments:
   - `meetingDb.create(data, createdById)`
   - `interactionDb.create(data, leaderId)`
   - `membershipRequestDb.create(data, memberId)`
8. ✅ Fixed enum casts in groups route (MeetingFrequency)
9. ✅ Fixed enum casts in interactions route (InteractionType)
10. ✅ Removed unused imports and variables

## Remaining Issues to Fix 🔧

### 1. Membership Request Property Names

**Problem**: The MembershipRequest interface uses `memberId` but code uses `requestedById`, uses `toGroupId` but code uses `groupId`.

**Files Affected**:
- `app/api/membership-requests/[id]/route.ts`
- `app/api/membership-requests/[id]/process/route.ts`

**Fix**: Replace all occurrences:
- `request.requestedById` → `request.memberId`
- `request.groupId` → `request.toGroupId`
- `membershipRequest.requestedById` → `membershipRequest.memberId`
- `membershipRequest.groupId` → `membershipRequest.toGroupId`

### 2. Membership Request Process Route - Wrong Method

**Problem**: Using `membershipRequestDb.update()` which doesn't exist. Should use `membershipRequestDb.respond()`.

**File**: `app/api/membership-requests/[id]/process/route.ts`

**Current Code** (line ~62):
```typescript
const updatedRequest = membershipRequestDb.update(id, {
  status: newStatus,
  processedById: user?.id,
  processedAt: new Date().toISOString(),
  notes,
});
```

**Should Be**:
```typescript
const updatedRequest = membershipRequestDb.respond(
  id,
  {
    status: newStatus,
    responseMessage: notes,
  },
  user!.id
);
```

### 3. Meeting Attendance System Not Implemented

**Problem**: The Meeting interface doesn't have an `attendance` array property. The current design uses `attendeeIds` and `attendeeCount` for simple tracking, but the attendance endpoints try to use a non-existent `attendance` property with status tracking.

**Files Affected**:
- `app/api/meetings/[id]/attendance/route.ts`
- All analytics routes that reference `meeting.attendance`

**Options**:
1. **Remove attendance tracking endpoints** (quickest fix)
2. **Add Attendance model** to track individual attendance records properly
3. **Simplify to use existing attendeeIds** array

**Recommended Fix** (Option 2 - matches PRD requirements):

Add to `lib/types.ts`:
```typescript
interface AttendanceRecord {
  memberId: string;
  status: "PRESENT" | "ABSENT" | "EXCUSED";
  notes?: string;
}

// Update Meeting interface to include:
interface Meeting {
  // ... existing properties ...
  attendance: AttendanceRecord[];
}
```

Update `updateMeetingSchema` in validation.ts to accept attendance:
```typescript
export const updateMeetingSchema = z.object({
  // ... existing fields ...
  attendance: z.array(z.object({
    memberId: z.string(),
    status: z.enum(["PRESENT", "ABSENT", "EXCUSED"]),
    notes: z.string().optional(),
  })).optional(),
});
```

### 4. Analytics Routes Using Wrong Property Names

**Problem**: Analytics routes reference properties that don't exist on Meeting or Interaction types:
- `meeting.title` (doesn't exist, meetings have no titles)
- `meeting.meetingDate` (should be `meeting.date`)
- `interaction.date` (should be `interaction.timestamp`)
- `user.status` and `group.status` (don't exist in current schema)

**Files Affected**:
- `app/api/analytics/overview/route.ts`
- `app/api/analytics/groups/[id]/route.ts`
- `app/api/analytics/members/[id]/route.ts`

**Fixes Needed**:
Replace in all analytics files:
- `meeting.meetingDate` → `meeting.date`
- Remove references to `meeting.title` (just use meeting.id or meeting.date for identification)
- `interaction.date` → `interaction.timestamp`
- Remove `user.status` and `group.status` checks (or add status property to User and Group interfaces)

### 5. UpdateUserInput Missing Properties

**Problem**: Routes try to update `groupId` and `isActive` on users, but `updateUserSchema` exports these as part of `UpdateUserInput`.

**Fix**: Already fixed by adding `updateUserSchema` that extends `updateProfileSchema` with these properties. Routes should import and use `updateUserSchema` instead of casting.

### 6. Unused Variables and Imports

**Files with warnings**:
- `lib/data/mockData.ts` - `generateId` function declared but not used (can remove or ignore)
- Various routes - unused imports (cleaned up most, some may remain)

## Quick Fix Script

To get the app compiling quickly, you can:

1. **Comment out attendance endpoints** temporarily:
   - Comment out entire `app/api/meetings/[id]/attendance/route.ts` file
   
2. **Fix membership request property names** with find-replace:
   - Find: `request.requestedById` → Replace: `request.memberId`
   - Find: `request.groupId` → Replace: `request.toGroupId`
   - Find: `membershipRequest.requestedById` → Replace: `membershipRequest.memberId`
   - Find: `membershipRequest.groupId` → Replace: `membershipRequest.toGroupId`

3. **Fix process route** to use `respond()` method instead of `update()`

4. **Comment out problematic analytics calculations** temporarily in analytics routes

## Priority Order

1. **High Priority** (Prevents compilation):
   - Fix membership request property names
   - Fix process route to use respond()
   - Fix or comment out attendance route

2. **Medium Priority** (Causes type errors but app may run):
   - Fix analytics property names
   - Add attendance tracking properly

3. **Low Priority** (Warnings only):
   - Remove unused variables
   - Clean up remaining unused imports

## Testing After Fixes

Once all compilation errors are fixed:

1. Run `npm run dev` to ensure app compiles
2. Test auth flow:
   - Register a new user
   - Login with existing user
   - Logout
3. Test API endpoints with tools like Postman or Thunder Client
4. Verify role-based access works correctly

---

**Note**: The core architecture is sound. These are implementation details that need alignment between the type definitions and the API route implementations. Once fixed, the application will be fully functional for Phase 5 UI development.
