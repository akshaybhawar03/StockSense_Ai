import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, AlertTriangle, TrendingDown, RefreshCw, Clock, Upload, Sparkles, X, CheckCircle2 } from 'lucide-react';
import { fetchNotifications, markAsRead, markAllAsRead, deleteNotification, Notification } from '../../services/notificationService';
import { useNavigate } from 'react-router';
import toast from 'react-hot-toast';

const UNREAD_CHECK_MS = 5 * 60 * 1000;   // every 5 min: lightweight count check
const FULL_REFRESH_MS = 10 * 60 * 1000;  // every 10 min: full list background sync

export const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [loading, setLoading] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const lastKnownUnreadRef = useRef(0);
  const unreadTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fullTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const navigate = useNavigate();

  const stopPolling = useCallback(() => {
    if (unreadTimerRef.current) { clearInterval(unreadTimerRef.current); unreadTimerRef.current = null; }
    if (fullTimerRef.current)   { clearInterval(fullTimerRef.current);   fullTimerRef.current   = null; }
  }, []);

  // Full list fetch — used on mount and on bell open
  const fetchFullList = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      const data = await fetchNotifications(undefined, false, 50);
      lastKnownUnreadRef.current = data.unread_count || 0;
      setNotifications(data.notifications || []);
      setUnreadCount(data.unread_count || 0);
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  // Lightweight check — only fetches count, triggers full refresh if count increased
  const checkUnreadCount = useCallback(async () => {
    try {
      const data = await fetchNotifications(undefined, true, 1);
      const newCount = data.unread_count || 0;
      if (newCount > lastKnownUnreadRef.current) {
        const diff = newCount - lastKnownUnreadRef.current;
        toast.success(
          `You have ${diff} new notification${diff > 1 ? 's' : ''} — click the bell to view`,
          { duration: 4000 }
        );
        // Fetch full list so the badge and dropdown stay accurate
        await fetchFullList(false);
      }
    } catch (err) {
      console.error('Failed to check unread count', err);
    }
  }, [fetchFullList]);

  const startPolling = useCallback(() => {
    stopPolling();
    unreadTimerRef.current = setInterval(checkUnreadCount, UNREAD_CHECK_MS);
    fullTimerRef.current   = setInterval(() => fetchFullList(false), FULL_REFRESH_MS);
  }, [checkUnreadCount, fetchFullList, stopPolling]);

  // On mount: one initial full fetch, then start slow background timers
  useEffect(() => {
    fetchFullList(true);
    startPolling();

    // Refresh immediately when a sale or CSV upload happens
    const onDataChanged = () => fetchFullList(false);
    window.addEventListener('csv-uploaded',  onDataChanged);
    window.addEventListener('sale-recorded', onDataChanged);

    // Stop polling when tab is hidden; resume + fetch immediately when visible again
    const handleVisibility = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        fetchFullList(false);
        startPolling();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      stopPolling();
      window.removeEventListener('csv-uploaded',  onDataChanged);
      window.removeEventListener('sale-recorded', onDataChanged);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [fetchFullList, checkUnreadCount, stopPolling, startPolling]);

  // Click outside → close
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  // Bell click: open and fetch fresh list; close and do nothing else
  const handleBellClick = () => {
    const opening = !isOpen;
    setIsOpen(opening);
    if (opening) fetchFullList(true);
  };

  const handleMarkAsRead = async (id: string, productId?: string) => {
    try {
      await markAsRead(undefined, id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(c => Math.max(0, c - 1));
      lastKnownUnreadRef.current = Math.max(0, lastKnownUnreadRef.current - 1);
      if (productId) {
        setIsOpen(false);
        navigate(`/dashboard/inventory?search=${productId}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      lastKnownUnreadRef.current = 0;
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string, wasRead: boolean) => {
    e.stopPropagation();
    try {
      await deleteNotification(undefined, id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (!wasRead) {
        setUnreadCount(c => Math.max(0, c - 1));
        lastKnownUnreadRef.current = Math.max(0, lastKnownUnreadRef.current - 1);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getStyle = (type: string) => {
    switch (type) {
      case 'out_of_stock':      return { bg: 'bg-red-50',    border: 'border-red-200',    icon: <AlertTriangle className="text-red-500 w-5 h-5" /> };
      case 'low_stock':         return { bg: 'bg-orange-50', border: 'border-orange-200', icon: <TrendingDown  className="text-orange-500 w-5 h-5" /> };
      case 'reorder_suggestion':return { bg: 'bg-blue-50',   border: 'border-blue-200',   icon: <RefreshCw     className="text-blue-500 w-5 h-5" /> };
      case 'dead_stock':        return { bg: 'bg-gray-50',   border: 'border-gray-200',   icon: <Clock         className="text-gray-500 w-5 h-5" /> };
      case 'csv_upload':        return { bg: 'bg-green-50',  border: 'border-green-200',  icon: <Upload        className="text-green-500 w-5 h-5" /> };
      case 'ai_report':         return { bg: 'bg-purple-50', border: 'border-purple-200', icon: <Sparkles      className="text-purple-500 w-5 h-5" /> };
      default:                  return { bg: 'bg-gray-50',   border: 'border-gray-200',   icon: <Bell          className="text-gray-500 w-5 h-5" /> };
    }
  };

  const getRelativeTime = (dateString: string) => {
    const diff = (Date.now() - new Date(dateString).getTime()) / 1000;
    if (diff < 60)    return 'Just now';
    if (diff < 3600)  return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hrs ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

  // Client-side filter — no API call on tab switch
  const displayed = filter === 'unread'
    ? notifications.filter(n => !n.is_read)
    : notifications;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleBellClick}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-[380px] max-w-[100vw] bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
          {/* Header */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-800">Notifications</h3>
              {unreadCount > 0 && (
                <span className="bg-[#10b981] text-white text-xs px-2 py-0.5 rounded-full font-medium">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-sm text-[#10b981] hover:text-[#059669] flex items-center gap-1 font-medium transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" /> Mark all read
              </button>
            )}
          </div>

          {/* Filter tabs — client-side only, no API call */}
          <div className="flex border-b border-gray-100">
            {(['all', 'unread'] as const).map(tab => (
              <button
                key={tab}
                className={`flex-1 py-2 text-sm font-medium capitalize ${
                  filter === tab
                    ? 'text-[#10b981] border-b-2 border-[#10b981]'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setFilter(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="max-h-[380px] overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex gap-4 animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-gray-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : displayed.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {displayed.map(notif => {
                  const style = getStyle(notif.type);
                  return (
                    <div
                      key={notif.id}
                      onClick={() => handleMarkAsRead(notif.id, notif.product_id)}
                      className={`group p-4 flex items-start gap-4 hover:bg-gray-50 cursor-pointer transition-colors ${!notif.is_read ? 'bg-blue-50/30' : ''}`}
                    >
                      <div className={`p-2 rounded-lg border ${style.bg} ${style.border}`}>
                        {style.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className={`text-sm font-semibold text-gray-900 ${!notif.is_read ? '' : 'opacity-80'}`}>
                            {notif.title}
                          </h4>
                          <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                            {getRelativeTime(notif.created_at || new Date().toISOString())}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                          {notif.message}
                        </p>
                      </div>
                      <div className="flex flex-col items-center justify-between h-full py-1">
                        {!notif.is_read && <div className="w-2 h-2 rounded-full bg-[#10b981]" />}
                        <button
                          onClick={e => handleDelete(e, notif.id, notif.is_read)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-opacity mt-auto"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center flex flex-col items-center text-gray-500">
                <Bell className="w-12 h-12 text-gray-200 mb-3" />
                <p className="font-medium text-gray-600">You're all caught up!</p>
                <p className="text-sm mt-1">
                  No {filter === 'unread' ? 'unread ' : ''}notifications at this time.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
