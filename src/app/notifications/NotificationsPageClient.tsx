'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Bell, Check, CheckCheck, Trash2, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Notification {
  id: string;
  type: string;
  title: string;
  content: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPageClient(): JSX.Element {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const hasFetchedRef = useRef(false);

  const fetchNotifications = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const url = filter === 'unread' ? '/api/notifications?unread=true' : '/api/notifications';
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (notificationId: string): Promise<void> => {
    try {
      await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
      });
      
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async (): Promise<void> => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
      });
      
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, isRead: true }))
      );
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string): Promise<void> => {
    try {
      await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      });
      
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const clearReadNotifications = async (): Promise<void> => {
    try {
      await fetch('/api/notifications', {
        method: 'DELETE',
      });
      
      setNotifications(prev => prev.filter(notif => !notif.isRead));
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  const handleNotificationClick = (notification: Notification): void => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    
    if (notification.link) {
      // Open video call links in a new tab, others in same tab
      if (notification.link.startsWith('/video-call/')) {
        window.open(notification.link, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = notification.link;
      }
    }
  };

  const getNotificationIcon = (type: string): string => {
    const icons: Record<string, string> = {
      JOB_POSTED: '🔔',
      JOB_APPROVED: '✅',
      JOB_REJECTED: '❌',
      APPLICATION_RECEIVED: '📩',
      APPLICATION_SHORTLISTED: '⭐',
      APPLICATION_ACCEPTED: '🎉',
      APPLICATION_REJECTED: '❌',
      JOB_FILLED: '📌',
      CALL_REQUEST_RECEIVED: '📞',
      CALL_REQUEST_ACCEPTED: '✅',
      CALL_REQUEST_REJECTED: '❌',
      MESSAGE_RECEIVED: '💬',
      BOOKMARK_ADDED: '⭐',
    };
    return icons[type] || '🔔';
  };

  const getTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="glass-card p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            className={filter === 'all' ? 'btn-gradient' : ''}
          >
            All ({notifications.length})
          </Button>
          <Button
            variant={filter === 'unread' ? 'default' : 'outline'}
            onClick={() => setFilter('unread')}
            className={filter === 'unread' ? 'btn-gradient' : ''}
          >
            Unread ({unreadCount})
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              onClick={markAllAsRead}
              className="flex items-center gap-2"
            >
              <CheckCheck className="w-4 h-4" />
              Mark all read
            </Button>
          )}
          <Button
            variant="outline"
            onClick={clearReadNotifications}
            className="flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Clear read
          </Button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="glass-card divide-y" style={{ borderColor: 'var(--border)' }}>
        {loading ? (
          <div className="p-12 text-center" style={{ color: 'var(--foreground-muted)' }}>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#1E3A8A' }}></div>
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center" style={{ color: 'var(--foreground-muted)' }}>
            <Bell className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">No notifications</p>
            <p className="text-sm mt-1">
              {filter === 'unread' ? 'You have no unread notifications' : "You're all caught up!"}
            </p>
          </div>
        ) : (
          notifications.map((notification: Notification) => (
            <div
              key={notification.id}
              className={`p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                !notification.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
              }`}
            >
              <div className="flex gap-4">
                {/* Icon */}
                <div className="text-3xl flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div
                    className="cursor-pointer"
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-lg" style={{ color: 'var(--foreground)' }}>
                        {notification.title}
                      </h3>
                      {!notification.isRead && (
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0 mt-2"
                          style={{ background: '#1E3A8A' }}
                        />
                      )}
                    </div>
                    <p className="text-sm mb-3" style={{ color: 'var(--foreground-muted)' }}>
                      {notification.content}
                    </p>
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-medium" style={{ color: 'var(--foreground-muted)' }}>
                        {getTimeAgo(notification.createdAt)}
                      </span>
                      {notification.link && (
                        <span
                          className="text-xs font-medium hover:underline"
                          style={{ color: '#1E3A8A' }}
                        >
                          View details →
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  {!notification.isRead && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => markAsRead(notification.id)}
                      className="flex items-center gap-2"
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteNotification(notification.id)}
                    className="flex items-center gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

