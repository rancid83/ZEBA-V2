import { NextResponse } from 'next/server';
import {
  callGateway,
  extractToken,
  extractUser,
  getAuthPath,
  setSessionCookie,
  setSessionUserCookie,
  toGatewayPayload,
} from '../shared';

type LoginBody = {
  email?: string;
  password?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LoginBody;
    const email = body?.email?.trim();
    const password = body?.password;

    if (!email || !password) {
      return NextResponse.json(
        {
          status: false,
          error: '이메일과 비밀번호를 입력해 주세요.',
        },
        { status: 400 },
      );
    }

    const result = await callGateway(getAuthPath('login'), toGatewayPayload({ email, password }));
    if (!result.ok) {
      return NextResponse.json(
        {
          status: false,
          error: result.error || '로그인에 실패했습니다.',
          gatewayStatus: result.status,
        },
        { status: result.status || 500 },
      );
    }

    const response = NextResponse.json(
      {
        status: true,
        data: result.data,
      },
      { status: 200 },
    );

    const token = extractToken(result.data);
    const user = extractUser(result.data);
    setSessionCookie(response, token || 'authenticated');
    setSessionUserCookie(response, user);

    return response;
  } catch (error: any) {
    return NextResponse.json(
      {
        status: false,
        error: error?.message || '로그인 처리 중 오류가 발생했습니다.',
      },
      { status: 500 },
    );
  }
}
