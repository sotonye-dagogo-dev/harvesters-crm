import { NextRequest } from "next/server";
import { reportNotificationDb } from "@/lib/data/database";
import { getAuthenticatedUser } from "@/lib/utils/middleware";
import {
  successResponse,
  forbiddenResponse,
  notFoundResponse,
  handleApiError,
} from "@/lib/utils/api";

// GET /api/report-notifications — List report notifications for the current user
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error) return error;
    if (!user) return forbiddenResponse("Authentication required.");

    const searchParams = request.nextUrl.searchParams;
    const isRead = searchParams.get("isRead");

    const filters: { userId: string; isRead?: boolean } = { userId: user.id };
    if (isRead !== null) filters.isRead = isRead === "true";

    const notifications = reportNotificationDb.findAll(filters);
    const unreadCount = reportNotificationDb.countUnread(user.id);

    return successResponse({ notifications, unreadCount });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/report-notifications — Mark notification(s) as read
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error) return error;
    if (!user) return forbiddenResponse("Authentication required.");

    const body = await request.json();
    const { notificationId, markAll } = body as {
      notificationId?: string;
      markAll?: boolean;
    };

    if (markAll) {
      const count = reportNotificationDb.markAllRead(user.id);
      return successResponse(
        { markedCount: count },
        `${count} notifications marked as read.`
      );
    }

    if (notificationId) {
      const notification = reportNotificationDb.findById(notificationId);
      if (!notification) {
        return notFoundResponse("Notification not found.");
      }
      if (notification.userId !== user.id) {
        return forbiddenResponse("You can only mark your own notifications.");
      }
      const updated = reportNotificationDb.markRead(notificationId);
      return successResponse(updated, "Notification marked as read.");
    }

    return successResponse(null, "No action taken.");
  } catch (error) {
    return handleApiError(error);
  }
}
