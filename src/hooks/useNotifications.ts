'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useStore } from '@/store';

const POLL_INTERVAL_MS = 30_000; // 30초 폴링 (Socket.io 미연결 환경 대비)

export function useNotifications() {
  const user = useStore((s) => s.user);
  const setNotifications = useStore((s) => s.setNotifications);
  const markReadStore = useStore((s) => s.markRead);
  const markAllReadStore = useStore((s) => s.markAllRead);
  const notifications = useStore((s) => s.notifications);
  const unreadCount = useStore((s) => s.unreadCount);

  const loaded = useRef(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/notifications', { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.notifications)) {
        setNotifications(data.notifications);
      }
    } catch {
      // 네트워크 오류 무시
    }
  }, [user, setNotifications]);

  // 첫 로드 + 폴링
  useEffect(() => {
    if (!user) return;
    if (!loaded.current) {
      loaded.current = true;
      load();
    }
    pollRef.current = setInterval(load, POLL_INTERVAL_MS);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [user, load]);


  const markRead = useCallback(async (id: number) => {
    markReadStore(id);
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
    } catch { /* 실패해도 UI는 이미 업데이트 */ }
  }, [markReadStore]);

  const markAllRead = useCallback(async () => {
    markAllReadStore();
    try {
      await fetch('/api/notifications', { method: 'PATCH' });
    } catch { /* 실패해도 UI는 이미 업데이트 */ }
  }, [markAllReadStore]);

  return { notifications, unreadCount, load, markRead, markAllRead };
}
