import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SESSION_COOKIE_NAME } from '../shared';
import { requestGateway } from '../shared';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

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

  const result = await requestGateway('/auth/me', { method: 'GET', token });
  const user = result.ok ? (result.data?.user ?? null) : null;

  return NextResponse.json(
    {
      status: true,
      authenticated: Boolean(token && user),
      user,
    },
    { status: 200 },
  );
}
