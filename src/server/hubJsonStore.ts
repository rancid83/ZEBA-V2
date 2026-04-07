import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import type { Project, ProjectsFileShape } from '@/types/projectHubData';
import { seedCollaborationByService } from '@/components/Collaboration/seedData';
import { defaultConsultingHubData, defaultRenewableHubData } from '@/constants/hubFileDefaults';

const DATA_DIR = path.join(process.cwd(), 'data');

const HUB_DATA_SLUGS = ['collaboration', 'consulting', 'epi-seed', 'renewable'] as const;
export type HubDataSlug = (typeof HUB_DATA_SLUGS)[number];

const EPI_SEED_SAMPLE = path.join(
  process.cwd(),
  'src/server/hubDefaults/epi-seed.sample.json',
);

function dataPath(name: string) {
  return path.join(DATA_DIR, `${name}.json`);
}

async function ensureDir() {
  await mkdir(DATA_DIR, { recursive: true });
}

function hubDataFallback(slug: HubDataSlug): unknown {
  switch (slug) {
    case 'collaboration':
      return seedCollaborationByService;
    case 'consulting':
      return defaultConsultingHubData;
    case 'renewable':
      return defaultRenewableHubData;
    default:
      return {};
  }
}

export async function readHubDataJson(slug: HubDataSlug): Promise<unknown> {
  await ensureDir();
  const fp = dataPath(slug);
  try {
    const raw = await readFile(fp, 'utf8');
    return JSON.parse(raw);
  } catch {
    let fb: unknown;
    if (slug === 'epi-seed') {
      const rawSample = await readFile(EPI_SEED_SAMPLE, 'utf8');
      fb = JSON.parse(rawSample);
    } else {
      fb = hubDataFallback(slug);
    }
    await writeFile(fp, JSON.stringify(fb, null, 2), 'utf8');
    return fb;
  }
}

export async function writeHubDataJson(slug: HubDataSlug, data: unknown): Promise<void> {
  await ensureDir();
  await writeFile(dataPath(slug), JSON.stringify(data, null, 2), 'utf8');
}

export async function readProjectsFile(): Promise<Project[]> {
  await ensureDir();
  const fp = dataPath('projects');
  try {
    const raw = await readFile(fp, 'utf8');
    const parsed = JSON.parse(raw) as ProjectsFileShape;
    return Array.isArray(parsed.projects) ? parsed.projects : [];
  } catch {
    const fallback: ProjectsFileShape = {
      projects: [
        {
          id: 'p-001',
          name: '성수 업무시설',
          region: '서울',
          use: '업무시설',
          gfa: 12800,
          floors: 12,
          targetGrade: 3,
          status: '진행중',
          updatedAt: '2026-03-03 17:20',
          map: { zeb: 'pass', epi: 'fail', ren: 'pass', consult: 'none' },
          note: 'EPI 재검토 필요 · 62점 / 기준 65점',
          opsRecords: [
            {
              id: 'ops-001',
              title: 'EPI 재검토 요청',
              summary: '설계팀에 EPI 보완안 요청, 외피 항목 우선 확인 필요',
              createdAt: '2026-03-03 17:20',
            },
          ],
        },
        {
          id: 'p-002',
          name: '동탄 교육연구시설',
          region: '경기',
          use: '교육연구시설',
          gfa: 9200,
          floors: 7,
          targetGrade: 4,
          status: '진행중',
          updatedAt: '2026-03-02 11:05',
          map: { zeb: 'pass', epi: 'pass', ren: 'none', consult: 'none' },
          note: 'ZEB · EPI 검토 완료',
          opsRecords: [
            {
              id: 'ops-002',
              title: '검토 완료 공유',
              summary: 'ZEB 및 EPI 1차 검토 완료, 신재생 검토만 남음',
              createdAt: '2026-03-02 11:05',
            },
          ],
        },
        {
          id: 'p-003',
          name: '여의도 공동주택(가칭)',
          region: '서울',
          use: '공동주택',
          gfa: 18500,
          floors: 20,
          targetGrade: 2,
          status: '신규',
          updatedAt: '2026-03-03 09:12',
          map: { zeb: 'none', epi: 'none', ren: 'none', consult: 'none' },
          note: '초기 검토 대기',
          opsRecords: [],
        },
      ],
    };
    await writeFile(fp, JSON.stringify(fallback, null, 2), 'utf8');
    return fallback.projects;
  }
}

export async function writeProjectsFile(projects: Project[]): Promise<void> {
  await ensureDir();
  const body: ProjectsFileShape = { projects };
  await writeFile(dataPath('projects'), JSON.stringify(body, null, 2), 'utf8');
}

export function isHubDataSlug(s: string): s is HubDataSlug {
  return (HUB_DATA_SLUGS as readonly string[]).includes(s);
}
