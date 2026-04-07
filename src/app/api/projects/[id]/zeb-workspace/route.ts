import { NextResponse } from 'next/server';
import type { Project } from '@/types/projectHubData';
import type { ZebMultiScenarioWorkspaceState } from '@/types/zebMultiScenario';
import { readProjectsFile, writeProjectsFile } from '@/server/hubJsonStore';

type Ctx = { params: Promise<{ id: string }> };

function nowStamp() {
  const d = new Date();
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${yy}-${mm}-${dd} ${hh}:${mi}`;
}

function isValidWorkspace(body: unknown): body is ZebMultiScenarioWorkspaceState {
  if (!body || typeof body !== 'object') return false;
  const o = body as Record<string, unknown>;
  return (
    typeof o.compareMode === 'boolean' &&
    (o.baseline === 'A' || o.baseline === 'B' || o.baseline === 'C') &&
    (o.selected === 'A' || o.selected === 'B' || o.selected === 'C') &&
    typeof o.managerNote === 'string' &&
    Array.isArray(o.scenarios) &&
    Array.isArray(o.savedLibrary) &&
    typeof o.selectedSavedRecordId === 'string'
  );
}

export async function PATCH(request: Request, context: Ctx) {
  try {
    const { id: projectId } = await context.params;
    const body: unknown = await request.json();
    if (!isValidWorkspace(body)) {
      return NextResponse.json({ error: '유효하지 않은 ZEB 워크스페이스 데이터입니다.' }, { status: 400 });
    }

    const projects = await readProjectsFile();
    const idx = projects.findIndex((p) => p.id === projectId);
    if (idx < 0) return NextResponse.json({ error: '없는 프로젝트입니다.' }, { status: 404 });

    const prev = projects[idx]!;
    const updatedAt = nowStamp();
    const project: Project = {
      ...prev,
      updatedAt,
      zebWorkspace: body,
    };
    const next = [...projects];
    next[idx] = project;
    await writeProjectsFile(next);
    return NextResponse.json({ project });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'ZEB 워크스페이스 저장 실패' }, { status: 500 });
  }
}
