import { NextResponse } from 'next/server';
import type { Project } from '@/types/projectHubData';
import { readProjectsFile, writeProjectsFile } from '@/server/hubJsonStore';
import { triggerNotification } from '@/app/api/notifications/shared';
import type { OpsRecord } from '@/types/projectHubData';

export async function GET() {
  try {
    const projects = await readProjectsFile();
    return NextResponse.json({ projects });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: '프로젝트 목록을 읽지 못했습니다.' }, { status: 500 });
  }
}

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

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<Project>;
    const projects = await readProjectsFile();
    const id = body.id && !projects.some((p) => p.id === body.id) ? body.id : `p-${makeId()}`;
    const createdAt = nowStamp();
    const defaultOpsRecord: OpsRecord = {
      id: `ops-${makeId()}`,
      title: '프로젝트 신규 생성',
      summary: `${body.name?.trim() || '이름 없음'} 프로젝트가 신규 상태로 생성되었습니다.`,
      createdAt,
    };
    const project: Project = {
      id,
      name: body.name?.trim() || '이름 없음',
      region: body.region ?? '서울',
      use: body.use ?? '업무시설',
      gfa: typeof body.gfa === 'number' ? body.gfa : Number(body.gfa) || 0,
      floors: typeof body.floors === 'number' ? body.floors : Number(body.floors) || 1,
      targetGrade: typeof body.targetGrade === 'number' ? body.targetGrade : Number(body.targetGrade) || 3,
      status: body.status ?? '신규',
      updatedAt: body.updatedAt ?? createdAt,
      map: body.map ?? { zeb: 'none', epi: 'none', ren: 'none', consult: 'none' },
      note: body.note ?? '초기 검토 대기',
      opsRecords:
        Array.isArray(body.opsRecords) && body.opsRecords.length > 0
          ? body.opsRecords
          : [defaultOpsRecord],
    };
    const next = [project, ...projects.filter((p) => p.id !== id)];
    await writeProjectsFile(next);
    void triggerNotification('project_created', {
      project_id: project.id,
      project_name: project.name,
      region: project.region,
      use: project.use,
    });
    return NextResponse.json({ project });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: '프로젝트를 저장하지 못했습니다.' }, { status: 500 });
  }
}
