import { NextResponse } from 'next/server';

export const SESSION_COOKIE_NAME = 'zeba_session';
const DEFAULT_LOGIN_PATH = '/auth/login';
const DEFAULT_SIGNUP_PATH = '/auth/signup';

type GatewayResult = {
  ok: boolean;
  status: number;
  data?: any;
  error?: string;
};

type GatewayMethod = 'GET' | 'POST' | 'PATCH';

function getBaseUrl() {
  return process.env.ZEBAGATEWAY_MAC || process.env.NEXT_PUBLIC_API_URL || '';
}

function joinUrl(baseUrl: string, path: string) {
  const trimmedBase = baseUrl.replace(/\/+$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${trimmedBase}${normalizedPath}`;
}

async function requestGateway(
  path: string,
  options: {
    method?: GatewayMethod;
    body?: Record<string, unknown>;
    token?: string | null;
  } = {},
): Promise<GatewayResult> {
  const baseUrl = getBaseUrl();
  if (!baseUrl) {
    return {
      ok: false,
      status: 500,
      error: '게이트웨이 주소가 설정되지 않았습니다. ZEBAGATEWAY_MAC을 확인해 주세요.',
    };
  }

  try {
    const method = options.method || 'POST';
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (options.token) {
      headers.Authorization = `Bearer ${options.token}`;
    }

    const response = await fetch(joinUrl(baseUrl, path), {
      method,
      headers,
      body: method === 'GET' ? undefined : JSON.stringify(options.body || {}),
      cache: 'no-store',
    });

    const raw = await response.text();
    let data: any = {};
    if (raw) {
      try {
        data = JSON.parse(raw);
      } catch {
        data = { raw };
      }
    }

    const headerToken =
      response.headers.get('x-access-token') ||
      response.headers.get('authorization') ||
      response.headers.get('Authorization');
    if (headerToken && !data?.token && !data?.accessToken && !data?.access_token) {
      data.token = headerToken.replace(/^Bearer\s+/i, '').trim();
    }
    const error =
      data?.message || data?.error || data?.detail || (response.ok ? undefined : '인증 요청에 실패했습니다.');

    return {
      ok: response.ok,
      status: response.status,
      data,
      error,
    };
  } catch (error: any) {
    return {
      ok: false,
      status: 502,
      error: error?.message || '게이트웨이 요청 처리 중 오류가 발생했습니다.',
    };
  }
}

async function callGateway(path: string, body: Record<string, unknown>): Promise<GatewayResult> {
  return requestGateway(path, { method: 'POST', body });
}

export function getAuthPath(kind: 'login' | 'signup') {
  if (kind === 'login') {
    return process.env.ZEBAGATEWAY_LOGIN_PATH || DEFAULT_LOGIN_PATH;
  }
  return process.env.ZEBAGATEWAY_SIGNUP_PATH || DEFAULT_SIGNUP_PATH;
}

export function extractToken(payload: any) {
  return (
    payload?.token ||
    payload?.accessToken ||
    payload?.access_token ||
    payload?.data?.token ||
    payload?.data?.accessToken ||
    payload?.data?.access_token ||
    null
  );
}

export function getFieldKey(kind: 'email' | 'password' | 'name') {
  if (kind === 'email') {
    return process.env.ZEBAGATEWAY_EMAIL_KEY || 'email';
  }
  if (kind === 'password') {
    return process.env.ZEBAGATEWAY_PASSWORD_KEY || 'password';
  }
  return process.env.ZEBAGATEWAY_NAME_KEY || 'name';
}

export function toGatewayPayload(input: { email: string; password: string; name?: string }) {
  const payload: Record<string, string> = {
    [getFieldKey('email')]: input.email,
    [getFieldKey('password')]: input.password,
  };

  if (input.name) {
    payload[getFieldKey('name')] = input.name;
  }

  return payload;
}

export function getUserPayloadFields(input: { email: string; name: string; company_name?: string }) {
  return {
    email: input.email,
    name: input.name,
    company_name: input.company_name || '',
  };
}

export function setSessionCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

export { callGateway, requestGateway };
