import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/data/database";
import { verifyToken } from "@/lib/utils/auth";
import { cookies } from "next/headers";

// GET /api/analytics/interests - Get interest-based insights
export async function GET(_request: NextRequest) {
  try {
    // Verify authentication
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.success) {
      return NextResponse.json(
        {
          error:
            decoded && !decoded.success ? decoded.message : "Invalid token",
        },
        { status: 401 }
      );
    }

    const user = db.users.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Only superadmins can access church-wide interest insights
    if (user.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get all active users
    const allUsers = db.users.findAll({ isActive: true });
    const allGroups = db.groups.findAll();

    // Calculate interest distribution
    const interestCount: Record<string, number> = {};
    const interestUsers: Record<string, User[]> = {};

    allUsers.forEach((u) => {
      if (u.interests && u.interests.length > 0) {
        u.interests.forEach((interest) => {
          interestCount[interest] = (interestCount[interest] || 0) + 1;
          if (!interestUsers[interest]) {
            interestUsers[interest] = [];
          }
          interestUsers[interest].push(u);
        });
      }
    });

    // Sort interests by frequency
    const interestDistribution = Object.entries(interestCount)
      .map(([interest, count]) => ({
        interest,
        count,
        percentage: Math.round((count / allUsers.length) * 100 * 10) / 10,
      }))
      .sort((a, b) => b.count - a.count);

    // Calculate demographic insights by interest
    const interestDemographics = Object.entries(interestUsers).map(
      ([interest, users]) => {
        // Age distribution
        const ageGroups = {
          "18-25": 0,
          "26-35": 0,
          "36-45": 0,
          "46-55": 0,
          "56+": 0,
          unknown: 0,
        };

        users.forEach((u) => {
          if (!u.age) {
            ageGroups.unknown++;
          } else if (u.age >= 18 && u.age <= 25) {
            ageGroups["18-25"]++;
          } else if (u.age >= 26 && u.age <= 35) {
            ageGroups["26-35"]++;
          } else if (u.age >= 36 && u.age <= 45) {
            ageGroups["36-45"]++;
          } else if (u.age >= 46 && u.age <= 55) {
            ageGroups["46-55"]++;
          } else {
            ageGroups["56+"]++;
          }
        });

        // Marital status distribution
        const maritalStatus = users.reduce(
          (acc, u) => {
            const status = u.maritalStatus || "unknown";
            acc[status] = (acc[status] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        );

        // Employment status distribution
        const employmentStatus = users.reduce(
          (acc, u) => {
            const status = u.employmentStatus || "unknown";
            acc[status] = (acc[status] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        );

        // Group distribution
        const groupDistribution = users.reduce(
          (acc, u) => {
            if (u.groupId) {
              const group = allGroups.find((g) => g.id === u.groupId);
              if (group) {
                acc[group.name] = (acc[group.name] || 0) + 1;
              }
            } else {
              acc["No Group"] = (acc["No Group"] || 0) + 1;
            }
            return acc;
          },
          {} as Record<string, number>
        );

        return {
          interest,
          totalMembers: users.length,
          ageGroups,
          maritalStatus,
          employmentStatus,
          groupDistribution,
        };
      }
    );

    // Calculate group affinity scores (how well interests match within groups)
    const groupAffinityScores = allGroups.map((group) => {
      const groupMembers = allUsers.filter((u) => u.groupId === group.id);

      if (groupMembers.length < 2) {
        return {
          groupId: group.id,
          groupName: group.name,
          memberCount: groupMembers.length,
          affinityScore: 0,
          commonInterests: [],
        };
      }

      // Find common interests
      const interestCounts: Record<string, number> = {};
      groupMembers.forEach((member) => {
        member.interests?.forEach((interest) => {
          interestCounts[interest] = (interestCounts[interest] || 0) + 1;
        });
      });

      // Calculate affinity score (percentage of members sharing at least one interest)
      const totalInterests = Object.keys(interestCounts).length;
      const avgInterestsPerMember =
        totalInterests > 0 ? totalInterests / groupMembers.length : 0;
      const affinityScore = Math.round(avgInterestsPerMember * 100);

      // Get most common interests (shared by at least 30% of group)
      const threshold = Math.max(Math.ceil(groupMembers.length * 0.3), 2);
      const commonInterests = Object.entries(interestCounts)
        .filter(([_, count]) => count >= threshold)
        .map(([interest, count]) => ({
          interest,
          count,
          percentage: Math.round((count / groupMembers.length) * 100),
        }))
        .sort((a, b) => b.count - a.count);

      return {
        groupId: group.id,
        groupName: group.name,
        memberCount: groupMembers.length,
        affinityScore,
        commonInterests,
      };
    });

    // Find members who might benefit from group change (interest mismatch)
    const memberSuggestions = allUsers
      .filter(
        (u) => u.role === "MEMBER" && u.interests && u.interests.length > 0
      )
      .map((member) => {
        const currentGroup = allGroups.find((g) => g.id === member.groupId);

        // Calculate match score with each group
        const groupScores = allGroups
          .filter((g) => g.id !== member.groupId)
          .map((group) => {
            const groupMembers = allUsers.filter((u) => u.groupId === group.id);

            // Calculate interest overlap
            let matchingInterests = 0;
            const groupInterests = new Set<string>();

            groupMembers.forEach((gm) => {
              gm.interests?.forEach((i) => groupInterests.add(i));
            });

            member.interests?.forEach((interest) => {
              if (groupInterests.has(interest)) {
                matchingInterests++;
              }
            });

            const matchScore = member.interests
              ? Math.round((matchingInterests / member.interests.length) * 100)
              : 0;

            return {
              groupId: group.id,
              groupName: group.name,
              matchScore,
              matchingInterests: member.interests?.filter((i) =>
                groupInterests.has(i)
              ),
            };
          })
          .sort((a, b) => b.matchScore - a.matchScore);

        // Only suggest if there's a significantly better match (20%+ improvement)
        const currentMatch = currentGroup
          ? groupScores.find((gs) => gs.groupId === currentGroup.id)
              ?.matchScore || 0
          : 0;

        const bestMatch = groupScores[0];
        const shouldSuggest =
          bestMatch && bestMatch.matchScore > currentMatch + 20;

        return {
          memberId: member.id,
          memberName: `${member.firstName} ${member.lastName}`,
          currentGroup: currentGroup?.name || "No Group",
          currentGroupMatch: currentMatch,
          suggestedGroup: shouldSuggest ? bestMatch.groupName : null,
          suggestedGroupMatch: shouldSuggest ? bestMatch.matchScore : null,
          suggestedGroupMatchingInterests: shouldSuggest
            ? bestMatch.matchingInterests
            : [],
        };
      })
      .filter((s) => s.suggestedGroup !== null);

    return NextResponse.json({
      interestDistribution,
      interestDemographics,
      groupAffinityScores: groupAffinityScores.sort(
        (a, b) => b.affinityScore - a.affinityScore
      ),
      memberSuggestions,
      summary: {
        totalMembers: allUsers.length,
        totalInterests: Object.keys(interestCount).length,
        membersWithInterests: allUsers.filter(
          (u) => u.interests && u.interests.length > 0
        ).length,
        averageInterestsPerMember:
          Math.round(
            (allUsers.reduce((sum, u) => sum + (u.interests?.length || 0), 0) /
              allUsers.length) *
              10
          ) / 10,
      },
    });
  } catch (error) {
    console.error("Error fetching interest analytics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
