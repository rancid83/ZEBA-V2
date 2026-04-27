'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store';

export function useAuthStatus() {
  const router = useRouter();
  const user = useStore((state) => state.user);
  const setUser = useStore((state) => state.setUser);
  const clearUser = useStore((state) => state.clearUser);
  const hasSynced = useRef(false);

  // user는 persist되어 즉시 복원됨. 첫 마운트에서 서버 세션을 한 번만 검증한다.
  const refreshAuth = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/session', { cache: 'no-store' });
      const payload = await response.json();
      if (payload?.authenticated && payload?.user) {
        setUser(payload.user);
      } else if (!payload?.authenticated && !payload?.user) {
        // 쿠키가 완전히 없거나 만료된 경우에만 클라이언트 상태를 초기화한다.
        // payload.user가 있으면 세션 쿠키는 살아있는 것이므로 유지한다.
        clearUser();
      }
    } catch {
      // 네트워크 오류 시 기존 persist 상태 유지
    }
  }, [setUser, clearUser]);

  useEffect(() => {
    if (hasSynced.current) return;
    hasSynced.current = true;
    refreshAuth();
  }, [refreshAuth]);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // 쿠키 제거 실패 시에도 클라이언트 상태는 정리한다.
    }
    clearUser();
    router.push('/');
    router.refresh();
  }, [clearUser, router]);

  return {
    authenticated: Boolean(user),
    refreshAuth,
    logout,
  };
}
