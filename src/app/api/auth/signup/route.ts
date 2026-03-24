import { NextResponse } from 'next/server';
import { callGateway, extractToken, getAuthPath, setSessionCookie, toGatewayPayload } from '../shared';

type SignupBody = {
  email?: string;
  password?: string;
  name?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SignupBody;
    const email = body?.email?.trim();
    const password = body?.password;
    const name = body?.name?.trim();

    if (!email || !password || !name) {
      return NextResponse.json(
        {
          status: false,
          error: '이름, 이메일, 비밀번호를 모두 입력해 주세요.',
        },
        { status: 400 },
      );
    }

    const result = await callGateway(getAuthPath('signup'), toGatewayPayload({ email, password, name }));
    if (!result.ok) {
      return NextResponse.json(
        {
          status: false,
          error: result.error || '회원가입에 실패했습니다.',
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
    if (token) {
      setSessionCookie(response, token);
    }

    return response;
  } catch (error: any) {
    return NextResponse.json(
      {
        status: false,
        error: error?.message || '회원가입 처리 중 오류가 발생했습니다.',
      },
      { status: 500 },
    );
  }
}
