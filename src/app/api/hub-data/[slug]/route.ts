import { NextResponse } from 'next/server';
import {
  isHubDataSlug,
  readHubDataJson,
  writeHubDataJson,
  type HubDataSlug,
} from '@/server/hubJsonStore';

type Ctx = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, context: Ctx) {
  try {
    const { slug } = await context.params;
    if (!isHubDataSlug(slug)) {
      return NextResponse.json({ error: '지원하지 않는 데이터 키입니다.' }, { status: 400 });
    }
    const data = await readHubDataJson(slug as HubDataSlug);
    return NextResponse.json(data);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: '허브 데이터를 읽지 못했습니다.' }, { status: 500 });
  }
}

export async function PUT(request: Request, context: Ctx) {
  try {
    const { slug } = await context.params;
    if (!isHubDataSlug(slug)) {
      return NextResponse.json({ error: '지원하지 않는 데이터 키입니다.' }, { status: 400 });
    }
    const body: unknown = await request.json();
    await writeHubDataJson(slug as HubDataSlug, body);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: '허브 데이터를 저장하지 못했습니다.' }, { status: 500 });
  }
}
