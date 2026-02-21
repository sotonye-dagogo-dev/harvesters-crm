import { NextRequest } from "next/server";
import { cellDb, userDb, groupDb } from "@/lib/data/database";
import { successResponse, handleApiError, badRequestResponse } from "@/lib/utils/api";
import { UserRole } from "@/lib/types";

/**
 * GET /api/cells/search-by-leader
 * Public endpoint (no auth) — used during registration so users can
 * find a cell by typing their cell leader's name.
 *
 * Query params:
 *   - query (required): partial first/last name of a cell leader
 *
 * Returns up to 10 matching cells with leader info and parent group name.
 */
export async function GET(request: NextRequest) {
    try {
        const query = request.nextUrl.searchParams.get("query")?.trim();

        if (!query || query.length < 2) {
            return badRequestResponse("Search query must be at least 2 characters");
        }

        const q = query.toLowerCase();

        // Find all users who are CELL_LEADERs and match the query by name
        const matchingLeaders = userDb.findAll({ role: UserRole.CELL_LEADER }).filter(
            (u) =>
                u.firstName.toLowerCase().includes(q) ||
                u.lastName.toLowerCase().includes(q) ||
                `${u.firstName} ${u.lastName}`.toLowerCase().includes(q)
        );

        // Also find SMALL_GROUP_LEADERs (they lead groups, sometimes also relevant)
        const matchingSGLeaders = userDb.findAll({ role: UserRole.SMALL_GROUP_LEADER }).filter(
            (u) =>
                u.firstName.toLowerCase().includes(q) ||
                u.lastName.toLowerCase().includes(q) ||
                `${u.firstName} ${u.lastName}`.toLowerCase().includes(q)
        );

        // Build results: cells led by matching cell leaders
        const cellResults = matchingLeaders.flatMap((leader) => {
            const leaderCells = cellDb.findAll({ leaderId: leader.id, isActive: true });
            return leaderCells.map((cell) => {
                const parentGroup = groupDb.findById(cell.groupId);
                return {
                    type: "cell" as const,
                    id: cell.id,
                    name: cell.name,
                    description: cell.description,
                    memberCount: cell.memberCount,
                    meetingFrequency: cell.meetingFrequency,
                    parentGroupName: parentGroup?.name || "Unknown Group",
                    leader: {
                        id: leader.id,
                        name: `${leader.firstName} ${leader.lastName}`,
                    },
                };
            });
        });

        // Build results: groups led by matching small group leaders
        const groupResults = matchingSGLeaders.flatMap((leader) => {
            const leaderGroups = groupDb.findAll({ leaderId: leader.id });
            return leaderGroups.map((group) => ({
                type: "group" as const,
                id: group.id,
                name: group.name,
                description: group.description,
                memberCount: group.memberCount,
                meetingFrequency: group.meetingFrequency,
                parentGroupName: null,
                leader: {
                    id: leader.id,
                    name: `${leader.firstName} ${leader.lastName}`,
                },
            }));
        });

        // Combine and limit to 10
        const results = [...cellResults, ...groupResults].slice(0, 10);

        return successResponse({
            results,
            totalResults: results.length,
            query,
        });
    } catch (error) {
        return handleApiError(error);
    }
}
