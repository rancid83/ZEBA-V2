import { NextResponse } from 'next/server';
import { gatewayFetch } from '../shared';

// GET /api/notifications/unread-count
export async function GET() {
  const result = await gatewayFetch('/api/notifications/unread-count');
  if (!result.ok) {
    return NextResponse.json({ status: true, unreadCount: 0 });
  }
  return NextResponse.json({ status: true, unreadCount: result.data.unreadCount ?? 0 });
}
