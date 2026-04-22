import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  extractUserFromToken,
  SESSION_COOKIE_NAME,
  SESSION_USER_COOKIE_NAME,
  extractToken,
  getUserPayloadFields,
  getSessionUser,
  isJwtExpired,
  requestGateway,
  setSessionCookie,
  setSessionUserCookie,
} from '../shared';

type UpdateBody = {
  email?: string;
  name?: string;
  company_name?: string;
};

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const sessionUser = getSessionUser(cookieStore.get(SESSION_USER_COOKIE_NAME)?.value);
  const tokenUser = extractUserFromToken(token);

  if (!token) {
    return NextResponse.json(
      { status: false, error: '로그인이 필요합니다.' },
      { status: 401 },
    );
  }

  if (token === 'authenticated') {
    return NextResponse.json(
      { status: true, data: sessionUser ? { user: sessionUser } : tokenUser ? { user: tokenUser } : {} },
      { status: 200 },
    );
  }

  if (isJwtExpired(token)) {
    return NextResponse.json(
      { status: false, error: '로그인 토큰이 만료되었습니다.' },
      { status: 401 },
    );
  }

  const result = await requestGateway('/auth/me', { method: 'GET', token });
  if (!result.ok) {
    if (sessionUser || tokenUser) {
      return NextResponse.json(
        { status: true, data: { user: sessionUser ?? tokenUser } },
        { status: 200 },
      );
    }

    return NextResponse.json(
      { status: false, error: result.error || '사용자 정보를 불러오지 못했습니다.' },
      { status: result.status || 500 },
    );
  }

  return NextResponse.json({ status: true, data: result.data }, { status: 200 });
}

export async function PATCH(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const sessionUser = getSessionUser(cookieStore.get(SESSION_USER_COOKIE_NAME)?.value);

  const body = (await request.json()) as UpdateBody;
  const email = body.email?.trim();
  const name = body.name?.trim();
  const company_name = body.company_name?.trim() || '';

  if (!email || !name) {
    return NextResponse.json(
      { status: false, error: '이름과 이메일을 입력해 주세요.' },
      { status: 400 },
    );
  }

  const localUser = { email, name, company_name };

  // 쿠키가 없거나 placeholder인 경우 게이트웨이 없이 클라이언트 상태만 업데이트
  if (!token || token === 'authenticated') {
    const response = NextResponse.json(
      { status: true, data: { user: localUser } },
      { status: 200 },
    );
    setSessionCookie(response, token || 'authenticated');
    setSessionUserCookie(response, localUser);
    return response;
  }

  if (isJwtExpired(token)) {
    return NextResponse.json(
      { status: false, error: '로그인 토큰이 만료되었습니다.' },
      { status: 401 },
    );
  }

  const result = await requestGateway('/auth/me', {
    method: 'PATCH',
    token,
    body: getUserPayloadFields({ email, name, company_name }),
  });

  if (!result.ok) {
    if (sessionUser || extractUserFromToken(token)) {
      const fallbackUser = {
        ...(sessionUser ?? extractUserFromToken(token) ?? {}),
        ...localUser,
      };
      const response = NextResponse.json(
        {
          status: true,
          data: {
            user: fallbackUser,
            message: '백엔드 프로필 동기화는 실패했지만 현재 세션에는 반영되었습니다.',
          },
        },
        { status: 200 },
      );
      setSessionUserCookie(response, fallbackUser);
      return response;
    }

    return NextResponse.json(
      {
        status: false,
        error: result.error || '프로필 저장에 실패했습니다.',
      },
      { status: result.status || 500 },
    );
  }

  const d = result.data;
  const updatedUser = d?.user ?? (d?.email ? d : localUser);

  const response = NextResponse.json(
    { status: true, data: { user: updatedUser } },
    { status: 200 },
  );
  const nextToken = extractToken(result.data);
  if (nextToken) {
    setSessionCookie(response, nextToken);
  }
  setSessionUserCookie(response, updatedUser);

  return response;
}
