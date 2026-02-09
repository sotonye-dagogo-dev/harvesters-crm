import { NextRequest } from "next/server";
import { UserRole, MaritalStatus, EmploymentStatus } from "@/lib/types";
import { userDb } from "@/lib/data/database";
import { registerSchema } from "@/lib/utils/validation";
import {
  hashPassword,
  generateTokens,
  setAuthCookies,
  userToAuthUser,
} from "@/lib/utils/auth";
import {
  successResponse,
  badRequestResponse,
  conflictResponse,
  handleApiError,
} from "@/lib/utils/api";
import { groupDb, cellDb } from "@/lib/data/database";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors;
      const errorMessage =
        Object.values(errors).flat()[0] || "Invalid input data";
      return badRequestResponse(errorMessage);
    }

    const data = validation.data;

    // Check if user already exists
    const existingUser = userDb.findByEmail(data.email);
    if (existingUser) {
      return conflictResponse("User with this email already exists");
    }

    // Handle invite code if provided
    let assignedGroupId = data.groupId;
    let assignedCellId = data.cellId;
    let assignedCampusId = data.campusId;
    let assignedZoneId = data.zoneId;
    let assignedDepartmentId = data.departmentId;
    let assignedRole: UserRole = UserRole.MEMBER;
    let inviteValid = false;

    if (data.inviteCode) {
      // Check if invite code is for a group
      if (data.groupId) {
        const group = groupDb.findById(data.groupId);

        if (group && group.inviteCode === data.inviteCode) {
          inviteValid = true;
          assignedGroupId = group.id;
          assignedCampusId = group.campusId;
          assignedZoneId = group.zoneId;
          assignedDepartmentId = group.departmentId;

          // Check if this is a leader invite OR if the group has no leader
          if (
            data.inviteType === UserRole.SMALL_GROUP_LEADER ||
            !group.leaderId
          ) {
            assignedRole = UserRole.SMALL_GROUP_LEADER;
          }
        } else {
          return badRequestResponse("Invalid invite code for group");
        }
      }
      // Check if invite code is for a cell
      else if (data.cellId) {
        const cell = cellDb.findById(data.cellId);

        if (cell && cell.inviteCode === data.inviteCode) {
          inviteValid = true;
          assignedCellId = cell.id;
          assignedGroupId = cell.groupId;
          assignedCampusId = cell.campusId;
          assignedZoneId = cell.zoneId;
          assignedDepartmentId = cell.departmentId;

          // Check if this is a leader invite OR if the cell has no leader
          if (
            data.inviteType === UserRole.SMALL_GROUP_LEADER ||
            !cell.leaderId
          ) {
            assignedRole = UserRole.CELL_LEADER;
          }
        } else {
          return badRequestResponse("Invalid invite code for cell");
        }
      }
      // Check if it's a user invite code
      else {
        const inviter = userDb.findByInviteCode(data.inviteCode);
        if (inviter) {
          inviteValid = true;
          // Inherit organizational context from inviter
          assignedCampusId = inviter.campusId;
          assignedZoneId = inviter.zoneId;
          assignedDepartmentId = inviter.departmentId;
          assignedGroupId = inviter.groupId;
          assignedCellId = inviter.cellId;
        } else {
          return badRequestResponse("Invalid invite code");
        }
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    // Create user with all required fields
    const newUser = userDb.create({
      email: data.email,
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      whatsappPhone: data.whatsappPhone || data.phone,
      location: data.address,
      age: undefined,
      maritalStatus: data.maritalStatus as MaritalStatus,
      employmentStatus: data.employmentStatus as EmploymentStatus,
      interests: data.interests || [],
      groupId: inviteValid ? assignedGroupId : data.groupId,
      cellId: inviteValid ? assignedCellId : data.cellId,
      campusId: inviteValid ? assignedCampusId : data.campusId,
      zoneId: inviteValid ? assignedZoneId : data.zoneId,
      departmentId: inviteValid ? assignedDepartmentId : data.departmentId,
      invitedById: data.invitedById,
      role: assignedRole,
      isActive: true,
    });

    // If user should be made leader, update the group/cell
    if (
      inviteValid &&
      assignedRole === "SMALL_GROUP_LEADER" &&
      assignedGroupId
    ) {
      const group = groupDb.findById(assignedGroupId);
      if (group && !group.leaderId) {
        groupDb.update(assignedGroupId, { leaderId: newUser.id });
      }
    }

    if (inviteValid && assignedRole === "CELL_LEADER" && assignedCellId) {
      const cell = cellDb.findById(assignedCellId);
      if (cell && !cell.leaderId) {
        cellDb.update(assignedCellId, { leaderId: newUser.id });
      }
    }

    // Generate tokens
    const authUser = userToAuthUser(newUser);
    const tokens = generateTokens(authUser);

    // Set cookies
    await setAuthCookies(tokens);

    // Return user without password
    return successResponse(
      {
        user: authUser,
        tokens,
      },
      "Registration successful",
      201
    );
  } catch (error) {
    console.error("Registration error:", error);
    return handleApiError(error);
  }
}
