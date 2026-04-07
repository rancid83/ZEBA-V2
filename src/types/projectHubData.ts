export type ModuleKey = 'zeb' | 'epi' | 'ren' | 'consult';
export type ModuleState = 'pass' | 'fail' | 'none';
export type ProjectStatus = '신규' | '진행중' | '완료';

export type OpsRecord = {
  id: string;
  title: string;
  summary: string;
  createdAt: string;
};

export type Project = {
  id: string;
  name: string;
  region: string;
  use: string;
  gfa: number;
  floors: number;
  targetGrade: number;
  status: ProjectStatus;
  updatedAt: string;
  map: Record<ModuleKey, ModuleState>;
  note: string;
  opsRecords: OpsRecord[];
};

export type ProjectsFileShape = { projects: Project[] };
