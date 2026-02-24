import { NextRequest } from "next/server";
import { InteractionType } from "@/lib/types";
import {
  interactionDb,
  userDb,
  groupDb,
  cellDb,
  campusDb,
  zoneDb,
  departmentDb,
} from "@/lib/data/database";
import { getAuthenticatedUser } from "@/lib/utils/middleware";
import { createInteractionSchema } from "@/lib/utils/validation";
import {
  successResponse,
  forbiddenResponse,
  badRequestResponse,
  handleApiError,
} from "@/lib/utils/api";

// GET /api/interactions - List interactions with hierarchy filtering
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") as InteractionType | null;
    const memberId = searchParams.get("memberId");
    const leaderId = searchParams.get("leaderId");
    const groupId = searchParams.get("groupId");
    const cellId = searchParams.get("cellId");
    const campusId = searchParams.get("campusId");
    const zoneId = searchParams.get("zoneId");
    const departmentId = searchParams.get("departmentId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Build filter based on user role and hierarchy
    const filter: Record<string, unknown> = {};

    if (type) filter.type = type;

    // SUPERADMIN - Can see all interactions
    if (user?.role === "SUPERADMIN") {
      if (memberId) filter.memberId = memberId;
      if (leaderId) filter.leaderId = leaderId;
      if (groupId) filter.groupId = groupId;
      if (cellId) filter.cellId = cellId;
      if (campusId) filter.campusId = campusId;
      if (zoneId) filter.zoneId = zoneId;
      if (departmentId) filter.departmentId = departmentId;
    }
    // ZONAL_LEADER - See interactions in their zone
    else if (user?.role === "ZONAL_LEADER") {
      filter.zoneId = user.zoneId;
      if (campusId) {
        const campus = campusDb.findById(campusId);
        if (campus?.parentId === user.zoneId) {
          filter.campusId = campusId;
        }
      }
      if (departmentId) {
        const department = departmentDb.findById(departmentId);
        const campus = department?.campusId
          ? campusDb.findById(department.campusId)
          : null;
        if (campus?.parentId === user.zoneId) {
          filter.departmentId = departmentId;
        }
      }
      if (groupId) {
        const group = groupDb.findById(groupId);
        const campus = group?.campusId
          ? campusDb.findById(group.campusId)
          : null;
        if (campus?.parentId === user.zoneId) {
          filter.groupId = groupId;
        }
      }
      if (cellId) {
        const cell = cellDb.findById(cellId);
        const group = cell?.groupId ? groupDb.findById(cell.groupId) : null;
        const campus = group?.campusId
          ? campusDb.findById(group.campusId)
          : null;
        if (campus?.parentId === user.zoneId) {
          filter.cellId = cellId;
        }
      }
      if (memberId) {
        const member = userDb.findById(memberId);
        if (member?.zoneId === user.zoneId) {
          filter.memberId = memberId;
        }
      }
      if (leaderId) {
        const leader = userDb.findById(leaderId);
        if (leader?.zoneId === user.zoneId) {
          filter.leaderId = leaderId;
        }
      }
    }
    // CAMPUS_ADMIN - See interactions in their campus
    else if (user?.role === "CAMPUS_ADMIN") {
      filter.campusId = user.campusId;
      if (departmentId) {
        const department = departmentDb.findById(departmentId);
        if (department?.campusId === user.campusId) {
          filter.departmentId = departmentId;
        }
      }
      if (groupId) {
        const group = groupDb.findById(groupId);
        if (group?.campusId === user.campusId) {
          filter.groupId = groupId;
        }
      }
      if (cellId) {
        const cell = cellDb.findById(cellId);
        const group = cell?.groupId ? groupDb.findById(cell.groupId) : null;
        if (group?.campusId === user.campusId) {
          filter.cellId = cellId;
        }
      }
      if (memberId) {
        const member = userDb.findById(memberId);
        if (member?.campusId === user.campusId) {
          filter.memberId = memberId;
        }
      }
      if (leaderId) {
        const leader = userDb.findById(leaderId);
        if (leader?.campusId === user.campusId) {
          filter.leaderId = leaderId;
        }
      }
    }
    // HOD - See interactions in their department
    else if (user?.role === "HOD") {
      filter.departmentId = user.departmentId;
      if (groupId) {
        const group = groupDb.findById(groupId);
        if (group?.departmentId === user.departmentId) {
          filter.groupId = groupId;
        }
      }
      if (cellId) {
        const cell = cellDb.findById(cellId);
        const group = cell?.groupId ? groupDb.findById(cell.groupId) : null;
        if (group?.departmentId === user.departmentId) {
          filter.cellId = cellId;
        }
      }
      if (memberId) {
        const member = userDb.findById(memberId);
        if (member?.departmentId === user.departmentId) {
          filter.memberId = memberId;
        }
      }
      if (leaderId) {
        const leader = userDb.findById(leaderId);
        if (leader?.departmentId === user.departmentId) {
          filter.leaderId = leaderId;
        }
      }
    }
    // SMALL_GROUP_LEADER - See interactions in their group
    else if (user?.role === "SMALL_GROUP_LEADER") {
      filter.groupId = user.groupId;
      if (cellId) {
        const cell = cellDb.findById(cellId);
        if (cell?.groupId === user.groupId) {
          filter.cellId = cellId;
        }
      }
      if (memberId) {
        const member = userDb.findById(memberId);
        if (member?.groupId === user.groupId) {
          filter.memberId = memberId;
        }
      }
    }
    // CELL_LEADER - See interactions in their cell
    else if (user?.role === "CELL_LEADER") {
      filter.cellId = user.cellId;
      if (memberId) {
        const member = userDb.findById(memberId);
        if (member?.cellId === user.cellId) {
          filter.memberId = memberId;
        }
      }
    }
    // MEMBER - See only their own interactions
    else {
      filter.memberId = user?.id;
    }

    const allInteractions = interactionDb.findAll(filter);
    const total = allInteractions.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const interactions = allInteractions.slice(offset, offset + limit);

    // Enrich with member, leader, group, cell details
    const enrichedInteractions = interactions.map((interaction) => {
      const member = userDb.findById(interaction.memberId);
      const leader = userDb.findById(interaction.leaderId);
      const group = interaction.groupId
        ? groupDb.findById(interaction.groupId)
        : null;
      const cell = interaction.cellId
        ? cellDb.findById(interaction.cellId)
        : null;
      const campus = interaction.campusId
        ? campusDb.findById(interaction.campusId)
        : null;
      const zone = interaction.zoneId
        ? zoneDb.findById(interaction.zoneId)
        : null;
      const department = interaction.departmentId
        ? departmentDb.findById(interaction.departmentId)
        : null;

      return {
        ...interaction,
        member: member
          ? {
              id: member.id,
              firstName: member.firstName,
              lastName: member.lastName,
              email: member.email,
            }
          : null,
        leader: leader
          ? {
              id: leader.id,
              firstName: leader.firstName,
              lastName: leader.lastName,
            }
          : null,
        group: group
          ? {
              id: group.id,
              name: group.name,
            }
          : null,
        cell: cell
          ? {
              id: cell.id,
              name: cell.name,
            }
          : null,
        campus: campus
          ? {
              id: campus.id,
              name: campus.name,
            }
          : null,
        zone: zone
          ? {
              id: zone.id,
              name: zone.name,
            }
          : null,
        department: department
          ? {
              id: department.id,
              name: department.name,
            }
          : null,
      };
    });

    return successResponse({
      interactions: enrichedInteractions,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/interactions - Create interaction with hierarchy context
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error) return error;

    const body = await request.json();

    // Validate input
    const validation = createInteractionSchema.safeParse(body);
    if (!validation.success) {
      return badRequestResponse("Invalid input data");
    }

    // Only leadership roles can create interactions (not MEMBER)
    if (user?.role === "MEMBER") {
      return forbiddenResponse(
        "You don't have permission to create interactions"
      );
    }

    // Verify member exists
    const member = userDb.findById(validation.data.memberId);
    if (!member) {
      return badRequestResponse("Member not found");
    }

    // ZONAL_LEADER - Can create interactions for members in their zone
    if (user.role === "ZONAL_LEADER") {
      if (member.zoneId !== user.zoneId) {
        return forbiddenResponse(
          "You can only create interactions for members in your zone"
        );
      }
    }
    // CAMPUS_ADMIN - Can create interactions for members in their campus
    else if (user.role === "CAMPUS_ADMIN") {
      if (member.campusId !== user.campusId) {
        return forbiddenResponse(
          "You can only create interactions for members in your campus"
        );
      }
    }
    // HOD - Can create interactions for members in their department
    else if (user.role === "HOD") {
      if (member.departmentId !== user.departmentId) {
        return forbiddenResponse(
          "You can only create interactions for members in your department"
        );
      }
    }
    // SMALL_GROUP_LEADER - Can create interactions for members in their group
    else if (user.role === "SMALL_GROUP_LEADER") {
      if (member.groupId !== user.groupId) {
        return forbiddenResponse(
          "You can only create interactions for members in your group"
        );
      }
    }
    // CELL_LEADER - Can create interactions for members in their cell
    else if (user.role === "CELL_LEADER") {
      if (member.cellId !== user.cellId) {
        return forbiddenResponse(
          "You can only create interactions for members in your cell"
        );
      }
    }

    // Inherit hierarchy context from the member
    const interactionData = {
      leaderId: user.id,
      ...validation.data,
      type: validation.data.type as InteractionType,
      timestamp: validation.data.timestamp || new Date().toISOString(),
      groupId: member.groupId,
      cellId: member.cellId,
      campusId: member.campusId,
      zoneId: member.zoneId,
      departmentId: member.departmentId,
    };

    // Create interaction
    const interaction = interactionDb.create(interactionData);

    return successResponse(
      interaction,
      "Interaction created successfully",
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}
