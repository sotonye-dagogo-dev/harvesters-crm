/**
 * Notification Helper Utilities
 *
 * This module provides helper functions for creating and sending notifications
 * for various events in the system (meetings, membership requests, role changes).
 */

import { db } from "@/lib/data/database";

/**
 * Send meeting reminder notification to all group members
 */
export async function sendMeetingReminder(
  meetingId: string,
  groupId: string
): Promise<void> {
  try {
    const meeting = db.meetings.findById(meetingId);
    const group = db.groups.findById(groupId);
    if (!meeting || !group) {
      return { success: false, message: "Meeting or group not found" };
    }
    const members = db.users.findAll({ groupId });
    const leaders = db.users.findAll({ groupId });
    const allRecipients = [...members, ...leaders].filter(
      (u) => u.role === "MEMBER" || u.role === "LEADER"
    );
    for (const member of allRecipients) {
      db.notifications.create(
        member.id,
        NotificationType.MEETING_REMINDER,
        "Upcoming Group Meeting",
        `Your ${group.name} meeting is scheduled for ${new Date(meeting.date).toLocaleDateString()} at ${meeting.startTime}`,
        meetingId
      );
    }
    return {
      success: true,
      message: `Sent meeting reminder for meeting ${meetingId} to ${allRecipients.length} members`,
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Error sending meeting reminder: ${error?.message || error}`,
    };
  }
}

/**
 * Send notification when membership request status changes
 */
export async function sendMembershipRequestNotification(
  requestId: string,
  status: "APPROVED" | "REJECTED",
  responderId: string
): Promise<void> {
  try {
    const request = db.membershipRequests.findById(requestId);
    if (!request) {
      return { success: false, message: "Membership request not found" };
    }
    const responder = db.users.findById(responderId);
    const toGroup = db.groups.findById(request.toGroupId);
    const statusText = status === "APPROVED" ? "approved" : "rejected";
    const title = `Membership Request ${statusText.charAt(0).toUpperCase() + statusText.slice(1)}`;
    let message = "";
    if (status === "APPROVED") {
      message = `Your request to join ${toGroup?.name || "the group"} has been approved by ${responder?.firstName || "the leader"}. Welcome to your new fellowship!`;
    } else {
      message = `Your request to join ${toGroup?.name || "the group"} has been declined. Feel free to explore other fellowship groups.`;
    }
    db.notifications.create(
      request.memberId,
      NotificationType.REQUEST_STATUS,
      title,
      message,
      requestId
    );
    return {
      success: true,
      message: `Sent ${status} notification for request ${requestId} to member ${request.memberId}`,
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Error sending membership request notification: ${error?.message || error}`,
    };
  }
}

/**
 * Send notification when user role is changed
 */
export async function sendRoleAssignmentNotification(
  userId: string,
  newRole: string,
  assignedBy: string
): Promise<void> {
  try {
    const user = db.users.findById(userId);
    const assigner = db.users.findById(assignedBy);
    if (!user || !assigner) {
      return { success: false, message: "User or assigner not found" };
    }
    const roleDisplayName =
      newRole === "LEADER"
        ? "Group Leader"
        : newRole === "SUPERADMIN"
          ? "Super Administrator"
          : "Member";
    const title = "Role Assignment Update";
    const message = `Your role has been updated to ${roleDisplayName} by ${assigner.firstName} ${assigner.lastName}. You now have access to additional features.`;
    db.notifications.create(
      userId,
      NotificationType.ROLE_ASSIGNMENT,
      title,
      message,
      userId
    );
    return {
      success: true,
      message: `Sent role assignment notification to user ${userId}`,
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Error sending role assignment notification: ${error?.message || error}`,
    };
  }
}

/**
 * Send notification when a new member joins a group
 */
export async function sendNewMemberNotification(
  memberId: string,
  groupId: string
): Promise<void> {
  try {
    const member = db.users.findById(memberId);
    const group = db.groups.findById(groupId);
    if (!member || !group) {
      return { success: false, message: "Member or group not found" };
    }
    if (group.leaderId) {
      db.notifications.create(
        group.leaderId,
        NotificationType.REQUEST_STATUS,
        "New Member Joined",
        `${member.firstName} ${member.lastName} has joined your group: ${group.name}`,
        memberId
      );
    }
    db.notifications.create(
      memberId,
      NotificationType.REQUEST_STATUS,
      "Welcome to Your Fellowship",
      `You have successfully joined ${group.name}. Looking forward to seeing you at the next meeting!`,
      groupId
    );
    return {
      success: true,
      message: `Sent new member notifications for ${memberId} joining ${groupId}`,
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Error sending new member notification: ${error?.message || error}`,
    };
  }
}

/**
 * Send notification when a member is removed from a group
 */
export async function sendMemberRemovedNotification(
  memberId: string,
  groupName: string,
  removedBy: string
): Promise<void> {
  try {
    const member = db.users.findById(memberId);
    const remover = db.users.findById(removedBy);
    if (!member) {
      return { success: false, message: "Member not found" };
    }
    const title = "Group Membership Update";
    const message = `You have been removed from ${groupName} by ${remover?.firstName || "an administrator"}. Please contact church leadership if you have questions.`;
    db.notifications.create(
      memberId,
      NotificationType.REQUEST_STATUS,
      title,
      message,
      undefined
    );
    return {
      success: true,
      message: `Sent member removed notification to ${memberId}`,
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Error sending member removed notification: ${error?.message || error}`,
    };
  }
}

/**
 * Schedule meeting reminder (to be called 24 hours before meeting)
 * In production, this would be handled by a cron job or scheduled task
 */
export function scheduleMeetingReminder(
  meetingId: string,
  groupId: string,
  meetingDate: Date
): void {
  const now = new Date();
  const reminderTime = new Date(meetingDate);
  reminderTime.setHours(reminderTime.getHours() - 24); // 24 hours before

  const timeUntilReminder = reminderTime.getTime() - now.getTime();

  if (timeUntilReminder > 0) {
    // In production, this would be replaced with a proper job scheduler
    setTimeout(() => {
      sendMeetingReminder(meetingId, groupId);
    }, timeUntilReminder);

    console.log(
      `Scheduled meeting reminder for ${meetingId} at ${reminderTime.toISOString()}`
    );
  } else {
    // Meeting is less than 24 hours away or in the past, send immediately
    sendMeetingReminder(meetingId, groupId);
  }
}

/**
 * Send notification when a new membership request is created
 */
export async function sendNewMembershipRequestNotification(
  requestId: string
): Promise<void> {
  try {
    const request = db.membershipRequests.findById(requestId);
    if (!request) {
      return { success: false, message: "Membership request not found" };
    }
    const member = db.users.findById(request.memberId);
    const toGroup = db.groups.findById(request.toGroupId);
    if (!member || !toGroup) {
      return { success: false, message: "Member or target group not found" };
    }
    if (toGroup.leaderId) {
      const title = "New Membership Request";
      const message = `${member.firstName} ${member.lastName} has requested to join your group: ${toGroup.name}. Please review and respond.`;
      db.notifications.create(
        toGroup.leaderId,
        NotificationType.REQUEST_STATUS,
        title,
        message,
        requestId
      );
      return {
        success: true,
        message: `Sent new membership request notification to leader ${toGroup.leaderId}`,
      };
    }
    return { success: false, message: "No group leader to notify" };
  } catch (error: any) {
    return {
      success: false,
      message: `Error sending new membership request notification: ${error?.message || error}`,
    };
  }
}
