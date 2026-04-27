export type Notification = {
  id: number;
  type: string;
  title: string;
  body: string | null;
  isRead: boolean;
  meta: Record<string, unknown> | null;
  createdAt: string;
};

export interface NotificationSlice {
  notifications: Notification[];
  unreadCount: number;
  setNotifications: (list: Notification[]) => void;
  addNotification: (n: Notification) => void;
  markRead: (id: number) => void;
  markAllRead: () => void;
}

export const createNotificationSlice = (set: any): NotificationSlice => ({
  notifications: [],
  unreadCount: 0,

  setNotifications: (list) =>
    set(
      {
        notifications: list,
        unreadCount: list.filter((n) => !n.isRead).length,
      },
      false,
      'notification/setNotifications',
    ),

  addNotification: (n) =>
    set(
      (state: any) => ({
        notifications: [n, ...state.notifications].slice(0, 50),
        unreadCount: state.unreadCount + (n.isRead ? 0 : 1),
      }),
      false,
      'notification/addNotification',
    ),

  markRead: (id) =>
    set(
      (state: any) => ({
        notifications: state.notifications.map((n: Notification) =>
          n.id === id ? { ...n, isRead: true } : n,
        ),
        unreadCount: Math.max(
          0,
          state.notifications.filter((n: Notification) => !n.isRead && n.id !== id).length,
        ),
      }),
      false,
      'notification/markRead',
    ),

  markAllRead: () =>
    set(
      (state: any) => ({
        notifications: state.notifications.map((n: Notification) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }),
      false,
      'notification/markAllRead',
    ),
});
