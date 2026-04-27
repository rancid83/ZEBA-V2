import { cookies } from 'next/headers';
import { SESSION_COOKIE_NAME } from '../auth/shared';

type NotificationType =
  | 'project_created'
  | 'project_deleted'
  | 'ops_record_added'
  | 'profile_updated'
  | 'analysis_completed'
  | 'signup_welcome';

export function getGatewayBase(): string {
  return process.env.ZEBAGATEWAY_MAC || process.env.NEXT_PUBLIC_BACKEND_URL || '';
}

export async function getTokenFromCookie(): Promise<string | null> {
  const store = await cookies();
  const val = store.get(SESSION_COOKIE_NAME)?.value;
  if (!val || val === 'authenticated') return null;
  return val;
}

/**
 * 서버 사이드(API Route)에서 알림을 생성합니다.
 * 토큰이 없으면 조용히 건너뜁니다.
 */
export async function triggerNotification(
  type: NotificationType,
  meta: Record<string, unknown> = {},
): Promise<void> {
  try {
    await gatewayFetch('/api/notifications/trigger', { method: 'POST', body: { type, meta } });
  } catch {
    // 알림 실패는 silent
  }
}

export async function gatewayFetch(
  path: string,
  options: { method?: string; body?: unknown } = {},
): Promise<{ ok: boolean; status: number; data: any }> {
  const base = getGatewayBase();
  if (!base) return { ok: false, status: 500, data: { message: '게이트웨이 주소 미설정' } };

  const token = await getTokenFromCookie();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    headers['x-access-token'] = token;
    headers['x-auth-token'] = token;
    headers['token'] = token;
  }

  const url = `${base.replace(/\/$/, '')}${path}`;
  const res = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    cache: 'no-store',
  });
  const text = await res.text();
  let data: any = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }
  return { ok: res.ok, status: res.status, data };
}
