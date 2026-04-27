import axios from 'axios';

type AuthResponse<T = unknown> = {
  message?: string;
  code?: number;
} & T;

export type AuthUser = {
  id?: number;
  email: string;
  name?: string;
  company_name?: string;
  write_permission_yn?: 'Y' | 'N';
};

export type SignupPayload = {
  email: string;
  password: string;
  name: string;
  company_name?: string;
  write_permission_yn?: 'Y' | 'N';
};

export type LoginPayload = {
  email: string;
  password: string;
};

const AUTH_TOKEN_KEY = 'data_hub_token';
const AUTH_USER_KEY = 'data_hub_user';

function getGatewayBaseUrl(): string {
  return process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:1218';
}

const authApi = axios.create({
  baseURL: `${getGatewayBaseUrl()}/auth`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
  withCredentials: true,
});

export async function signup(payload: SignupPayload): Promise<AuthResponse<{ insertId?: number }>> {
  const response = await authApi.post('/signup', payload);
  return response.data;
}

export async function login(
  payload: LoginPayload,
): Promise<AuthResponse<{ token?: string; user?: AuthUser }>> {
  const response = await authApi.post('/login', payload);
  return response.data;
}

export async function getMe(token?: string): Promise<AuthResponse<{ user?: AuthUser }>> {
  const authToken = token || getAuthToken();
  const response = await authApi.get('/me', {
    headers: authToken
      ? {
          Authorization: `Bearer ${authToken}`,
        }
      : undefined,
  });
  return response.data;
}

export async function logout(token?: string): Promise<AuthResponse> {
  const authToken = token || getAuthToken();
  const response = await authApi.post(
    '/logout',
    {},
    {
      headers: authToken
        ? {
            Authorization: `Bearer ${authToken}`,
          }
        : undefined,
    },
  );
  return response.data;
}

export function saveAuthSession(token: string, user?: AuthUser) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  if (user) {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  }
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function getStoredAuthUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(AUTH_USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function clearAuthSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}
