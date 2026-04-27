import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SESSION_COOKIE_NAME } from '../auth/shared';

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json(
      { status: false, error: '로그인이 필요합니다.' },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(request.url);
  const step = searchParams.get('step') || 'step2';

  const forwardParams = new URLSearchParams();
  searchParams.forEach((value, key) => {
    if (key !== 'step') forwardParams.append(key, value);
  });

  const baseUrl = process.env.ZEBAGATEWAY_MAC || process.env.NEXT_PUBLIC_API_URL || '';
  if (!baseUrl) {
    return NextResponse.json(
      { status: false, error: '게이트웨이 주소가 설정되지 않았습니다.' },
      { status: 500 },
    );
  }

  const qs = forwardParams.toString();
  const gatewayUrl = `${baseUrl}/admin/api/zeb/${step}${qs ? `?${qs}` : ''}`;

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token !== 'authenticated') {
      headers.Authorization = `Bearer ${token}`;
      headers['x-access-token'] = token;
    }

    const response = await fetch(gatewayUrl, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    const raw = await response.text();
    let data: unknown = {};
    try {
      data = JSON.parse(raw);
    } catch {
      data = { raw };
    }

    if (!response.ok) {
      const errMsg = (data as any)?.message || (data as any)?.error || '분석 요청에 실패했습니다.';
      return NextResponse.json({ status: false, error: errMsg }, { status: response.status });
    }

    return NextResponse.json({ status: true, data }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { status: false, error: error?.message || '서버 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
