import { NextResponse } from 'next/server';
import type { OpsRecord, Project } from '@/types/projectHubData';
import { readProjectsFile, writeProjectsFile } from '@/server/hubJsonStore';

type Ctx = { params: Promise<{ id: string; recordId: string }> };

function nowStamp() {
  const d = new Date();
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${yy}-${mm}-${dd} ${hh}:${mi}`;
}

export async function PATCH(request: Request, context: Ctx) {
  try {
    const { id: projectId, recordId } = await context.params;
    const body = (await request.json()) as { title?: string; summary?: string };
    const title = (body.title ?? '').trim();
    const summary = (body.summary ?? '').trim();
    if (!title && !summary) {
      return NextResponse.json({ error: '제목 또는 요약이 필요합니다.' }, { status: 400 });
    }

    const projects = await readProjectsFile();
    const pIdx = projects.findIndex((p) => p.id === projectId);
    if (pIdx < 0) return NextResponse.json({ error: '없는 프로젝트입니다.' }, { status: 404 });

    const prev = projects[pIdx]!;
    const records = prev.opsRecords || [];
    const rIdx = records.findIndex((r) => r.id === recordId);
    if (rIdx < 0) return NextResponse.json({ error: '없는 기록입니다.' }, { status: 404 });

    const updatedAt = nowStamp();
    const nextRecord: OpsRecord = {
      ...records[rIdx]!,
      title: title || '무제 기록',
      summary: summary || '내용 없음',
    };
    const nextRecords = [...records];
    nextRecords[rIdx] = nextRecord;

    const project: Project = {
      ...prev,
      updatedAt,
      opsRecords: nextRecords,
    };
    const next = [...projects];
    next[pIdx] = project;
    await writeProjectsFile(next);
    return NextResponse.json({ project, record: nextRecord });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: '기록 수정 실패' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: Ctx) {
  try {
    const { id: projectId, recordId } = await context.params;
    const projects = await readProjectsFile();
    const pIdx = projects.findIndex((p) => p.id === projectId);
    if (pIdx < 0) return NextResponse.json({ error: '없는 프로젝트입니다.' }, { status: 404 });

    const prev = projects[pIdx]!;
    const records = prev.opsRecords || [];
    const nextRecords = records.filter((r) => r.id !== recordId);
    if (nextRecords.length === records.length) {
      return NextResponse.json({ error: '없는 기록입니다.' }, { status: 404 });
    }

    const updatedAt = nowStamp();
    const project: Project = {
      ...prev,
      updatedAt,
      opsRecords: nextRecords,
    };
    const next = [...projects];
    next[pIdx] = project;
    await writeProjectsFile(next);
    return NextResponse.json({ project });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: '기록 삭제 실패' }, { status: 500 });
  }
}
