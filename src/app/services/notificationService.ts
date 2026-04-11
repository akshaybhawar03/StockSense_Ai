import { api } from './api';

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  product_id?: string;
  created_at: string;
}

export const fetchNotifications = async (token?: string, unreadOnly = false, limit = 50) => {
  const { data } = await api.get(`/notifications?unread_only=${unreadOnly}&limit=${limit}`);
  return data;
};

export const markAsRead = async (token: string | undefined, notificationId: string) => {
  const { data } = await api.patch(`/notifications/${notificationId}/read`);
  return data;
};

export const markAllAsRead = async (token?: string) => {
  const { data } = await api.patch(`/notifications/read-all`);
  return data;
};

export const deleteNotification = async (token: string | undefined, notificationId: string) => {
  const { data } = await api.delete(`/notifications/${notificationId}`);
  return data;
};

export const triggerScan = async (token?: string) => {
  try {
    const { data } = await api.post(`/notifications/trigger-scan`);
    return data;
  } catch (err) {
    console.error('Failed to trigger scan manually', err);
    return null;
  }
};
