import { NextResponse } from 'next/server';
import { gatewayFetch } from '../../../notifications/shared';

// PATCH /api/notifications/:id/read
export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await gatewayFetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
  if (!result.ok) {
    return NextResponse.json({ status: true });
  }
  return NextResponse.json({ status: true });
}
