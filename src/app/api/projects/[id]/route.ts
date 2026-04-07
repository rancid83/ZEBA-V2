import { NextResponse } from 'next/server';
import type { Project } from '@/types/projectHubData';
import { readProjectsFile, writeProjectsFile } from '@/server/hubJsonStore';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Ctx) {
  try {
    const { id } = await context.params;
    const projects = await readProjectsFile();
    const project = projects.find((p) => p.id === id);
    if (!project) return NextResponse.json({ error: '없는 프로젝트입니다.' }, { status: 404 });
    return NextResponse.json({ project });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: '읽기 실패' }, { status: 500 });
  }
}

export async function PUT(request: Request, context: Ctx) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as Project;
    if (body.id !== id) {
      return NextResponse.json({ error: '본문 id와 경로가 일치해야 합니다.' }, { status: 400 });
    }
    const projects = await readProjectsFile();
    const idx = projects.findIndex((p) => p.id === id);
    if (idx < 0) return NextResponse.json({ error: '없는 프로젝트입니다.' }, { status: 404 });
    const next = [...projects];
    next[idx] = body;
    await writeProjectsFile(next);
    return NextResponse.json({ project: body });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: '저장 실패' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: Ctx) {
  try {
    const { id } = await context.params;
    const projects = await readProjectsFile();
    const next = projects.filter((p) => p.id !== id);
    if (next.length === projects.length) {
      return NextResponse.json({ error: '없는 프로젝트입니다.' }, { status: 404 });
    }
    await writeProjectsFile(next);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: '삭제 실패' }, { status: 500 });
  }
}
