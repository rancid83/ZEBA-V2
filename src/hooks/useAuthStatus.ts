'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store';

export function useAuthStatus() {
  const router = useRouter();
  const user = useStore((state) => state.user);
  const setUser = useStore((state) => state.setUser);
  const clearUser = useStore((state) => state.clearUser);
  const [authenticated, setAuthenticated] = useState(Boolean(user));

  const refreshAuth = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/session', { cache: 'no-store' });
      const payload = await response.json();
      if (payload?.authenticated && payload?.user && !user) {
        setUser(payload.user);
      }
      setAuthenticated(Boolean(payload?.authenticated || user));
    } catch {
      setAuthenticated(Boolean(user));
    }
  }, [setUser, user]);

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  useEffect(() => {
    setAuthenticated(Boolean(user) || authenticated);
  }, [user, authenticated]);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // 쿠키 제거 실패 시에도 클라이언트 상태는 정리한다.
    }
    clearUser();
    setAuthenticated(false);
    router.push('/');
    router.refresh();
  }, [clearUser, router]);

  return {
    authenticated,
    refreshAuth,
    logout,
  };
}
