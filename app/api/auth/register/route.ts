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
import {
  groupDb,
  cellDb,
  inviteLinkDb,
  inviteLinkVisitDb,
} from "@/lib/data/database";

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
    let resolvedInviteLinkId: string | undefined;

    if (data.referralCode) {
      // ── Referral link-based registration (FR49, FR50, FR57, FR58) ──────
      const link = inviteLinkDb.findByCode(data.referralCode);

      if (!link) {
        return badRequestResponse("Invalid referral code");
      }

      // Check if link is active
      if (!link.isActive) {
        return badRequestResponse("This referral link is no longer active");
      }

      // Check expiry
      if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
        return badRequestResponse("This referral link has expired");
      }

      // FR57/FR58: Check max uses (single-use by default if maxUses is 1)
      if (link.maxUses && link.conversionCount >= link.maxUses) {
        return badRequestResponse(
          "This referral link has already been used the maximum number of times"
        );
      }

      inviteValid = true;
      resolvedInviteLinkId = link.id;

      // FR50: Auto-assign role from the link
      if (link.assignRole) {
        assignedRole = link.assignRole;
      }

      // Resolve organizational context from the link's target
      switch (link.type) {
        case "CAMPUS": {
          assignedCampusId = link.targetId;
          break;
        }
        case "ZONE": {
          assignedZoneId = link.targetId;
          break;
        }
        case "DEPARTMENT": {
          assignedDepartmentId = link.targetId;
          break;
        }
        case "SMALL_GROUP": {
          const group = groupDb.findById(link.targetId);
          if (group) {
            assignedGroupId = group.id;
            assignedCampusId = group.campusId;
            assignedZoneId = group.zoneId;
            assignedDepartmentId = group.departmentId;
          }
          break;
        }
        case "CELL": {
          const cell = cellDb.findById(link.targetId);
          if (cell) {
            assignedCellId = cell.id;
            assignedGroupId = cell.groupId;
            assignedCampusId = cell.campusId;
            assignedZoneId = cell.zoneId;
            assignedDepartmentId = cell.departmentId;
          }
          break;
        }
      }

      // Inherit remaining context from inviter
      const inviter = userDb.findById(link.createdById);
      if (inviter) {
        if (!assignedCampusId) assignedCampusId = inviter.campusId;
        if (!assignedZoneId) assignedZoneId = inviter.zoneId;
        if (!assignedDepartmentId)
          assignedDepartmentId = inviter.departmentId;
      }
    } else if (data.inviteCode) {
      // ── Legacy group/cell invite code registration ─────────────────────
      if (data.groupId) {
        const group = groupDb.findById(data.groupId);

        if (group && group.inviteCode === data.inviteCode) {
          inviteValid = true;
          assignedGroupId = group.id;
          assignedCampusId = group.campusId;
          assignedZoneId = group.zoneId;
          assignedDepartmentId = group.departmentId;

          if (
            data.inviteType === UserRole.SMALL_GROUP_LEADER ||
            !group.leaderId
          ) {
            assignedRole = UserRole.SMALL_GROUP_LEADER;
          }
        } else {
          return badRequestResponse("Invalid invite code for group");
        }
      } else if (data.cellId) {
        const cell = cellDb.findById(data.cellId);

        if (cell && cell.inviteCode === data.inviteCode) {
          inviteValid = true;
          assignedCellId = cell.id;
          assignedGroupId = cell.groupId;
          assignedCampusId = cell.campusId;
          assignedZoneId = cell.zoneId;
          assignedDepartmentId = cell.departmentId;

          if (
            data.inviteType === UserRole.SMALL_GROUP_LEADER ||
            !cell.leaderId
          ) {
            assignedRole = UserRole.CELL_LEADER;
          }
        } else {
          return badRequestResponse("Invalid invite code for cell");
        }
      } else {
        const inviter = userDb.findByInviteCode(data.inviteCode);
        if (inviter) {
          inviteValid = true;
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

    // ── Track referral conversion (FR57/FR58) ────────────────────────────
    if (resolvedInviteLinkId) {
      // Increment conversion count on the link
      inviteLinkDb.incrementConversion(resolvedInviteLinkId);

      // Find the most recent visit for this link and mark as converted
      const visits = inviteLinkVisitDb.findAll({
        inviteLinkId: resolvedInviteLinkId,
      });
      const latestUnconverted = visits
        .filter((v) => !v.converted)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0];

      if (latestUnconverted) {
        inviteLinkVisitDb.markConverted(latestUnconverted.id, newUser.id);
      }

      // FR58: If the link is single-use (maxUses === 1), deactivate it
      const updatedLink = inviteLinkDb.findById(resolvedInviteLinkId);
      if (
        updatedLink &&
        updatedLink.maxUses &&
        updatedLink.conversionCount >= updatedLink.maxUses
      ) {
        inviteLinkDb.update(resolvedInviteLinkId, { isActive: false });
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
