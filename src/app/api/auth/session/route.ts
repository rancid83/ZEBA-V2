import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SESSION_COOKIE_NAME } from '../shared';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  return NextResponse.json(
    {
      status: true,
      authenticated: Boolean(token),
    },
    { status: 200 },
  );
}
