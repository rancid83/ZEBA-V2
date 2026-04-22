import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  extractUserFromToken,
  getSessionUser,
  isJwtExpired,
  SESSION_COOKIE_NAME,
  SESSION_USER_COOKIE_NAME,
} from '../shared';
import { requestGateway } from '../shared';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const sessionUser = getSessionUser(cookieStore.get(SESSION_USER_COOKIE_NAME)?.value);
  const tokenUser = extractUserFromToken(token);

  if (!token) {
    return NextResponse.json(
      {
        status: true,
        authenticated: false,
        user: null,
      },
      { status: 200 },
    );
  }

  // 토큰이 placeholder('authenticated')인 경우 게이트웨이 검증을 건너뜀
  const isPlaceholder = token === 'authenticated';
  let user = sessionUser ?? tokenUser;
  let authenticated = !isJwtExpired(token);

  if (!isPlaceholder && authenticated) {
    const result = await requestGateway('/auth/me', { method: 'GET', token });
    if (result.ok) {
      // 게이트웨이 응답이 { user: {...} } 또는 { id, email, ... } 두 형태 모두 처리
      const d = result.data;
      user = d?.user ?? (d?.email ? d : sessionUser ?? tokenUser);
    } else {
      // /auth/me 연동이 불안정해도 JWT가 유효하면 세션 표시는 유지한다.
      user = sessionUser ?? tokenUser;
    }
  }

  return NextResponse.json(
    {
      status: true,
      authenticated,
      user,
    },
    { status: 200 },
  );
}
