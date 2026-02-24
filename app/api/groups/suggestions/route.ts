import { NextRequest } from "next/server";
import { db } from "@/lib/data/database";
import { successResponse, handleApiError } from "@/lib/utils/api";

// GET /api/groups/suggestions - Get group suggestions based on user preferences
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get("location");
    const interests =
      searchParams.get("interests")?.split(",").filter(Boolean) || [];
    const campus = searchParams.get("campus");

    const allGroups = db.groups.findAll();

    // Score each group based on matching criteria
    const scoredGroups = allGroups.map((group) => {
      let score = 0;
      const reasons: string[] = [];

      // Get group members to analyze
      const members = db.users.findAll({ groupId: group.id });

      // Location matching (highest priority)
      if (location) {
        const locationMatches = members.filter((m) =>
          m.location?.toLowerCase().includes(location.toLowerCase())
        ).length;

        if (locationMatches > 0) {
          const locationScore = Math.min(locationMatches * 2, 10);
          score += locationScore;
          reasons.push(`${locationMatches} members in ${location}`);
        }
      }

      // Campus matching
      if (campus) {
        const campusMatches = members.filter((m) =>
          m.campusId?.toLowerCase().includes(campus.toLowerCase())
        ).length;

        if (campusMatches > 0) {
          const campusScore = Math.min(campusMatches * 1.5, 8);
          score += campusScore;
          reasons.push(`${campusMatches} members from ${campus} campus`);
        }
      }

      // Interest matching
      if (interests.length > 0) {
        let totalInterestMatches = 0;

        members.forEach((member) => {
          const memberInterests = member.interests || [];
          const matchingInterests = memberInterests.filter((interest) =>
            interests.includes(interest)
          );
          totalInterestMatches += matchingInterests.length;
        });

        if (totalInterestMatches > 0) {
          const interestScore = Math.min(totalInterestMatches, 7);
          score += interestScore;
          reasons.push(`${totalInterestMatches} shared interests`);
        }
      }

      // Boost groups that need members (smaller groups get slight boost)
      if (group.memberCount < 10) {
        score += 2;
        reasons.push("Small, growing group");
      }

      // Get leader info
      const leader = db.users.findById(group.leaderId);

      return {
        id: group.id,
        name: group.name,
        description: group.description,
        memberCount: group.memberCount,
        meetingFrequency: group.meetingFrequency,
        leader: leader
          ? {
              id: leader.id,
              name: `${leader.firstName} ${leader.lastName}`,
              email: leader.email,
            }
          : null,
        score,
        matchReasons: reasons,
      };
    });

    // Sort by score (highest first) and filter out groups with score 0
    const suggestions = scoredGroups
      .filter((g) => g.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5); // Return top 5 suggestions

    // If no matches found, return all groups as alternatives
    const alternatives =
      suggestions.length === 0
        ? allGroups.slice(0, 5).map((group) => {
            const leader = db.users.findById(group.leaderId);
            return {
              id: group.id,
              name: group.name,
              description: group.description,
              memberCount: group.memberCount,
              meetingFrequency: group.meetingFrequency,
              leader: leader
                ? {
                    id: leader.id,
                    name: `${leader.firstName} ${leader.lastName}`,
                    email: leader.email,
                  }
                : null,
              score: 0,
              matchReasons: ["Available group"],
            };
          })
        : [];

    return successResponse({
      suggestions: suggestions.length > 0 ? suggestions : alternatives,
      totalGroups: allGroups.length,
      hasMatches: suggestions.length > 0,
      criteria: {
        location,
        interests,
        campus,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
