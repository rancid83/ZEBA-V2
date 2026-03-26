'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CollaborationPanel from '@/components/Collaboration/CollaborationPanel';
import {
  BarChart3,
  Bell,
  Building2,
  CheckCircle2,
  CircleDashed,
  HelpCircle,
  Leaf,
  Lock,
  MessageSquare,
  NotebookPen,
  PhoneCall,
  Settings,
  TriangleAlert,
  User,
  X,
} from 'lucide-react';

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------
type ModuleKey = 'zeb' | 'epi' | 'ren' | 'consult';
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

type WorkspaceTab = ModuleKey | 'ops';

type ModuleMetrics = {
  zebCurrent: number | '–';
  epiCurrent: number | '–';
  renCurrent: number | '–';
  zebMargin: number | '–';
  epiMargin: number | '–';
  renMargin: number | '–';
};

const initialProjects: Project[] = [
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
];

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------
function fmt(n: number) {
  return new Intl.NumberFormat('ko-KR').format(n);
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

function makeId() {
  return Math.random().toString(16).slice(2, 10);
}

function stateIcon(state: ModuleState) {
  if (state === 'pass')
    return <CheckCircle2 className="h-3 w-3 text-emerald-600 opacity-90" />;
  if (state === 'fail')
    return <TriangleAlert className="h-3 w-3 text-rose-500 opacity-90" />;
  return <CircleDashed className="h-3 w-3 text-slate-300 opacity-80" />;
}

function stateText(state: ModuleState) {
  if (state === 'pass') return '충족';
  if (state === 'fail') return '미충족';
  return '검토 전';
}

function statusBadgeClass(status: ProjectStatus) {
  if (status === '신규') return 'bg-slate-100 text-slate-600 border border-slate-200';
  if (status === '완료') return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
  return 'bg-slate-800 text-slate-100 border border-slate-700';
}

function latestOpsRecord(project: Project): OpsRecord | null {
  const records = project.opsRecords ?? [];
  if (!records.length) return null;
  return [...records].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )[0]!;
}

function projectStatusText(project: Project) {
  const latest = latestOpsRecord(project);
  if (latest) return `${latest.title} · ${latest.summary}`;
  return project.note || '초기 검토 대기';
}

function sortProjects(projects: Project[]) {
  return [...projects].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

function moduleMetrics(project: Project): ModuleMetrics {
  const zebCurrent =
    project.map.zeb === 'pass'
      ? Math.max(1, project.targetGrade - 1)
      : project.map.zeb === 'fail'
        ? project.targetGrade + 1
        : '–';
  const epiCurrent =
    project.map.epi === 'pass' ? 68 : project.map.epi === 'fail' ? 62 : '–';
  const renCurrent =
    project.map.ren === 'pass' ? 21.5 : project.map.ren === 'fail' ? 17 : '–';
  const zebMargin = typeof zebCurrent === 'number' ? project.targetGrade - zebCurrent : '–';
  const epiMargin = typeof epiCurrent === 'number' ? epiCurrent - 65 : '–';
  const renMargin = typeof renCurrent === 'number' ? renCurrent - 20 : '–';

  return {
    zebCurrent,
    epiCurrent,
    renCurrent,
    zebMargin,
    epiMargin,
    renMargin,
  };
}

function progressPercent(kind: 'zeb' | 'epi' | 'ren', metrics: ModuleMetrics, project: Project) {
  if (kind === 'zeb') {
    if (typeof metrics.zebCurrent !== 'number') return 24;
    const ratio = ((project.targetGrade - metrics.zebCurrent + 2) / 3) * 100;
    return Math.max(18, Math.min(100, ratio));
  }
  if (kind === 'epi') {
    if (typeof metrics.epiCurrent !== 'number') return 24;
    return Math.max(18, Math.min(100, (metrics.epiCurrent / 80) * 100));
  }
  if (kind === 'ren') {
    if (typeof metrics.renCurrent !== 'number') return 24;
    return Math.max(18, Math.min(100, (metrics.renCurrent / 30) * 100));
  }
  return 24;
}

// ------------------------------------------------------------
// UI primitives
// ------------------------------------------------------------
function InfoCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-3xl border border-slate-200 bg-white p-5 shadow-sm ${className}`.trim()}
    >
      {children}
    </div>
  );
}

function SimpleButton({
  children,
  tone,
  type = 'button',
  onClick,
  className = '',
}: {
  children: React.ReactNode;
  tone?: 'solid';
  type?: 'button' | 'submit';
  onClick?: () => void;
  className?: string;
}) {
  const toneCls =
    tone === 'solid'
      ? 'bg-slate-800 text-slate-100 border-slate-700 hover:bg-slate-700'
      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50';
  return (
    <button
      type={type}
      onClick={onClick}
      className={`rounded-2xl border px-4 py-2 text-sm font-medium transition hover:opacity-90 ${toneCls} ${className}`.trim()}
    >
      {children}
    </button>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <div className="mb-2 text-sm text-slate-600">{children}</div>;
}

type MetricMiniCardProps = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  hint: string;
  target: React.ReactNode;
  current: React.ReactNode;
  margin: React.ReactNode;
  progress: number;
  stateMark: React.ReactNode;
  isFail: boolean;
  isIdle: boolean;
  caption: string;
  tooltip?: string;
  activeTone?: 'teal' | 'rose';
};

function MetricMiniCard(props: MetricMiniCardProps) {
  const Icon = props.icon;
  const barTone = props.isIdle
    ? 'bg-slate-300'
    : props.isFail
      ? 'bg-rose-500'
      : props.activeTone === 'rose'
        ? 'bg-rose-500'
        : 'bg-teal-600';

  return (
    <div className="rounded-2xl border p-3.5" title={props.tooltip}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-xl ${
              props.activeTone === 'rose' ? 'bg-rose-50 text-rose-700' : 'bg-slate-50 text-teal-700'
            }`}
          >
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900">{props.label}</div>
            <div className="text-[11px] text-slate-400">{props.hint}</div>
          </div>
        </div>
        <div className="text-sm">{props.stateMark}</div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-slate-50 px-3 py-2">
          <div className="text-[10px] text-slate-400">목표</div>
          <div className="mt-1 text-sm font-semibold">{props.target}</div>
        </div>
        <div className="rounded-xl bg-slate-50 px-3 py-2">
          <div className="text-[10px] text-slate-400">현재</div>
          <div className="mt-1 text-sm font-semibold">{props.current}</div>
        </div>
        <div className="rounded-xl bg-slate-50 px-3 py-2">
          <div className="text-[10px] text-slate-400">여유</div>
          <div className="mt-1 text-sm font-semibold">{props.margin}</div>
        </div>
      </div>

      <div className="mt-3">
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div className={`h-full rounded-full ${barTone}`} style={{ width: `${props.progress}%` }} />
        </div>
      </div>
      <div className="mt-2 text-xs font-medium text-slate-500">{props.caption}</div>
    </div>
  );
}

function MiniMap({ map, compact }: { map: Project['map']; compact?: boolean }) {
  function item(label: string, state: ModuleState, Icon: React.ComponentType<{ className?: string }>) {
    return (
      <div className={`rounded-2xl border bg-white ${compact ? 'px-2 py-2' : 'px-3 py-2'}`}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Icon className="h-3.5 w-3.5" />
            <span>{label}</span>
          </div>
          <div className="text-sm font-semibold">{stateIcon(state)}</div>
        </div>
        {!compact ? <div className="mt-1 text-[11px] text-slate-400">{stateText(state)}</div> : null}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {item('ZEB', map.zeb, Building2)}
      {item('EPI', map.epi, BarChart3)}
      {item('신재생', map.ren, Leaf)}
      {item('컨설팅', map.consult, PhoneCall)}
    </div>
  );
}

function HomeSidebar(props: {
  breadcrumb: React.ReactNode;
  kpi: { total: number; active: number; done: number; need: number };
  query: string;
  setQuery: (v: string) => void;
  statusFilter: ProjectStatus | '전체';
  setStatusFilter: (v: ProjectStatus | '전체') => void;
}) {
  const { breadcrumb, kpi, query, setQuery, statusFilter, setStatusFilter } = props;

  return (
    <div className="w-80 shrink-0 border-r border-slate-200 bg-white p-5">
      <div className="mb-4 border-b border-slate-100 pb-4">{breadcrumb}</div>
      <div className="space-y-5">
        <InfoCard>
          <div className="mb-3 text-sm font-semibold">현황</div>
          <div className="space-y-2">
            <div className="rounded-2xl border p-3">
              <div className="text-xs text-slate-500">전체 프로젝트</div>
              <div className="mt-1 text-2xl font-semibold">{kpi.total}</div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-2xl border p-3">
                <div className="text-[11px] text-slate-500">검토 진행</div>
                <div className="mt-1 font-semibold">{kpi.active}</div>
              </div>
              <div className="rounded-2xl border p-3">
                <div className="text-[11px] text-slate-500">판단 완료</div>
                <div className="mt-1 font-semibold">{kpi.done}</div>
              </div>
              <div className="rounded-2xl border p-3">
                <div className="text-[11px] text-slate-500">재검토 필요</div>
                <div className="mt-1 font-semibold">{kpi.need}</div>
              </div>
            </div>
          </div>
        </InfoCard>

        <InfoCard>
          <div className="mb-3 text-sm font-semibold">검색</div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="프로젝트 검색"
            className="w-full rounded-2xl border px-3 py-2 text-sm outline-none"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | '전체')}
            className="mt-2 w-full rounded-2xl border px-3 py-2 text-sm outline-none"
          >
            <option value="전체">전체</option>
            <option value="신규">신규</option>
            <option value="진행중">진행중</option>
            <option value="완료">완료</option>
          </select>
        </InfoCard>
      </div>
    </div>
  );
}

function ServiceNavMetricButton(props: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  hint: string;
  target: React.ReactNode;
  current: React.ReactNode;
  margin: React.ReactNode;
  progress: number;
  stateMark: React.ReactNode;
  isFail: boolean;
  isIdle: boolean;
  caption: string;
  tooltip?: string;
  activeTone?: 'teal' | 'rose';
  active: boolean;
  ringClass: string;
  bgClass: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      className={`block w-full text-left transition ${props.active ? 'scale-[1.005]' : 'cursor-pointer hover:scale-[1.02] hover:opacity-100 hover:shadow-md hover:brightness-[1.02]'}`}
    >
      <div
        className={`rounded-2xl ${props.active ? `ring-2 ${props.ringClass} ${props.bgClass}` : ''}`}
      >
        <MetricMiniCard
          icon={props.icon}
          label={props.label}
          hint={props.hint}
          target={props.target}
          current={props.current}
          margin={props.margin}
          progress={props.progress}
          stateMark={props.stateMark}
          isFail={props.isFail}
          isIdle={props.isIdle}
          caption={props.caption}
          tooltip={props.tooltip}
          activeTone={props.activeTone}
        />
      </div>
    </button>
  );
}

function CollaborationRightDrawer(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceKind: 'zeb' | 'epi' | 'ren';
}) {
  const { open, onOpenChange, serviceKind } = props;
  const serviceTitle =
    serviceKind === 'zeb' ? 'ZEB' : serviceKind === 'epi' ? 'EPI' : '신재생';

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onOpenChange]);

  return (
    <>
      {/* 플로팅 탭(책갈피) — 닫힌 상태에서만 노출 */}
      <button
        type="button"
        aria-expanded={open}
        aria-controls="project-hub-collab-drawer"
        onClick={() => onOpenChange(true)}
        className={`fixed right-0 top-[40%] z-[35] flex h-[7.25rem] w-10 -translate-y-1/2 flex-col items-center justify-center gap-2 rounded-l-xl border border-r-0 border-slate-200 bg-white py-3 shadow-[0_4px_24px_rgba(15,23,42,0.12)] transform-gpu transition-[transform,opacity,box-shadow] duration-200 ease-out will-change-transform motion-reduce:transition-none hover:bg-slate-50 hover:shadow-[0_6px_28px_rgba(15,23,42,0.16)] active:scale-[0.98] ${
          open ? 'pointer-events-none translate-x-full opacity-0' : 'translate-x-0 opacity-100'
        }`}
      >
        <MessageSquare className="h-4 w-4 shrink-0 text-teal-600" aria-hidden />
        <span className="select-none text-[11px] font-semibold tracking-[0.12em] text-slate-600 [writing-mode:vertical-rl]">
          협업
        </span>
      </button>

      {/* 오버레이 */}
      <div
        className={`fixed inset-0 z-[38] bg-slate-900/32 transition-opacity duration-150 ease-out motion-reduce:transition-none ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-hidden={!open}
        onClick={() => onOpenChange(false)}
      />

      {/* 드로워: 우측 → 좌측으로 50% (sm 이상), 모바일은 전체 너비 */}
      <div
        id="project-hub-collab-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="collab-drawer-title"
        className={`fixed right-0 top-0 z-[40] flex h-[100dvh] w-full flex-col border-l border-slate-200 bg-white shadow-[-12px_0_40px_rgba(15,23,42,0.1)] transform-gpu transition-transform duration-200 ease-out will-change-transform motion-reduce:transition-none sm:w-[72vw] sm:max-w-[1120px] ${
          open ? 'pointer-events-auto translate-x-0' : 'pointer-events-none translate-x-full'
        }`}
      >
        <div className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-slate-100 px-4">
          <div className="min-w-0">
            <h2 id="collab-drawer-title" className="truncate text-sm font-semibold text-slate-900">
              협업
            </h2>
            <p className="truncate text-xs text-slate-500">{serviceTitle} · Pro</p>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800"
            aria-label="협업 패널 닫기"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <CollaborationPanel initialService={serviceKind} inDrawer />
        </div>
      </div>
    </>
  );
}

function ServiceWorkspace() {
  return (
    <div className="space-y-4">
      <div className="min-h-[520px] rounded-2xl border border-dashed border-slate-200 bg-slate-50" />
      <p className="text-center text-xs text-slate-400">
        협업은 우측 <span className="font-medium text-slate-500">책갈피 탭</span>에서 열 수 있습니다.
      </p>
    </div>
  );
}

function ConsultingLockedPanel() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
                <Lock className="h-4 w-4" />
              </div>
              <div className="text-sm font-semibold text-slate-900">컨설팅 연계</div>
              <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1 text-[10px] font-medium text-slate-500">
                <Lock className="h-3 w-3" /> Pro
              </span>
            </div>
            <div className="mt-2 text-sm text-slate-700">컨설팅 연계는 유료 구독에서 활성화됩니다.</div>
            <div className="mt-1 text-xs text-slate-500">
              전문가 연결, 프로젝트 공유, 코멘트 협업을 이 단계에서 실행합니다.
            </div>
          </div>
          <SimpleButton>구독 보기</SimpleButton>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-[11px] text-slate-400">실행 항목</div>
          <div className="mt-1 text-sm font-semibold text-slate-900">전문가 연결</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-[11px] text-slate-400">공유 범위</div>
          <div className="mt-1 text-sm font-semibold text-slate-900">프로젝트 단위</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-[11px] text-slate-400">협업 권한</div>
          <div className="mt-1 text-sm font-semibold text-slate-900">설계사 승인 후</div>
        </div>
      </div>
    </div>
  );
}

function ProjectSummaryPanel({
  breadcrumb,
  selected,
  activeTab,
  setActiveTab,
}: {
  breadcrumb: React.ReactNode;
  selected: Project;
  activeTab: WorkspaceTab;
  setActiveTab: (t: WorkspaceTab) => void;
}) {
  const metrics = moduleMetrics(selected);

  const reviewItems = [
    {
      key: 'zeb' as const,
      icon: Building2,
      label: 'ZEB',
      hint: '다중 시나리오 비교',
      target: `${selected.targetGrade}등급`,
      current: metrics.zebCurrent === '–' ? '–' : `${metrics.zebCurrent}등급`,
      margin:
        metrics.zebMargin === '–'
          ? '–'
          : `${metrics.zebMargin > 0 ? '+' : ''}${metrics.zebMargin}`,
      progress: progressPercent('zeb', metrics, selected),
      state: selected.map.zeb,
      caption: stateText(selected.map.zeb),
      tooltip: '표준 모델 기준 등급 비교',
      activeTone: 'teal' as const,
      ringClass: 'ring-teal-700/20',
      bgClass: 'bg-teal-50',
    },
    {
      key: 'epi' as const,
      icon: BarChart3,
      label: 'EPI',
      hint: '법규 검토',
      target: '65점',
      current: metrics.epiCurrent === '–' ? '–' : `${metrics.epiCurrent}점`,
      margin:
        metrics.epiMargin === '–'
          ? '–'
          : `${metrics.epiMargin > 0 ? '+' : ''}${metrics.epiMargin}`,
      progress: progressPercent('epi', metrics, selected),
      state: selected.map.epi,
      caption: stateText(selected.map.epi),
      tooltip: '법규 점수 비교',
      activeTone: 'teal' as const,
      ringClass: 'ring-teal-700/20',
      bgClass: 'bg-teal-50',
    },
    {
      key: 'ren' as const,
      icon: Leaf,
      label: '신재생',
      hint: '의무 비율 검토',
      target: '20%',
      current: metrics.renCurrent === '–' ? '–' : `${metrics.renCurrent}%`,
      margin:
        metrics.renMargin === '–'
          ? '–'
          : `${metrics.renMargin > 0 ? '+' : ''}${metrics.renMargin}`,
      progress: progressPercent('ren', metrics, selected),
      state: selected.map.ren,
      caption: stateText(selected.map.ren),
      tooltip: '의무 공급비율 비교',
      activeTone: 'teal' as const,
      ringClass: 'ring-teal-700/20',
      bgClass: 'bg-teal-50',
    },
  ];

  const consultItem = {
    key: 'consult' as const,
    icon: PhoneCall,
    label: '컨설팅 연계',
    hint: '전문가 실행 연결',
    target: '실행',
    current: '연계 대기',
    margin: '🔒 Pro',
    progress: 46,
    caption: '구독 활성화 필요',
    tooltip: '판단 이후 실행 단계',
    activeTone: 'rose' as const,
    ringClass: 'ring-rose-700/20',
    bgClass: 'bg-rose-50',
  };

  return (
    <div className="sticky top-16 space-y-4 self-start">
      <div className="border-b border-slate-200 pb-4">{breadcrumb}</div>
      <InfoCard>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-base font-semibold">{selected.name}</div>
            <div className="mt-1 text-xs text-slate-500">
              {selected.region} · {selected.use} · {fmt(selected.gfa)}㎡ · {selected.floors}F · 목표 ZEB{' '}
              {selected.targetGrade}
            </div>
          </div>
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${statusBadgeClass(selected.status)}`}
          >
            {selected.status}
          </span>
        </div>

        <div className="mt-4">
          <button
            type="button"
            onClick={() => setActiveTab('ops')}
            aria-pressed={activeTab === 'ops'}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
          >
            <NotebookPen className="h-3.5 w-3.5" />
            운영 기록
          </button>
          {latestOpsRecord(selected) ? (
            <div className="mt-3 text-[12px] leading-relaxed text-slate-600">
              <span className="font-semibold text-slate-800">{latestOpsRecord(selected)?.title}</span>
              <span className="mx-2 text-[10px] text-slate-300">●</span>
              {latestOpsRecord(selected)?.summary}
            </div>
          ) : selected.note ? (
            <div className="mt-3 text-[12px] leading-relaxed text-slate-600">
              {selected.note}
            </div>
          ) : null}
        </div>
      </InfoCard>

      <InfoCard>
        <div className="mb-3 text-xs font-semibold tracking-[0.18em] text-slate-400">PROJECT SERVICES</div>

        <div className="space-y-2.5">
          {reviewItems.map((item) => (
            <ServiceNavMetricButton
              key={item.key}
              icon={item.icon}
              label={item.label}
              hint={item.hint}
              target={item.target}
              current={item.current}
              margin={item.margin}
              progress={item.progress}
              stateMark={stateIcon(item.state)}
              isFail={item.state === 'fail'}
              isIdle={item.current === '–'}
              caption={item.caption}
              tooltip={item.tooltip}
              activeTone={item.activeTone}
              active={activeTab === item.key}
              ringClass={item.ringClass}
              bgClass={item.bgClass}
              onClick={() => setActiveTab(item.key)}
            />
          ))}
        </div>

        <div className="my-3 border-t border-slate-100" />

        <ServiceNavMetricButton
          icon={consultItem.icon}
          label={consultItem.label}
          hint={consultItem.hint}
          target={consultItem.target}
          current={consultItem.current}
          margin={consultItem.margin}
          progress={consultItem.progress}
          stateMark={
            <div className="flex items-center gap-1">
              <PhoneCall className="h-3 w-3 text-rose-500 opacity-90" />
              <Lock className="h-3 w-3 text-slate-400" />
            </div>
          }
          isFail={false}
          isIdle={false}
          caption={consultItem.caption}
          tooltip={consultItem.tooltip}
          activeTone={consultItem.activeTone}
          active={activeTab === consultItem.key}
          ringClass={consultItem.ringClass}
          bgClass={consultItem.bgClass}
          onClick={() => setActiveTab(consultItem.key)}
        />
      </InfoCard>
    </div>
  );
}

function OperationsWorkspace(props: {
  opsTitleDraft: string;
  setOpsTitleDraft: (v: string) => void;
  opsDraft: string;
  setOpsDraft: (v: string) => void;
  records: OpsRecord[];
  onSave: () => void;
}) {
  const {
    opsTitleDraft,
    setOpsTitleDraft,
    opsDraft,
    setOpsDraft,
    records,
    onSave,
  } = props;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="text-sm font-semibold text-slate-900">운영 기록</div>
            <div className="mt-1 text-xs text-slate-500">대표 제목과 요약문을 간단히 작성합니다.</div>
          </div>
          <SimpleButton tone="solid" onClick={onSave}>
            기록
          </SimpleButton>
        </div>

        <div className="mt-4">
          <input
            value={opsTitleDraft}
            onChange={(e) => setOpsTitleDraft(e.target.value)}
            placeholder="제목을 입력하세요"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-slate-300 focus:bg-white"
          />
        </div>

        <div className="mt-3">
          <textarea
            value={opsDraft}
            onChange={(e) => setOpsDraft(e.target.value)}
            placeholder="운영 기록 대표 문구를 입력하세요"
            className="min-h-[220px] w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-300 focus:bg-white"
          />
        </div>

        <div className="mt-5 border-t border-slate-100 pt-4">
          <div className="mb-3 text-xs font-semibold tracking-[0.16em] text-slate-400">목차</div>
          <div className="space-y-2">
            {records.length ? (
              records.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="text-[11px] text-slate-400">{item.createdAt.slice(0, 10)}</div>
                  <div className="mt-1 text-sm font-medium text-slate-800">{item.title}</div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-400">
                아직 기록이 없습니다.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectWorkspace(props: {
  breadcrumb: React.ReactNode;
  activeTab: WorkspaceTab;
  selected: Project;
  setActiveTab: (t: WorkspaceTab) => void;
  opsTitleDraft: string;
  setOpsTitleDraft: (v: string) => void;
  opsDraft: string;
  setOpsDraft: (v: string) => void;
  onSaveOps: () => void;
}) {
  const {
    breadcrumb,
    activeTab,
    selected,
    setActiveTab,
    opsTitleDraft,
    setOpsTitleDraft,
    opsDraft,
    setOpsDraft,
    onSaveOps,
  } = props;

  const sortedRecords = [...(selected.opsRecords || [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const [collabOpen, setCollabOpen] = useState(false);
  const collabKind: 'zeb' | 'epi' | 'ren' | null =
    activeTab === 'zeb' || activeTab === 'epi' || activeTab === 'ren' ? activeTab : null;

  useEffect(() => {
    if (!collabKind) setCollabOpen(false);
  }, [collabKind]);

  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col md:flex-row">
      <aside className="w-80 max-w-full shrink-0 border-r border-slate-200 bg-white p-5">
        <ProjectSummaryPanel
          breadcrumb={breadcrumb}
          selected={selected}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </aside>

      <div className="min-w-0 flex-1 p-4 md:p-6">
        <InfoCard className="min-h-[720px] w-full">
          <div className="mb-4 text-sm font-semibold">작업 영역</div>

          {activeTab === 'zeb' || activeTab === 'epi' || activeTab === 'ren' ? (
            <ServiceWorkspace />
          ) : null}
          {activeTab === 'consult' ? <ConsultingLockedPanel /> : null}
          {activeTab === 'ops' ? (
            <OperationsWorkspace
              opsTitleDraft={opsTitleDraft}
              setOpsTitleDraft={setOpsTitleDraft}
              opsDraft={opsDraft}
              setOpsDraft={setOpsDraft}
              records={sortedRecords}
              onSave={onSaveOps}
            />
          ) : null}
        </InfoCard>
      </div>

      {collabKind ? (
        <CollaborationRightDrawer
          open={collabOpen}
          onOpenChange={setCollabOpen}
          serviceKind={collabKind}
        />
      ) : null}
    </div>
  );
}

function CreateProjectModal(props: {
  open: boolean;
  setOpenCreate: (v: boolean) => void;
  formName: string;
  setFormName: (v: string) => void;
  formRegion: string;
  setFormRegion: (v: string) => void;
  formUse: string;
  setFormUse: (v: string) => void;
  formGfa: string;
  setFormGfa: (v: string) => void;
  formFloors: string;
  setFormFloors: (v: string) => void;
  formTarget: string;
  setFormTarget: (v: string) => void;
  submitProject: () => void;
}) {
  if (!props.open) return null;

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-slate-950/35 p-4">
      <div className="w-full max-w-2xl rounded-3xl border bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="text-lg font-semibold">새 프로젝트 생성</div>
            <div className="mt-1 text-sm text-slate-500">
              초기 입력값만 등록하고 바로 프로젝트 허브에 추가합니다.
            </div>
          </div>
          <button
            type="button"
            onClick={() => props.setOpenCreate(false)}
            className="rounded-full border px-3 py-1 text-sm text-slate-500"
          >
            닫기
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <FieldLabel>프로젝트명</FieldLabel>
            <input
              value={props.formName}
              onChange={(e) => props.setFormName(e.target.value)}
              className="w-full rounded-2xl border px-3 py-2 text-sm outline-none"
            />
          </div>
          <div>
            <FieldLabel>지역</FieldLabel>
            <select
              value={props.formRegion}
              onChange={(e) => props.setFormRegion(e.target.value)}
              className="w-full rounded-2xl border px-3 py-2 text-sm outline-none"
            >
              <option>서울</option>
              <option>경기</option>
              <option>인천</option>
              <option>부산</option>
              <option>대구</option>
            </select>
          </div>
          <div>
            <FieldLabel>용도</FieldLabel>
            <select
              value={props.formUse}
              onChange={(e) => props.setFormUse(e.target.value)}
              className="w-full rounded-2xl border px-3 py-2 text-sm outline-none"
            >
              <option>업무시설</option>
              <option>교육연구시설</option>
              <option>공동주택</option>
              <option>판매시설</option>
            </select>
          </div>
          <div>
            <FieldLabel>연면적(㎡)</FieldLabel>
            <input
              value={props.formGfa}
              onChange={(e) => props.setFormGfa(e.target.value)}
              className="w-full rounded-2xl border px-3 py-2 text-sm outline-none"
            />
          </div>
          <div>
            <FieldLabel>층수</FieldLabel>
            <input
              value={props.formFloors}
              onChange={(e) => props.setFormFloors(e.target.value)}
              className="w-full rounded-2xl border px-3 py-2 text-sm outline-none"
            />
          </div>
          <div>
            <FieldLabel>목표 ZEB 등급</FieldLabel>
            <select
              value={props.formTarget}
              onChange={(e) => props.setFormTarget(e.target.value)}
              className="w-full rounded-2xl border px-3 py-2 text-sm outline-none"
            >
              <option value="1">1등급</option>
              <option value="2">2등급</option>
              <option value="3">3등급</option>
              <option value="4">4등급</option>
              <option value="5">5등급</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <SimpleButton onClick={() => props.setOpenCreate(false)}>취소</SimpleButton>
          <SimpleButton tone="solid" onClick={props.submitProject}>
            생성
          </SimpleButton>
        </div>
      </div>
    </div>
  );
}

function HeaderBreadcrumb(props: {
  view: 'home' | 'project';
  selected: Project | null;
  onGoHome: () => void;
}) {
  const { view, selected, onGoHome } = props;

  if (view === 'home') {
    return (
      <div className="flex min-w-0 items-center gap-2">
        <span className="text-[11px] font-medium text-slate-400">프로젝트 허브</span>
        <span className="text-xs text-slate-300">&gt;</span>
        <span className="truncate text-sm font-semibold text-slate-700">전체 현황</span>
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={onGoHome}
        className="text-[13px] font-medium text-slate-400 transition hover:text-slate-700"
      >
        프로젝트 허브
      </button>
      <span className="text-xs text-slate-300">&gt;</span>
      <button
        type="button"
        onClick={onGoHome}
        className="text-[13px] font-medium text-slate-400 transition hover:text-slate-700"
      >
        전체 현황
      </button>
      <span className="text-xs text-slate-300">&gt;</span>
      <span className="min-w-0 truncate text-sm font-semibold text-slate-700">
        {selected ? selected.name : '프로젝트'}
      </span>
    </div>
  );
}

function HeaderActionIcon({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      title={label}
      onClick={onClick}
      className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

function HeaderPopups({
  kind,
  onClose,
}: {
  kind: 'user' | 'settings' | 'bell' | 'help' | null;
  onClose: () => void;
}) {
  const router = useRouter();

  if (!kind) return null;

  const content = {
    user: {
      title: '마이페이지',
      body: (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <User className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold">담당자 님</div>
              <div className="text-xs text-slate-500">admin@company.com</div>
            </div>
          </div>
          <div className="mt-3 border-t border-slate-100 pt-3">
            <SimpleButton className="w-full text-left">프로필 수정</SimpleButton>
            <SimpleButton
              className="mt-2 w-full text-left"
              onClick={async () => {
                try {
                  await fetch('/api/auth/logout', { method: 'POST' });
                } catch {
                  // 로그아웃 API 실패 시에도 화면 이동은 유지
                }
                onClose();
                router.push('/');
              }}
            >
              로그아웃
            </SimpleButton>
          </div>
        </div>
      ),
    },
    settings: {
      title: '설정',
      body: (
        <div className="space-y-3">
          <div className="text-sm font-medium">알림 설정</div>
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>이메일 알림 수신</span>
            <input type="checkbox" defaultChecked className="accent-teal-600" />
          </div>
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>프로젝트 업데이트 알림</span>
            <input type="checkbox" defaultChecked className="accent-teal-600" />
          </div>
          <div className="mt-4 border-t border-slate-100 pt-3 text-sm font-medium">표시 설정</div>
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>다크 모드</span>
            <input type="checkbox" className="accent-teal-600" />
          </div>
        </div>
      ),
    },
    bell: {
      title: '알림 내역',
      body: (
        <div className="space-y-3">
          <div className="rounded-xl bg-slate-50 p-3">
            <div className="text-xs text-slate-500">10분 전</div>
            <div className="mt-1 text-sm font-medium">성수 업무시설 프로젝트가 업데이트되었습니다.</div>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <div className="text-xs text-slate-500">1시간 전</div>
            <div className="mt-1 text-sm font-medium">
              동탄 교육연구시설 ZEB 검토가 완료되었습니다.
            </div>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <div className="text-xs text-slate-500">어제</div>
            <div className="mt-1 text-sm font-medium">새로운 메시지가 도착했습니다.</div>
          </div>
        </div>
      ),
    },
    help: {
      title: '도움말',
      body: (
        <div className="space-y-3">
          <SimpleButton className="w-full text-left">가이드 문서 보기</SimpleButton>
          <SimpleButton className="mt-2 w-full text-left">1:1 문의하기</SimpleButton>
          <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">
            도움이 필요하신가요? 고객센터(1588-0000)로 연락주시면 친절히 안내해 드립니다.
          </div>
        </div>
      ),
    },
  };

  const current = content[kind];

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="fixed right-4 top-16 z-50 mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] sm:right-8">
        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-semibold text-slate-800">{current.title}</h3>
          <button onClick={onClose} className="text-slate-400 transition hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        </div>
        {current.body}
      </div>
    </>
  );
}

// ------------------------------------------------------------
// Main
// ------------------------------------------------------------
export default function ProjectHub() {
  const [view, setView] = useState<'home' | 'project'>('home');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | '전체'>('전체');
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('zeb');
  const [openCreate, setOpenCreate] = useState(false);
  const [opsTitleDraft, setOpsTitleDraft] = useState('');
  const [opsDraft, setOpsDraft] = useState('');
  const [activePopup, setActivePopup] = useState<'user' | 'settings' | 'bell' | 'help' | null>(null);

  const [formName, setFormName] = useState('');
  const [formRegion, setFormRegion] = useState('서울');
  const [formUse, setFormUse] = useState('업무시설');
  const [formGfa, setFormGfa] = useState('12000');
  const [formFloors, setFormFloors] = useState('10');
  const [formTarget, setFormTarget] = useState('3');

  const selected = useMemo(
    () => (selectedId ? projects.find((p) => p.id === selectedId) ?? null : null),
    [projects, selectedId]
  );

  useEffect(() => {
    if (!selected) {
      setOpsTitleDraft('');
      setOpsDraft('');
      return;
    }
    const latest = latestOpsRecord(selected);
    setOpsTitleDraft(latest?.title ?? '');
    setOpsDraft(latest?.summary ?? '');
  }, [selected]);

  const kpi = useMemo(() => {
    const total = projects.length;
    const active = projects.filter((p) => p.status === '진행중').length;
    const done = projects.filter((p) => p.status === '완료').length;
    const need = projects.filter(
      (p) => p.map.zeb === 'fail' || p.map.epi === 'fail' || p.map.ren === 'fail'
    ).length;
    return { total, active, done, need };
  }, [projects]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = projects.filter((p) => {
      const hitStatus = statusFilter === '전체' ? true : p.status === statusFilter;
      const hay = `${p.name} ${p.region} ${p.use}`.toLowerCase();
      const hitQuery = q ? hay.includes(q) : true;
      return hitStatus && hitQuery;
    });
    return sortProjects(base);
  }, [projects, query, statusFilter]);

  const openProject = useCallback((id: string) => {
    setSelectedId(id);
    setActiveTab('zeb');
    setView('project');
  }, []);

  const saveOpsRecord = useCallback(() => {
    if (!selectedId) return;
    const title = opsTitleDraft.trim();
    const summary = opsDraft.trim();
    if (!title && !summary) return;

    const createdAt = nowStamp();
    const record: OpsRecord = {
      id: `ops-${makeId()}`,
      title: title || '무제 기록',
      summary: summary || '내용 없음',
      createdAt,
    };

    setProjects((prev) =>
      prev.map((project) => {
        if (project.id !== selectedId) return project;
        return {
          ...project,
          updatedAt: createdAt,
          opsRecords: [record, ...(project.opsRecords || [])],
        };
      })
    );
  }, [selectedId, opsTitleDraft, opsDraft]);

  const submitProject = useCallback(() => {
    const id = `p-${makeId()}`;
    const project: Project = {
      id,
      name: formName.trim() || `${formRegion} ${formUse} (신규)`,
      region: formRegion,
      use: formUse,
      gfa: Number(formGfa),
      floors: Number(formFloors),
      targetGrade: Number(formTarget),
      status: '신규',
      updatedAt: nowStamp(),
      map: { zeb: 'none', epi: 'none', ren: 'none', consult: 'none' },
      note: '초기 검토 대기',
      opsRecords: [],
    };

    setProjects((prev) => [project, ...prev]);
    setSelectedId(id);
    setActiveTab('zeb');
    setOpenCreate(false);
    setView('project');
  }, [formName, formRegion, formUse, formGfa, formFloors, formTarget]);

  return (
    <div className="min-h-screen bg-[#f4f6f8] text-slate-900">
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="flex h-16 flex-wrap items-center justify-between gap-3 px-4 sm:px-8">
          <div className="flex min-w-0 items-center gap-4 pl-0 sm:pl-4">
            {view === 'home' ? (
              <Link href="/" className="hidden shrink-0 sm:block">
                <img
                  alt="ZEBA"
                  src="/assets/images/logo-company.png"
                  className="h-7 w-auto object-contain opacity-90"
                />
              </Link>
            ) : (
              <button onClick={() => setView('home')} className="hidden shrink-0 sm:block cursor-pointer">
                <img
                  alt="ZEBA"
                  src="/assets/images/logo-company.png"
                  className="h-7 w-auto object-contain opacity-90"
                />
              </button>
            )}
            <div className="min-w-0">
              <div className="text-[10px] font-semibold tracking-[0.28em] text-teal-600">ZEBA MVP PLATFORM</div>
              <div className="truncate text-base font-semibold">프로젝트 허브</div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <HeaderActionIcon icon={User} label="마이페이지" onClick={() => setActivePopup(activePopup === 'user' ? null : 'user')} />
            <HeaderActionIcon icon={Settings} label="설정" onClick={() => setActivePopup(activePopup === 'settings' ? null : 'settings')} />
            <HeaderActionIcon icon={Bell} label="알림" onClick={() => setActivePopup(activePopup === 'bell' ? null : 'bell')} />
            <HeaderActionIcon icon={HelpCircle} label="도움말" onClick={() => setActivePopup(activePopup === 'help' ? null : 'help')} />
          </div>
        </div>
      </div>
      <HeaderPopups kind={activePopup} onClose={() => setActivePopup(null)} />

      {view === 'home' ? (
        <div className="flex min-h-[calc(100vh-64px)] flex-col md:flex-row">
          <HomeSidebar
            breadcrumb={
              <HeaderBreadcrumb view="home" selected={selected} onGoHome={() => setView('home')} />
            }
            kpi={kpi}
            query={query}
            setQuery={setQuery}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
          />

          <div className="flex-1 p-4 md:p-6">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
              <InfoCard>
                <div className="flex min-h-[250px] flex-col items-center justify-center gap-3">
                  <div className="text-xs tracking-[0.24em] text-slate-400">NEW PROJECT</div>
                  <SimpleButton tone="solid" className="px-5" onClick={() => setOpenCreate(true)}>
                    + 새 프로젝트 생성
                  </SimpleButton>
                </div>
              </InfoCard>

              {filtered.map((p) => (
                <InfoCard key={p.id}>
                  <button type="button" onClick={() => openProject(p.id)} className="w-full text-left">
                    <div className="flex items-start justify-between gap-2">
                      <div className="truncate text-base font-semibold">{p.name}</div>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${statusBadgeClass(p.status)}`}
                      >
                        {p.status}
                      </span>
                    </div>
                    <div className="mt-3 text-sm leading-6 text-slate-500">
                      {p.region} · {p.use} · {fmt(p.gfa)}㎡ · {p.floors}F
                    </div>
                    <div className="mt-4">
                      <MiniMap map={p.map} />
                    </div>
                    <div
                      className="mt-3 overflow-hidden rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-[11px] leading-5 text-slate-500"
                      style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {projectStatusText(p)}
                    </div>
                    <div className="mt-2 text-[11px] text-slate-400">업데이트 · {p.updatedAt}</div>
                  </button>
                </InfoCard>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="mt-8 rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                조건에 맞는 프로젝트가 없습니다.
              </div>
            )}
          </div>
        </div>
      ) : selected ? (
        <ProjectWorkspace
          breadcrumb={
            <HeaderBreadcrumb view="project" selected={selected} onGoHome={() => setView('home')} />
          }
          selected={selected}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          opsTitleDraft={opsTitleDraft}
          setOpsTitleDraft={setOpsTitleDraft}
          opsDraft={opsDraft}
          setOpsDraft={setOpsDraft}
          onSaveOps={saveOpsRecord}
        />
      ) : (
        <div className="min-h-[calc(100vh-64px)] bg-[#f4f6f8] p-6">
          <InfoCard>
            <div className="text-sm text-slate-500">프로젝트를 선택하세요.</div>
          </InfoCard>
        </div>
      )}

      <CreateProjectModal
        open={openCreate}
        setOpenCreate={setOpenCreate}
        formName={formName}
        setFormName={setFormName}
        formRegion={formRegion}
        setFormRegion={setFormRegion}
        formUse={formUse}
        setFormUse={setFormUse}
        formGfa={formGfa}
        setFormGfa={setFormGfa}
        formFloors={formFloors}
        setFormFloors={setFormFloors}
        formTarget={formTarget}
        setFormTarget={setFormTarget}
        submitProject={submitProject}
      />
    </div>
  );
}
