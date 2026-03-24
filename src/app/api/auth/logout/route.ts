import { NextResponse } from 'next/server';
import { clearSessionCookie } from '../shared';

export async function POST() {
  const response = NextResponse.json(
    {
      status: true,
      message: '로그아웃되었습니다.',
    },
    { status: 200 },
  );

  clearSessionCookie(response);
  return response;
}
