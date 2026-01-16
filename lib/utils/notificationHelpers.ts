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
): Promise<{ success: boolean; message: string }> {
  try {
    const meeting = db.meetings.findById(meetingId);
    const group = db.groups.findById(groupId);

    if (!meeting) {
      return {
        success: false,
        message: `Meeting with ID ${meetingId} not found. Unable to send reminder.`,
      };
    }

    if (!group) {
      return {
        success: false,
        message: `Group with ID ${groupId} not found. Unable to send reminder.`,
      };
    }

    // Get all group members
    const members = db.users.findAll({ groupId });
    const leaders = db.users.findAll({ groupId });
    const allRecipients = [...members, ...leaders].filter(
      (u) => u.role === "MEMBER" || u.role === "LEADER"
    );

    if (allRecipients.length === 0) {
      return {
        success: false,
        message: "No members found in this group to send reminders to.",
      };
    }

    // Create notification for each member
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
      message: `Meeting reminder sent successfully to ${allRecipients.length} member(s).`,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? `Failed to send meeting reminder: ${error.message}`
          : "An unexpected error occurred while sending meeting reminder.",
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
): Promise<{ success: boolean; message: string }> {
  try {
    const request = db.membershipRequests.findById(requestId);

    if (!request) {
      return {
        success: false,
        message: `Membership request with ID ${requestId} not found.`,
      };
    }

    const responder = db.users.findById(responderId);
    const toGroup = db.groups.findById(request.toGroupId);

    const statusText = status === "APPROVED" ? "approved" : "rejected";
    const title = `Membership Request ${statusText.charAt(0).toUpperCase() + statusText.slice(1)}`;

    let notificationMessage = "";
    if (status === "APPROVED") {
      notificationMessage = `Your request to join ${toGroup?.name || "the group"} has been approved by ${responder?.firstName || "the leader"}. Welcome to your new fellowship!`;
    } else {
      notificationMessage = `Your request to join ${toGroup?.name || "the group"} has been declined. Feel free to explore other fellowship groups.`;
    }

    // Notify the requesting member
    db.notifications.create(
      request.memberId,
      NotificationType.REQUEST_STATUS,
      title,
      notificationMessage,
      requestId
    );

    return {
      success: true,
      message: `${statusText.charAt(0).toUpperCase() + statusText.slice(1)} notification sent successfully to member.`,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? `Failed to send notification: ${error.message}`
          : "An unexpected error occurred while sending notification.",
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
): Promise<{ success: boolean; message: string }> {
  try {
    const user = db.users.findById(userId);
    const assigner = db.users.findById(assignedBy);

    if (!user) {
      return {
        success: false,
        message: `User with ID ${userId} not found.`,
      };
    }

    if (!assigner) {
      return {
        success: false,
        message: `Assigner with ID ${assignedBy} not found.`,
      };
    }

    const roleDisplayName =
      newRole === "LEADER"
        ? "Group Leader"
        : newRole === "SUPERADMIN"
          ? "Super Administrator"
          : "Member";

    const title = "Role Assignment Update";
    const notificationMessage = `Your role has been updated to ${roleDisplayName} by ${assigner.firstName} ${assigner.lastName}. You now have access to additional features.`;

    db.notifications.create(
      userId,
      NotificationType.ROLE_ASSIGNMENT,
      title,
      notificationMessage,
      userId
    );

    return {
      success: true,
      message: `Role assignment notification sent successfully to ${user.firstName} ${user.lastName}.`,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? `Failed to send role assignment notification: ${error.message}`
          : "An unexpected error occurred while sending role assignment notification.",
    };
  }
}

/**
 * Send notification when a new member joins a group
 */
export async function sendNewMemberNotification(
  memberId: string,
  groupId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const member = db.users.findById(memberId);
    const group = db.groups.findById(groupId);

    if (!member) {
      return {
        success: false,
        message: `Member with ID ${memberId} not found.`,
      };
    }

    if (!group) {
      return {
        success: false,
        message: `Group with ID ${groupId} not found.`,
      };
    }

    // Notify the group leader
    if (group.leaderId) {
      db.notifications.create(
        group.leaderId,
        NotificationType.REQUEST_STATUS,
        "New Member Joined",
        `${member.firstName} ${member.lastName} has joined your group: ${group.name}`,
        memberId
      );
    }

    // Notify the member
    db.notifications.create(
      memberId,
      NotificationType.REQUEST_STATUS,
      "Welcome to Your Fellowship",
      `You have successfully joined ${group.name}. Looking forward to seeing you at the next meeting!`,
      groupId
    );

    return {
      success: true,
      message: `Welcome notifications sent successfully to ${member.firstName} ${member.lastName} and group leader.`,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? `Failed to send new member notifications: ${error.message}`
          : "An unexpected error occurred while sending new member notifications.",
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
): Promise<{ success: boolean; message: string }> {
  try {
    const member = db.users.findById(memberId);
    const remover = db.users.findById(removedBy);

    if (!member) {
      return {
        success: false,
        message: `Member with ID ${memberId} not found.`,
      };
    }

    const title = "Group Membership Update";
    const notificationMessage = `You have been removed from ${groupName} by ${remover?.firstName || "an administrator"}. Please contact church leadership if you have questions.`;

    db.notifications.create(
      memberId,
      NotificationType.REQUEST_STATUS,
      title,
      notificationMessage,
      undefined
    );

    return {
      success: true,
      message: `Removal notification sent successfully to ${member.firstName} ${member.lastName}.`,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? `Failed to send member removed notification: ${error.message}`
          : "An unexpected error occurred while sending member removed notification.",
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
): Promise<{ success: boolean; message: string }> {
  try {
    const request = db.membershipRequests.findById(requestId);

    if (!request) {
      return {
        success: false,
        message: `Membership request with ID ${requestId} not found.`,
      };
    }

    const member = db.users.findById(request.memberId);
    const toGroup = db.groups.findById(request.toGroupId);

    if (!member) {
      return {
        success: false,
        message: `Member with ID ${request.memberId} not found.`,
      };
    }

    if (!toGroup) {
      return {
        success: false,
        message: `Target group with ID ${request.toGroupId} not found.`,
      };
    }

    // Notify the group leader
    if (toGroup.leaderId) {
      const title = "New Membership Request";
      const notificationMessage = `${member.firstName} ${member.lastName} has requested to join your group: ${toGroup.name}. Please review and respond.`;

      db.notifications.create(
        toGroup.leaderId,
        NotificationType.REQUEST_STATUS,
        title,
        notificationMessage,
        requestId
      );

      return {
        success: true,
        message: `New membership request notification sent successfully to group leader.`,
      };
    }

    return {
      success: false,
      message: `Group ${toGroup.name} has no assigned leader to notify.`,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? `Failed to send new membership request notification: ${error.message}`
          : "An unexpected error occurred while sending new membership request notification.",
    };
  }
}
