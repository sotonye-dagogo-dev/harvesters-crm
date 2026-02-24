/**
 * Notification Helper Utilities
 *
 * This module provides helper functions for creating and sending notifications
 * for various events in the system (meetings, membership requests, role changes).
 */

import { UserRole, NotificationType, ReportStatus } from "@/lib/types";
import { db } from "@/lib/data/database";
import { formatDate } from "@/lib/utils/format";

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
      (u) => u.role === "MEMBER" || u.role === UserRole.SMALL_GROUP_LEADER
    );

    if (allRecipients.length === 0) {
      return {
        success: false,
        message: "No members found in this group to send reminders to.",
      };
    }

    // Create notification for each member
    for (const member of allRecipients) {
      db.notifications.create({
        userId: member.id,
        type: NotificationType.MEETING_REMINDER,
        title: "Upcoming Group Meeting",
        message: `Your ${group.name} meeting is scheduled for ${formatDate(meeting.date)} at ${meeting.startTime}`,
        relatedId: meetingId,
      });
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

    if (!request.toGroupId) {
      return {
        success: false,
        message: `Membership request has no target group.`,
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
    db.notifications.create({
      userId: request.memberId,
      type: NotificationType.REQUEST_STATUS,
      title,
      message: notificationMessage,
      relatedId: requestId,
    });

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
      newRole === UserRole.SMALL_GROUP_LEADER
        ? "Group Leader"
        : newRole === "SUPERADMIN"
          ? "Super Administrator"
          : "Member";

    const title = "Role Assignment Update";
    const notificationMessage = `Your role has been updated to ${roleDisplayName} by ${assigner.firstName} ${assigner.lastName}. You now have access to additional features.`;

    db.notifications.create({
      userId,
      type: NotificationType.ROLE_ASSIGNMENT,
      title,
      message: notificationMessage,
      relatedId: userId,
    });

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
      db.notifications.create({
        userId: group.leaderId,
        type: NotificationType.REQUEST_STATUS,
        title: "New Member Joined",
        message: `${member.firstName} ${member.lastName} has joined your group: ${group.name}`,
        relatedId: memberId,
      });
    }

    // Notify the member
    db.notifications.create({
      userId: memberId,
      type: NotificationType.REQUEST_STATUS,
      title: "Welcome to Your Fellowship",
      message: `You have successfully joined ${group.name}. Looking forward to seeing you at the next meeting!`,
      relatedId: groupId,
    });

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

    db.notifications.create({
      userId: memberId,
      type: NotificationType.REQUEST_STATUS,
      title,
      message: notificationMessage,
      relatedId: undefined,
    });

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

    if (!request.memberId || !request.toGroupId) {
      return {
        success: false,
        message: `Membership request is missing required information.`,
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

      db.notifications.create({
        userId: toGroup.leaderId,
        type: NotificationType.REQUEST_STATUS,
        title,
        message: notificationMessage,
        relatedId: requestId,
      });

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

// ============================================================================
// REPORT NOTIFICATION HELPERS
// ============================================================================

/**
 * Helper to find users by role who should receive report notifications.
 * Returns IDs of users in SUPERADMIN, GROUP_PASTOR, GROUP_ADMIN roles (approvers).
 */
function getReportApproverIds(campusId?: string): string[] {
  const approverRoles: string[] = [
    UserRole.SUPERADMIN,
    UserRole.GROUP_PASTOR,
    UserRole.GROUP_ADMIN,
  ];
  const allUsers = db.users.findAll({});
  return allUsers
    .filter(
      (u) =>
        approverRoles.includes(u.role) &&
        (!campusId || !u.campusId || u.campusId === campusId)
    )
    .map((u) => u.id);
}

/**
 * Notify approvers when a report is submitted for review
 */
export async function sendReportSubmittedNotification(
  reportId: string,
  submitterId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const report = db.reports.findById(reportId);
    const submitter = db.users.findById(submitterId);
    if (!report || !submitter) {
      return { success: false, message: "Report or submitter not found" };
    }

    const approverIds = getReportApproverIds(report.campusId);
    for (const approverId of approverIds) {
      if (approverId === submitterId) continue;
      db.notifications.create({
        userId: approverId,
        type: NotificationType.REPORT_SUBMITTED,
        title: "Report Submitted",
        message: `${submitter.firstName} ${submitter.lastName} submitted a ${report.periodType} report for review.`,
        relatedId: reportId,
      });
    }

    return {
      success: true,
      message: `Submitted notification sent to ${approverIds.length} approver(s).`,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to send report submitted notification.",
    };
  }
}

/**
 * Notify submitter when edits are requested on their report
 */
export async function sendReportEditsRequestedNotification(
  reportId: string,
  reviewerId: string,
  reason?: string
): Promise<{ success: boolean; message: string }> {
  try {
    const report = db.reports.findById(reportId);
    const reviewer = db.users.findById(reviewerId);
    if (!report || !reviewer) {
      return { success: false, message: "Report or reviewer not found" };
    }

    db.notifications.create({
      userId: report.submittedById,
      type: NotificationType.REPORT_EDITS_REQUESTED,
      title: "Report Edits Requested",
      message: `${reviewer.firstName} ${reviewer.lastName} has requested changes to your report.${reason ? ` Reason: ${reason}` : ""}`,
      relatedId: reportId,
    });

    return { success: true, message: "Edits requested notification sent to submitter." };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to send edits requested notification.",
    };
  }
}

/**
 * Notify submitter when their report is approved
 */
export async function sendReportApprovedNotification(
  reportId: string,
  approverId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const report = db.reports.findById(reportId);
    const approver = db.users.findById(approverId);
    if (!report || !approver) {
      return { success: false, message: "Report or approver not found" };
    }

    db.notifications.create({
      userId: report.submittedById,
      type: NotificationType.REPORT_APPROVED,
      title: "Report Approved",
      message: `Your report has been approved by ${approver.firstName} ${approver.lastName}.`,
      relatedId: reportId,
    });

    return { success: true, message: "Approval notification sent to submitter." };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to send report approved notification.",
    };
  }
}

/**
 * Notify submitter when their report is reviewed (post-approval)
 */
export async function sendReportReviewedNotification(
  reportId: string,
  reviewerId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const report = db.reports.findById(reportId);
    const reviewer = db.users.findById(reviewerId);
    if (!report || !reviewer) {
      return { success: false, message: "Report or reviewer not found" };
    }

    db.notifications.create({
      userId: report.submittedById,
      type: NotificationType.REPORT_REVIEWED,
      title: "Report Reviewed",
      message: `Your report has been marked as reviewed by ${reviewer.firstName} ${reviewer.lastName}.`,
      relatedId: reportId,
    });

    return { success: true, message: "Review notification sent to submitter." };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to send report reviewed notification.",
    };
  }
}

/**
 * Notify edit submitter when their report edit is approved
 */
export async function sendReportEditApprovedNotification(
  editId: string,
  approverId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const edit = db.reportEdits.findById(editId);
    const approver = db.users.findById(approverId);
    if (!edit || !approver) {
      return { success: false, message: "Edit or approver not found" };
    }

    db.notifications.create({
      userId: edit.submittedById,
      type: NotificationType.REPORT_EDIT_APPROVED,
      title: "Report Edit Approved",
      message: `Your edit to a report has been approved by ${approver.firstName} ${approver.lastName} and changes have been applied.`,
      relatedId: edit.reportId,
    });

    return { success: true, message: "Edit approval notification sent." };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to send edit approved notification.",
    };
  }
}

/**
 * Notify edit submitter when their report edit is rejected
 */
export async function sendReportEditRejectedNotification(
  editId: string,
  reviewerId: string,
  reason?: string
): Promise<{ success: boolean; message: string }> {
  try {
    const edit = db.reportEdits.findById(editId);
    const reviewer = db.users.findById(reviewerId);
    if (!edit || !reviewer) {
      return { success: false, message: "Edit or reviewer not found" };
    }

    db.notifications.create({
      userId: edit.submittedById,
      type: NotificationType.REPORT_EDIT_REJECTED,
      title: "Report Edit Rejected",
      message: `Your edit was rejected by ${reviewer.firstName} ${reviewer.lastName}.${reason ? ` Reason: ${reason}` : ""}`,
      relatedId: edit.reportId,
    });

    return { success: true, message: "Edit rejection notification sent." };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to send edit rejected notification.",
    };
  }
}

/**
 * Notify approvers when a report update request is submitted
 */
export async function sendReportUpdateRequestSubmittedNotification(
  requestId: string,
  requestedById: string
): Promise<{ success: boolean; message: string }> {
  try {
    const updateRequest = db.reportUpdateRequests.findById(requestId);
    const requester = db.users.findById(requestedById);
    if (!updateRequest || !requester) {
      return { success: false, message: "Update request or requester not found" };
    }

    const report = db.reports.findById(updateRequest.reportId);
    const approverIds = getReportApproverIds(report?.campusId);

    for (const approverId of approverIds) {
      if (approverId === requestedById) continue;
      db.notifications.create({
        userId: approverId,
        type: NotificationType.REPORT_UPDATE_REQUEST_SUBMITTED,
        title: "Report Update Request",
        message: `${requester.firstName} ${requester.lastName} has requested to update a locked report. Reason: ${updateRequest.reason}`,
        relatedId: requestId,
      });
    }

    return {
      success: true,
      message: `Update request notification sent to ${approverIds.length} approver(s).`,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to send update request notification.",
    };
  }
}

/**
 * Notify requester when their update request is approved
 */
export async function sendReportUpdateRequestApprovedNotification(
  requestId: string,
  approverId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const updateRequest = db.reportUpdateRequests.findById(requestId);
    const approver = db.users.findById(approverId);
    if (!updateRequest || !approver) {
      return { success: false, message: "Update request or approver not found" };
    }

    db.notifications.create({
      userId: updateRequest.requestedById,
      type: NotificationType.REPORT_UPDATE_REQUEST_APPROVED,
      title: "Update Request Approved",
      message: `Your request to update a report has been approved by ${approver.firstName} ${approver.lastName}. Changes have been applied.`,
      relatedId: updateRequest.reportId,
    });

    return { success: true, message: "Update request approval notification sent." };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to send update request approval notification.",
    };
  }
}

/**
 * Notify requester when their update request is rejected
 */
export async function sendReportUpdateRequestRejectedNotification(
  requestId: string,
  reviewerId: string,
  reason?: string
): Promise<{ success: boolean; message: string }> {
  try {
    const updateRequest = db.reportUpdateRequests.findById(requestId);
    const reviewer = db.users.findById(reviewerId);
    if (!updateRequest || !reviewer) {
      return { success: false, message: "Update request or reviewer not found" };
    }

    db.notifications.create({
      userId: updateRequest.requestedById,
      type: NotificationType.REPORT_UPDATE_REQUEST_REJECTED,
      title: "Update Request Rejected",
      message: `Your request to update a report was rejected by ${reviewer.firstName} ${reviewer.lastName}.${reason ? ` Reason: ${reason}` : ""}`,
      relatedId: updateRequest.reportId,
    });

    return { success: true, message: "Update request rejection notification sent." };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to send update request rejection notification.",
    };
  }
}

/**
 * Notify the report submitter when their report is locked (finalized)
 */
export async function sendReportLockedNotification(
  reportId: string,
  lockerId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const report = db.reports.findById(reportId);
    const locker = db.users.findById(lockerId);
    if (!report || !locker) {
      return { success: false, message: "Report or locker not found" };
    }

    db.notifications.create({
      userId: report.submittedById,
      type: NotificationType.REPORT_REVIEWED,
      title: "Report Locked",
      message: `Your report has been finalized and locked by ${locker.firstName} ${locker.lastName}. No further edits are possible without an update request.`,
      relatedId: reportId,
    });

    return { success: true, message: "Lock notification sent to submitter." };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to send report locked notification.",
    };
  }
}

/**
 * Notify reviewers/approvers when a report edit is submitted for their review
 */
export async function sendReportEditSubmittedNotification(
  editId: string,
  reportId: string,
  submitterId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const report = db.reports.findById(reportId);
    const submitter = db.users.findById(submitterId);
    if (!report || !submitter) {
      return { success: false, message: "Report or submitter not found" };
    }

    const approverIds = getReportApproverIds(report.campusId);
    for (const approverId of approverIds) {
      if (approverId === submitterId) continue;
      db.notifications.create({
        userId: approverId,
        type: NotificationType.REPORT_EDITS_REQUESTED,
        title: "Report Edit Submitted",
        message: `${submitter.firstName} ${submitter.lastName} submitted a report edit for review.`,
        relatedId: editId,
      });
    }

    return {
      success: true,
      message: `Edit submitted notification sent to ${approverIds.length} reviewer(s).`,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to send edit submitted notification.",
    };
  }
}

/**
 * Send deadline reminder to report submitters
 * Called for reports approaching their deadline (e.g., 3 days and 1 day before)
 */
export async function sendReportDeadlineReminder(
  reportId: string,
  isFinal: boolean
): Promise<{ success: boolean; message: string }> {
  try {
    const report = db.reports.findById(reportId);
    if (!report) {
      return { success: false, message: "Report not found" };
    }

    if (report.status !== ReportStatus.DRAFT && report.status !== ReportStatus.REQUIRES_EDITS) {
      return { success: false, message: "Report is not in a state that requires a deadline reminder." };
    }

    if (!report.deadline) {
      return { success: false, message: "Report has no deadline set." };
    }

    const deadline = new Date(report.deadline);
    const daysLeft = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    const notifType = isFinal
      ? NotificationType.REPORT_DEADLINE_FINAL
      : NotificationType.REPORT_DEADLINE_REMINDER;

    const title = isFinal
      ? "Report Deadline Tomorrow!"
      : "Report Deadline Approaching";

    const body = isFinal
      ? `Your ${report.periodType} report is due tomorrow (${formatDate(deadline)}). Please submit it as soon as possible.`
      : `Your ${report.periodType} report is due in ${daysLeft} day(s) on ${formatDate(deadline)}. Please ensure it is completed and submitted on time.`;

    db.notifications.create({
      userId: report.submittedById,
      type: notifType,
      title,
      message: body,
      relatedId: reportId,
    });

    return {
      success: true,
      message: `Deadline ${isFinal ? "final " : ""}reminder sent for report ${reportId}.`,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to send deadline reminder.",
    };
  }
}
