import { NextResponse } from 'next/server';
import type { OpsRecord, Project } from '@/types/projectHubData';
import { readProjectsFile, writeProjectsFile } from '@/server/hubJsonStore';

type Ctx = { params: Promise<{ id: string }> };

function makeId() {
  return Math.random().toString(16).slice(2, 10);
}

function nowStamp() {
  const d = new Date();
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${yy}-${mm}-${dd} ${hh}:${mi}`;
}

export async function POST(request: Request, context: Ctx) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as { title?: string; summary?: string };
    const title = (body.title ?? '').trim();
    const summary = (body.summary ?? '').trim();
    if (!title && !summary) {
      return NextResponse.json({ error: '제목 또는 요약이 필요합니다.' }, { status: 400 });
    }
    const projects = await readProjectsFile();
    const idx = projects.findIndex((p) => p.id === id);
    if (idx < 0) return NextResponse.json({ error: '없는 프로젝트입니다.' }, { status: 404 });

    const createdAt = nowStamp();
    const record: OpsRecord = {
      id: `ops-${makeId()}`,
      title: title || '무제 기록',
      summary: summary || '내용 없음',
      createdAt,
    };

    const prev = projects[idx]!;
    const project: Project = {
      ...prev,
      updatedAt: createdAt,
      opsRecords: [record, ...(prev.opsRecords || [])],
    };
    const next = [...projects];
    next[idx] = project;
    await writeProjectsFile(next);
    return NextResponse.json({ project, record });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: '기록 저장 실패' }, { status: 500 });
  }
}
