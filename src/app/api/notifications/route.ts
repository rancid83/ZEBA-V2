import { NextResponse } from 'next/server';
import { gatewayFetch } from './shared';

// GET /api/notifications  — 내 알림 목록
export async function GET() {
  const result = await gatewayFetch('/api/notifications');
  if (!result.ok) {
    return NextResponse.json({ status: true, notifications: [] });
  }
  return NextResponse.json({ status: true, notifications: result.data.notifications ?? [] });
}

// PATCH /api/notifications  — 전체 읽음
export async function PATCH() {
  const result = await gatewayFetch('/api/notifications/read-all', { method: 'PATCH' });
  if (!result.ok) {
    return NextResponse.json({ status: true });
  }
  return NextResponse.json({ status: true });
}
