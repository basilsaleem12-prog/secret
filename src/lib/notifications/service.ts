import { prisma } from '@/lib/prisma';

export type NotificationType =
  | 'JOB_POSTED'
  | 'JOB_APPROVED'
  | 'JOB_REJECTED'
  | 'APPLICATION_RECEIVED'
  | 'APPLICATION_SHORTLISTED'
  | 'APPLICATION_ACCEPTED'
  | 'APPLICATION_REJECTED'
  | 'JOB_FILLED'
  | 'CALL_REQUEST_RECEIVED'
  | 'CALL_REQUEST_ACCEPTED'
  | 'CALL_REQUEST_REJECTED'
  | 'MESSAGE_RECEIVED'
  | 'PROFILE_VIEW'
  | 'BOOKMARK_ADDED';

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  content: string;
  link?: string;
  metadata?: Record<string, unknown>;
}

interface NotificationConfig {
  title: string;
  content: string;
  link?: string;
}

/**
 * Create a notification for a user
 */
export async function createNotification(params: CreateNotificationParams): Promise<void> {
  try {
    await prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        content: params.content,
        link: params.link,
        metadata: params.metadata ? JSON.stringify(params.metadata) : null,
      },
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    // Don't throw - notifications are non-critical
  }
}

/**
 * Create multiple notifications at once
 */
export async function createNotifications(notifications: CreateNotificationParams[]): Promise<void> {
  try {
    await prisma.notification.createMany({
      data: notifications.map(notif => ({
        userId: notif.userId,
        type: notif.type,
        title: notif.title,
        content: notif.content,
        link: notif.link,
        metadata: notif.metadata ? JSON.stringify(notif.metadata) : null,
      })),
    });
  } catch (error) {
    console.error('Error creating notifications:', error);
  }
}

/**
 * Notify user when their job is approved by admin
 */
export async function notifyJobApproved(userId: string, jobId: string, jobTitle: string): Promise<void> {
  await createNotification({
    userId,
    type: 'JOB_APPROVED',
    title: '✅ Job Approved!',
    content: `Your job posting "${jobTitle}" has been approved by the admin and is now live.`,
    link: `/jobs/${jobId}`,
    metadata: { jobId },
  });
}

/**
 * Notify user when their job is rejected by admin
 */
export async function notifyJobRejected(
  userId: string,
  jobId: string,
  jobTitle: string,
  reason?: string
): Promise<void> {
  await createNotification({
    userId,
    type: 'JOB_REJECTED',
    title: '❌ Job Rejected',
    content: `Your job posting "${jobTitle}" was rejected. ${reason ? `Reason: ${reason}` : ''}`,
    link: `/drafts`,
    metadata: { jobId, reason },
  });
}

/**
 * Notify job poster when they receive a new application
 */
export async function notifyApplicationReceived(
  jobOwnerId: string,
  jobId: string,
  jobTitle: string,
  applicantName: string
): Promise<void> {
  await createNotification({
    userId: jobOwnerId,
    type: 'APPLICATION_RECEIVED',
    title: '📩 New Application',
    content: `${applicantName} has applied to your job "${jobTitle}".`,
    link: `/jobs/${jobId}/applications`,
    metadata: { jobId, applicantName },
  });
}

/**
 * Notify applicant when their application status changes
 */
export async function notifyApplicationStatusChange(
  applicantId: string,
  jobId: string,
  jobTitle: string,
  status: 'SHORTLISTED' | 'ACCEPTED' | 'REJECTED'
): Promise<void> {
  const config: Record<string, NotificationConfig> = {
    SHORTLISTED: {
      title: '⭐ Application Shortlisted',
      content: `Great news! Your application for "${jobTitle}" has been shortlisted.`,
      link: `/my-applications`,
    },
    ACCEPTED: {
      title: '🎉 Application Accepted',
      content: `Congratulations! Your application for "${jobTitle}" has been accepted.`,
      link: `/my-applications`,
    },
    REJECTED: {
      title: '❌ Application Update',
      content: `Your application for "${jobTitle}" was not selected this time.`,
      link: `/my-applications`,
    },
  };

  const notifConfig = config[status];
  await createNotification({
    userId: applicantId,
    type: `APPLICATION_${status}` as NotificationType,
    title: notifConfig.title,
    content: notifConfig.content,
    link: notifConfig.link,
    metadata: { jobId, status },
  });
}

/**
 * Notify users about a new job posting that matches their skills/interests
 */
export async function notifyMatchingUsersAboutNewJob(
  jobId: string,
  jobTitle: string,
  jobTags: string[],
  jobType: string,
  creatorId: string
): Promise<void> {
  try {
    // Find users with matching skills or interests
    const matchingUsers = await prisma.profile.findMany({
      where: {
        id: { not: creatorId }, // Don't notify the job creator
        OR: [
          { skills: { hasSome: jobTags } },
          { interests: { hasSome: jobTags } },
        ],
      },
      select: {
        id: true,
        fullName: true,
        skills: true,
        interests: true,
      },
      take: 100, // Limit to avoid creating too many notifications at once
    });

    if (matchingUsers.length === 0) return;

    const notifications: CreateNotificationParams[] = matchingUsers.map(user => ({
      userId: user.id,
      type: 'JOB_POSTED',
      title: '🔔 New Job Match',
      content: `New job posting: "${jobTitle}" matches your skills and interests!`,
      link: `/jobs/${jobId}`,
      metadata: { jobId, jobType },
    }));

    await createNotifications(notifications);
  } catch (error) {
    console.error('Error notifying users about new job:', error);
  }
}

/**
 * Notify applicants when a job is marked as filled
 */
export async function notifyJobFilled(jobId: string, jobTitle: string, excludeUserId?: string, request?: Request): Promise<void> {
  try {
    // Get all applicants who haven't been accepted with their email
    const applications = await prisma.application.findMany({
      where: {
        jobId,
        status: { not: 'ACCEPTED' },
        ...(excludeUserId ? { applicantId: { not: excludeUserId } } : {}),
      },
      include: {
        applicant: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    if (applications.length === 0) return;

    // Create notifications
    const notifications: CreateNotificationParams[] = applications.map(app => ({
      userId: app.applicantId,
      type: 'JOB_FILLED',
      title: '📌 Position Filled',
      content: `The position "${jobTitle}" has been filled.`,
      link: `/my-applications`,
      metadata: { jobId },
    }));

    await createNotifications(notifications);

    // Send email notifications (non-blocking)
    const { sendJobFilledEmail } = await import('@/lib/email/service');
    for (const application of applications) {
      if (application.applicant.email) {
        sendJobFilledEmail(
          application.applicant.email,
          application.applicant.fullName || 'User',
          jobTitle,
          request
        ).catch(err => console.error(`Failed to send job filled email to ${application.applicant.email}:`, err));
      }
    }
  } catch (error) {
    console.error('Error notifying about filled job:', error);
  }
}

/**
 * Notify user about a new call request
 */
export async function notifyCallRequestReceived(
  receiverId: string,
  requesterId: string,
  requesterName: string,
  jobId: string,
  jobTitle: string
): Promise<void> {
  await createNotification({
    userId: receiverId,
    type: 'CALL_REQUEST_RECEIVED',
    title: '📞 Video Call Request',
    content: `${requesterName} has requested a video call regarding "${jobTitle}".`,
    link: `/messages`,
    metadata: { requesterId, jobId },
  });
}

/**
 * Notify user when their call request is accepted or rejected
 */
export async function notifyCallRequestResponse(
  requesterId: string,
  jobTitle: string,
  status: 'ACCEPTED' | 'REJECTED'
): Promise<void> {
  const config: Record<string, NotificationConfig> = {
    ACCEPTED: {
      title: '✅ Call Request Accepted',
      content: `Your video call request for "${jobTitle}" has been accepted!`,
      link: `/messages`,
    },
    REJECTED: {
      title: '❌ Call Request Declined',
      content: `Your video call request for "${jobTitle}" was declined.`,
      link: `/messages`,
    },
  };

  const notifConfig = config[status];
  await createNotification({
    userId: requesterId,
    type: `CALL_REQUEST_${status}` as NotificationType,
    title: notifConfig.title,
    content: notifConfig.content,
    link: notifConfig.link,
    metadata: { status },
  });
}

/**
 * Notify user about a new message
 */
export async function notifyNewMessage(
  receiverId: string,
  senderName: string,
  jobTitle?: string
): Promise<void> {
  await createNotification({
    userId: receiverId,
    type: 'MESSAGE_RECEIVED',
    title: '💬 New Message',
    content: jobTitle
      ? `${senderName} sent you a message about "${jobTitle}".`
      : `${senderName} sent you a message.`,
    link: `/messages`,
  });
}

/**
 * Notify job owner when someone bookmarks their job
 */
export async function notifyJobBookmarked(
  jobOwnerId: string,
  jobId: string,
  jobTitle: string,
  bookmarkerName: string
): Promise<void> {
  await createNotification({
    userId: jobOwnerId,
    type: 'BOOKMARK_ADDED',
    title: '⭐ Job Bookmarked',
    content: `${bookmarkerName} saved your job "${jobTitle}".`,
    link: `/jobs/${jobId}`,
    metadata: { jobId },
  });
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  try {
    await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  try {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
  }
}

/**
 * Get unread notification count for a user
 */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  try {
    return await prisma.notification.count({
      where: { userId, isRead: false },
    });
  } catch (error) {
    console.error('Error getting unread notification count:', error);
    return 0;
  }
}

