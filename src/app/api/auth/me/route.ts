import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  SESSION_COOKIE_NAME,
  extractToken,
  getUserPayloadFields,
  requestGateway,
  setSessionCookie,
} from '../shared';

type UpdateBody = {
  email?: string;
  name?: string;
  company_name?: string;
};

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json(
      { status: false, error: '로그인이 필요합니다.' },
      { status: 401 },
    );
  }

  const result = await requestGateway('/auth/me', { method: 'GET', token });
  if (!result.ok) {
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

  if (!token) {
    return NextResponse.json(
      { status: false, error: '로그인이 필요합니다.' },
      { status: 401 },
    );
  }

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

  const result = await requestGateway('/auth/me', {
    method: 'PATCH',
    token,
    body: getUserPayloadFields({ email, name, company_name }),
  });

  if (!result.ok) {
    return NextResponse.json(
      { status: false, error: result.error || '프로필 수정에 실패했습니다.' },
      { status: result.status || 500 },
    );
  }

  const response = NextResponse.json({ status: true, data: result.data }, { status: 200 });
  const nextToken = extractToken(result.data);
  if (nextToken) {
    setSessionCookie(response, nextToken);
  }

  return response;
}
