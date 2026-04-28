'use client';

import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import {
  AlertTriangle,
  Building2,
  Check,
  CheckCircle2,
  CircleMinus,
  CirclePause,
  Lock,
  LockOpen,
  PencilLine,
  Plus,
  RotateCcw,
  ShieldAlert,
  TrendingDown,
  TrendingUp,
  Trash2,
  Wrench,
  Zap,
} from 'lucide-react';
import { Switch } from 'antd';

// -------------------------------------------------------
// Types
// -------------------------------------------------------
type SectionKey = 'arch' | 'mech' | 'elec' | 'renew';
type ScenarioId = 'standard' | 'option1' | 'option2';
type BoardState = 'backlog' | 'selected';
type ItemDirection = 'standard' | 'up' | 'down';
type ChangeFilter = 'all' | 'state' | 'score';
type ScoreMode = 'factor' | 'direct';

type EpiItem = {
  id: string;
  title: string;
  section: SectionKey;
  basePoint: number;
  standardValue: string;
  standardScore: number;
  currentValue: string;
  currentScore: number;
  scoreMode: ScoreMode;
  direction: ItemDirection;
  boardState: BoardState;
  risk: boolean;
  riskMemo: string;
  hold: boolean;
  holdMemo: string;
  impact: boolean;
  locked: boolean;
};

type Scenario = {
  id: ScenarioId;
  title: string;
  description: string;
  items: EpiItem[];
};

type ItemChange = {
  itemId: string;
  title: string;
  section: SectionKey;
  stateChanged: boolean;
  scoreChanged: boolean;
  baseState: BoardState;
  currentState: BoardState;
  baseScore: number;
  currentScore: number;
  baseScoreMode: ScoreMode;
  currentScoreMode: ScoreMode;
  scoreDelta: number;
  baseValue: string;
  currentValue: string;
};

// -------------------------------------------------------
// Constants
// -------------------------------------------------------
const SCENARIO_ORDER: ScenarioId[] = ['standard', 'option1', 'option2'];
const PASS_SCORE = 65;
const SCORE_FACTOR_OPTIONS = ['1.0', '0.9', '0.8', '0.7', '0.6'] as const;

const SECTION_META: Record<SectionKey, { label: string; icon: ReactNode; className: string }> = {
  arch: {
    label: '건축',
    icon: <Building2 className="h-3.5 w-3.5" />,
    className: 'border-sky-100 bg-sky-50 text-sky-700',
  },
  mech: {
    label: '기계',
    icon: <Wrench className="h-3.5 w-3.5" />,
    className: 'border-emerald-100 bg-emerald-50 text-emerald-700',
  },
  elec: {
    label: '전기',
    icon: <Zap className="h-3.5 w-3.5" />,
    className: 'border-violet-100 bg-violet-50 text-violet-700',
  },
  renew: {
    label: '신재생',
    icon: <Zap className="h-3.5 w-3.5" />,
    className: 'border-amber-100 bg-amber-50 text-amber-700',
  },
};

const SECTION_TABS: Array<{ value: SectionKey; label: string }> = [
  { value: 'arch', label: '건축' },
  { value: 'mech', label: '기계' },
  { value: 'elec', label: '전기' },
  { value: 'renew', label: '신재생' },
];

const BOARD_META: Record<BoardState, { label: string; tone: 'slate' | 'teal' }> = {
  backlog: { label: '미반영', tone: 'slate' },
  selected: { label: '반영', tone: 'teal' },
};

const BASE_ITEMS: EpiItem[] = [
  makeItem('A1', '1. 외벽의 평균 열관류율 Ue (창 및 문 포함)', 'arch', 34, '0.8', 'selected', true),
  makeItem('A2', '2. 지붕의 평균 열관류율 Ur (천창 등 투명 외피 제외)', 'arch', 8, '0.8', 'selected', true),
  makeItem('A3', '3. 최하층 거실바닥의 평균 열관류율 Uf', 'arch', 6, '0.8', 'selected', true),
  makeItem('A4', '4. 외피 열교부위의 단열 성능', 'arch', 6, '0.8', 'backlog'),
  makeItem('A5', '5. 기밀성 창 및 문의 설치', 'arch', 6, '0.8', 'selected', true),
  makeItem('A6', '6. 창 및 문의 접합부 기밀성능 강화 조치', 'arch', 2, '1.0', 'backlog'),
  makeItem('A7', '7. 냉방부하저감을 위한 거실 외피면적당 평균 태양열취득', 'arch', 5, '0.8', 'backlog'),
  makeItem('M1', '1. 난방설비 효율', 'mech', 6, '0.8', 'selected', true),
  makeItem('M2', '2. 냉방설비 효율', 'mech', 2, '0.8', 'backlog'),
  makeItem('M3', '3. 공조용 송풍기의 우수한 효율설비 채택', 'mech', 1, '0.8', 'backlog'),
  makeItem('M4', '4. 냉온수·냉각수 순환·급수·급탕 펌프의 우수한 효율설비 채택', 'mech', 2, '0.8', 'backlog'),
  makeItem('M5', '5. 이코노마이저시스템 등 외기냉방시스템 도입', 'mech', 1, '1.0', 'backlog'),
  makeItem('M6', '6. 고효율 열회수형 환기장치 채택', 'mech', 3, '0.8', 'backlog'),
  makeItem('M7', '7. 기기배관 및 덕트 단열', 'mech', 1, '1.0', 'selected', true),
  makeItem('M8', '8. 열원설비 대수분할·비례제어 또는 다단제어 운전', 'mech', 1, '1.0', 'backlog'),
  makeItem('M9', '9. 공기조화기 팬 가변속제어 등 에너지절약적 제어방식 채택', 'mech', 1, '1.0', 'backlog'),
  makeItem('M10', '10. 축냉식·가스·유류·지역냉방·소형열병합·신재생 냉방 적용', 'mech', 1, '0.8', 'backlog'),
  makeItem('M11', '11. 전체 급탕용 보일러 용량 대비 우수한 효율설비 용량 비율', 'mech', 2, '0.8', 'backlog'),
  makeItem('M12', '12. 냉난방 순환수·냉각수 순환 펌프 대수제어 또는 가변속제어', 'mech', 1, '1.0', 'backlog'),
  makeItem('M13', '13. 급수용 펌프 또는 가압급수펌프 전동기 가변속제어', 'mech', 1, '1.0', 'selected', true),
  makeItem('M14', '14. 지하주차장 환기용 팬 에너지절약적 제어방식 채택', 'mech', 1, '1.0', 'selected', true),
  makeItem('M15', '15. T.A.B 또는 커미셔닝 실시', 'mech', 1, '1.0', 'backlog'),
  makeItem('M16', '16. 지역난방·소형가스열병합·소각로 폐열시스템 보상점수', 'mech', 8, '1.0', 'backlog'),
  makeItem('M17', '17. 개별난방 또는 개별냉난방방식 보상점수', 'mech', 2, '1.0', 'selected', true),
  makeItem('E1', '1. 거실의 조명밀도', 'elec', 8, '0.8', 'selected', true),
  makeItem('E2', '2. 간선의 전압강하', 'elec', 1, '0.8', 'selected', true),
  makeItem('E3', '3. 최대수요전력 관리를 위한 최대수요전력 제어설비', 'elec', 1, '1.0', 'backlog'),
  makeItem('E4', '4. 실내 조명설비 군별 또는 회로별 자동제어설비 채택', 'elec', 1, '1.0', 'backlog'),
  makeItem('E5', '5. 옥외등 LED 조명 및 격등 조명·조도조절·자동점멸 구성', 'elec', 1, '1.0', 'backlog'),
  makeItem('E6', '6. 층별 또는 구역별 일괄소등스위치 설치', 'elec', 1, '1.0', 'backlog'),
  makeItem('E7', '7. 층별 및 임대 구획별 전력량계 설치', 'elec', 2, '1.0', 'backlog'),
  makeItem('E8', '8. BEMS 또는 에너지원별 전자식 원격검침계량기 설치', 'elec', 3, '0.7', 'backlog'),
  makeItem('E9', '9. 역률자동 콘덴서 집합 설치 시 역률자동조절장치 채택', 'elec', 1, '1.0', 'selected', true),
  makeItem('E10', '10. 대기전력자동차단장치 적용 콘센트 비율', 'elec', 2, '0.8', 'selected', true),
  makeItem('E11', '11. 승강기 회생제동장치 설치비율', 'elec', 1, '1.0', 'backlog'),
  makeItem('R1', '1. 전체난방설비용량에 대한 신재생에너지 용량 비율', 'renew', 4, '0.6', 'backlog'),
  makeItem('R2', '2. 전체냉방설비용량에 대한 신재생에너지 용량 비율', 'renew', 4, '0.6', 'backlog'),
  makeItem('R3', '3. 전체급탕설비용량에 대한 신재생에너지 용량 비율', 'renew', 1, '0.6', 'backlog'),
  makeItem('R4', '4. 전체조명설비전력에 대한 신재생에너지 용량 비율', 'renew', 4, '0.6', 'selected', true),
];

// -------------------------------------------------------
// Helpers
// -------------------------------------------------------
function makeItem(
  id: string,
  title: string,
  section: EpiItem['section'],
  basePoint: number,
  value: string,
  boardState: BoardState,
  locked = false,
): EpiItem {
  const score = calcScore(basePoint, value);
  return {
    id,
    title,
    section,
    basePoint,
    standardValue: value,
    standardScore: score,
    currentValue: value,
    currentScore: score,
    scoreMode: 'factor',
    direction: 'standard',
    boardState,
    risk: false,
    riskMemo: '',
    hold: false,
    holdMemo: '',
    impact: false,
    locked,
  };
}

function cx(...tokens: Array<string | false | null | undefined>) {
  return tokens.filter(Boolean).join(' ');
}

function fmt(value: number) {
  return value.toFixed(1);
}

function fmt2(value: number) {
  return value.toFixed(2);
}

function calcScore(basePoint: number, value: string) {
  const factor = Number(value);
  return Number.isNaN(factor) ? 0 : Number((basePoint * factor).toFixed(2));
}

function normalizeScoreFactor(value: string) {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return '0.6';
  return Math.min(1, Math.max(0.6, parsed)).toFixed(1);
}

function normalizeDirectScore(value: string, max: number) {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return 0;
  return Number(Math.min(max, Math.max(0, parsed)).toFixed(2));
}

function scenarioScore(scenario: Scenario) {
  return scenario.items
    .filter((item) => item.boardState === 'selected')
    .reduce((sum, item) => sum + item.currentScore, 0);
}

function scenarioCounts(scenario: Scenario, baseline?: Scenario) {
  const selected = scenario.items.filter((item) => item.boardState === 'selected');
  const backlog = scenario.items.filter((item) => item.boardState === 'backlog');
  return {
    risk: selected.filter((item) => item.risk).length,
    diff: baseline ? getItemChanges(baseline, scenario).length : 0,
    impact: backlog.filter((item) => item.hold).length,
  };
}

function getItemChanges(baseline: Scenario, scenario: Scenario): ItemChange[] {
  return scenario.items.flatMap((item) => {
    const base = baseline.items.find((row) => row.id === item.id);
    if (!base) return [];
    const stateChanged = base.boardState !== item.boardState;
    const scoreChanged = base.currentScore !== item.currentScore;
    if (!stateChanged && !scoreChanged) return [];
    return [
      {
        itemId: item.id,
        title: item.title,
        section: item.section,
        stateChanged,
        scoreChanged,
        baseState: base.boardState,
        currentState: item.boardState,
        baseScore: base.currentScore,
        currentScore: item.currentScore,
        baseScoreMode: base.scoreMode,
        currentScoreMode: item.scoreMode,
        scoreDelta: item.currentScore - base.currentScore,
        baseValue: base.currentValue,
        currentValue: item.currentValue,
      },
    ];
  });
}

function sortBoardItems(items: EpiItem[], state: BoardState) {
  return [...items].sort((left, right) => {
    if (state === 'backlog' && left.hold !== right.hold) return left.hold ? -1 : 1;
    return right.basePoint - left.basePoint;
  });
}

function nextScenarioId(
  scenarios: Scenario[],
): Extract<ScenarioId, 'option1' | 'option2'> | null {
  const used = new Set(scenarios.map((s) => s.id));
  const next = SCENARIO_ORDER.find((id) => id !== 'standard' && !used.has(id));
  return (next as Extract<ScenarioId, 'option1' | 'option2'> | undefined) ?? null;
}

function createStandardScenario(): Scenario {
  return {
    id: 'standard',
    title: '기준안',
    description: '표준 조합 기준안',
    items: BASE_ITEMS.map((row) => ({ ...row })),
  };
}

function cloneAsAlternative(
  standard: Scenario,
  id: Extract<ScenarioId, 'option1' | 'option2'>,
): Scenario {
  return {
    id,
    title: id === 'option1' ? '대안 1' : '대안 2',
    description: '기준안을 복제한 뒤 항목 상태와 리스크를 조정하는 검토안',
    items: standard.items.map((row) => ({ ...row })),
  };
}

// -------------------------------------------------------
// Sub-components
// -------------------------------------------------------
function ItemColumn({
  state,
  count,
  children,
}: {
  state: BoardState;
  count: number;
  children: ReactNode;
}) {
  const meta = BOARD_META[state];
  return (
    <div
      className={cx(
        'rounded-[16px] border p-2.5',
        meta.tone === 'teal' && 'border-teal-100 bg-teal-50/40',
        meta.tone === 'slate' && 'border-slate-200 bg-slate-50',
      )}
    >
      <div className="mb-2 flex items-center justify-between text-[11px] font-bold text-slate-700">
        <span>◎ {meta.label}</span>
        <span className="rounded-full bg-white px-2 py-0.5 text-slate-500">{count}</span>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function MiniItem({
  item,
  active,
  refCallback,
  onSelect,
  onMove,
  onToggleLock,
}: {
  item: EpiItem;
  active: boolean;
  refCallback: (node: HTMLDivElement | null) => void;
  onSelect: () => void;
  onMove: (state: BoardState) => void;
  onToggleLock: () => void;
}) {
  const meta = SECTION_META[item.section];
  return (
    <div
      ref={refCallback}
      className={cx(
        'min-w-0 scroll-mt-24 rounded-[12px] border bg-white p-2.5 transition',
        active ? 'border-teal-300 ring-2 ring-teal-100' : 'border-slate-200',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <button type="button" onClick={onSelect} className="min-w-0 flex-1 text-left">
          <span
            className={cx(
              'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px]',
              meta.className,
            )}
          >
            {meta.icon}
            {meta.label}
          </span>
        </button>
        <div className="flex shrink-0 items-center gap-1">
          <span
            title={item.hold ? '보류 항목' : '보류 없음'}
            className={cx(
              'inline-flex h-5 w-5 items-center justify-center rounded-full border transition',
              item.boardState === 'backlog' && item.hold
                ? 'border-amber-200 bg-amber-50 text-amber-600'
                : 'border-slate-200 bg-slate-50 text-slate-300',
            )}
          >
            <CirclePause className="h-3 w-3" />
          </span>
          <span
            title={item.risk ? '리스크 항목' : '리스크 없음'}
            className={cx(
              'inline-flex h-5 w-5 items-center justify-center rounded-full border transition',
              item.boardState === 'selected' && item.risk
                ? 'border-rose-200 bg-rose-50 text-rose-600'
                : 'border-slate-200 bg-slate-50 text-slate-300',
            )}
          >
            <ShieldAlert className="h-3 w-3" />
          </span>
          <button
            type="button"
            onClick={onToggleLock}
            className={cx(
              'inline-flex h-6 w-6 items-center justify-center rounded-full border transition',
              item.locked
                ? 'border-slate-200 bg-slate-50 text-slate-500 hover:border-teal-300 hover:text-teal-700'
                : 'border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100',
            )}
            aria-label={item.locked ? `${item.title} 잠금 해제` : `${item.title} 잠금`}
          >
            {item.locked ? <Lock className="h-3.5 w-3.5" /> : <LockOpen className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
      <button type="button" onClick={onSelect} className="w-full text-left">
        <div className="mt-2 line-clamp-2 break-keep text-[11px] font-bold leading-4 text-slate-950">
          {item.title}
        </div>
        <div className="mt-1 truncate text-[10px] font-semibold leading-4 text-slate-400">
          {item.scoreMode === 'direct'
            ? `a ${fmt(item.basePoint)} · 직접 입력 · 평점 ${fmt2(item.currentScore)}`
            : `a ${fmt(item.basePoint)} · b ${item.currentValue} · 평점 ${fmt(item.currentScore)}`}
        </div>
      </button>
      <div
        className={cx(
          'mt-2.5 grid grid-cols-2 gap-1.5 transition',
          item.locked && 'opacity-45 grayscale',
        )}
      >
        {(['backlog', 'selected'] as const).map((state) => (
          <button
            key={state}
            type="button"
            disabled={item.locked || item.boardState === state}
            onClick={() => onMove(state)}
            className={cx(
              'h-7 whitespace-nowrap rounded-full border px-1 text-[10px] font-bold transition disabled:cursor-not-allowed',
              item.boardState === state
                ? 'border-teal-700 bg-teal-700 text-white'
                : 'border-slate-200 bg-white text-slate-500 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700',
              item.locked && item.boardState !== state && 'opacity-40',
            )}
          >
            {BOARD_META[state].label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ScenarioCard({
  scenario,
  baseline,
  active,
  filter,
  selectedItemId,
  registerItemRef,
  onFilterChange,
  onRemove,
  onItemSelect,
  onMoveItem,
  onToggleLock,
  onShowChanges,
}: {
  scenario: Scenario;
  baseline: Scenario;
  active: boolean;
  filter: SectionKey;
  selectedItemId: string;
  registerItemRef: (itemId: string, node: HTMLDivElement | null) => void;
  onFilterChange: (filter: SectionKey) => void;
  onRemove: () => void;
  onItemSelect: (id: string) => void;
  onMoveItem: (id: string, boardState: BoardState) => void;
  onToggleLock: (id: string) => void;
  onShowChanges: () => void;
}) {
  const counts = scenarioCounts(scenario, baseline);
  const totalScore = scenarioScore(scenario);
  const passesScore = totalScore >= PASS_SCORE;
  const scoreGap = Math.max(0, PASS_SCORE - totalScore);
  const visibleItems = scenario.items.filter((item) => item.section === filter);

  return (
    <section
      className={cx(
        'flex min-h-[900px] flex-col rounded-[24px] border bg-white p-6 shadow-sm transition',
        active ? 'border-teal-300 ring-1 ring-teal-100' : 'border-slate-200',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="whitespace-nowrap text-lg font-bold tracking-normal">{scenario.title}</h2>
        {scenario.id !== 'standard' ? (
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
            aria-label={`${scenario.title} 삭제`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="h-[132px] rounded-[16px] border border-slate-200 bg-slate-50 p-4">
          <div className="text-xs text-slate-500">총점</div>
          <div className="mt-3 text-3xl font-bold">{fmt2(totalScore)}</div>
          <div
            className={cx(
              'mt-3 inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-bold',
              passesScore ? 'text-emerald-700' : 'text-rose-600',
            )}
          >
            {passesScore ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            {passesScore ? '65점 이상 충족' : `${fmt2(scoreGap)}점 부족`}
          </div>
        </div>
        <div className="h-[132px] rounded-[16px] border border-slate-200 bg-slate-50 p-4">
          <div className="text-xs text-slate-500">요약</div>
          <MetricLine label="변경" value={counts.diff} onClick={onShowChanges} />
          <MetricLine label="리스크" value={counts.risk} />
          <MetricLine label="보류" value={counts.impact} />
        </div>
      </div>

      <div className="mt-9 grid grid-cols-4 gap-2">
        {SECTION_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => onFilterChange(tab.value)}
            className={cx(
              'h-9 min-w-0 whitespace-nowrap rounded-full border px-1.5 text-xs font-bold transition',
              filter === tab.value
                ? 'border-teal-700 bg-teal-700 text-white'
                : 'border-slate-200 bg-white text-slate-600 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6 grid flex-1 grid-cols-2 gap-3">
        {(['backlog', 'selected'] as const).map((boardState) => {
          const rows = sortBoardItems(
            visibleItems.filter((item) => item.boardState === boardState),
            boardState,
          );
          return (
            <ItemColumn key={boardState} state={boardState} count={rows.length}>
              {rows.map((row) => (
                <MiniItem
                  key={row.id}
                  item={row}
                  active={selectedItemId === row.id && active}
                  refCallback={(node) => registerItemRef(row.id, node)}
                  onSelect={() => onItemSelect(row.id)}
                  onMove={(nextState) => onMoveItem(row.id, nextState)}
                  onToggleLock={() => onToggleLock(row.id)}
                />
              ))}
            </ItemColumn>
          );
        })}
      </div>
    </section>
  );
}

function EmptyScenarioSlot({
  slotId,
  onCreate,
}: {
  slotId: ScenarioId;
  onCreate: () => void;
}) {
  const label = slotId === 'option1' ? '대안 1' : '대안 2';
  return (
    <button
      type="button"
      onClick={onCreate}
      className="flex min-h-[900px] flex-col items-center justify-center rounded-[24px] border border-dashed border-slate-200 bg-slate-50/60 p-6 text-center text-slate-500 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
    >
      <Plus className="mb-4 h-8 w-8" />
      <span className="text-base font-bold">{label} 카드 생성</span>
      <span className="mt-2 text-sm">기준안을 복제해 새 비교안을 만듭니다.</span>
    </button>
  );
}

function ScenarioSpacer() {
  return <div className="hidden min-h-[900px] xl:block" aria-hidden="true" />;
}

function MetricTile({
  label,
  value,
  tone = 'default',
  editing = false,
  inputValue = '',
  inputPlaceholder,
  inputMax,
  note,
  onEdit,
  onInputChange,
  onInputKeyDown,
  onSave,
}: {
  label: string;
  value: string;
  tone?: 'default' | 'mint';
  editing?: boolean;
  inputValue?: string;
  inputPlaceholder?: string;
  inputMax?: number;
  note?: string;
  onEdit?: () => void;
  onInputChange?: (value: string) => void;
  onInputKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
  onSave?: () => void;
}) {
  return (
    <div
      className={cx(
        'rounded-[16px] p-4',
        tone === 'mint'
          ? 'border border-teal-200 bg-teal-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]'
          : 'bg-slate-50',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={cx('text-xs', tone === 'mint' ? 'font-bold text-teal-700' : 'text-slate-500')}
        >
          {label}
        </div>
        {onEdit ? (
          <button
            type="button"
            onClick={onEdit}
            className={cx(
              'inline-flex h-8 w-8 items-center justify-center rounded-full border transition',
              tone === 'mint'
                ? 'border-teal-200 bg-white/80 text-teal-700 hover:border-teal-300 hover:bg-white'
                : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700',
            )}
            aria-label={`${label} 직접 입력`}
          >
            <PencilLine className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>
      {editing ? (
        <div className="mt-3">
          <p className="mb-2 text-[11px] font-medium leading-4 text-teal-700">
            배점(b) 옵션으로 맞추기 어려운 소수 둘째 자리 평점을 직접 입력합니다.
          </p>
          <input
            type="number"
            min="0"
            max={inputMax}
            step="0.01"
            value={inputValue}
            onChange={(event) => onInputChange?.(event.target.value)}
            onKeyDown={onInputKeyDown}
            placeholder={inputPlaceholder}
            autoFocus
            className="h-10 w-full min-w-0 rounded-[12px] border border-teal-200 bg-white px-3 text-sm font-bold text-teal-800 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
          />
          <div className="mt-3 flex flex-wrap justify-end gap-2">
            {onSave ? (
              <button
                type="button"
                onClick={onSave}
                className="inline-flex h-8 items-center gap-1 rounded-full bg-teal-700 px-3 text-xs font-semibold text-white transition hover:bg-teal-800"
              >
                <Check className="h-3.5 w-3.5" />
                저장
              </button>
            ) : null}
          </div>
        </div>
      ) : (
        <>
          <div
            className={cx(
              'mt-2 whitespace-nowrap text-base font-bold',
              tone === 'mint' ? 'text-teal-900' : 'text-slate-950',
            )}
          >
            {value}
          </div>
          {note ? <p className="mt-2 text-[11px] font-medium text-teal-700">{note}</p> : null}
        </>
      )}
    </div>
  );
}

function ChangeFilterTile({
  label,
  value,
  active,
  onClick,
}: {
  label: string;
  value: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        'rounded-[16px] border p-4 text-left transition',
        active
          ? 'border-teal-300 bg-teal-50 shadow-sm ring-1 ring-teal-100'
          : 'border-transparent bg-slate-50 hover:border-teal-200 hover:bg-teal-50/40',
      )}
    >
      <div className={cx('text-xs', active ? 'font-bold text-teal-700' : 'text-slate-500')}>
        {label}
      </div>
      <div className="mt-2 whitespace-nowrap text-base font-bold text-slate-950">{value}</div>
    </button>
  );
}

function MetricLine({
  label,
  value,
  onClick,
}: {
  label: string;
  value: number;
  onClick?: () => void;
}) {
  const content = (
    <>
      <span
        className={cx(
          'text-left text-[12px] font-medium leading-5 text-slate-600',
          onClick && 'underline-offset-4 group-hover:underline',
        )}
      >
        {label}
      </span>
      <span className="min-w-6 text-right text-[12px] font-bold leading-5 tabular-nums text-slate-950">
        {value}
      </span>
    </>
  );
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="group mt-1 flex h-6 w-full items-center justify-between rounded-[8px] px-1 transition hover:bg-white hover:text-teal-700"
      >
        {content}
      </button>
    );
  }
  return <div className="mt-1 flex h-6 items-center justify-between px-1">{content}</div>;
}

function ChangeValueBox({
  label,
  state,
  value,
  score,
  scoreMode,
}: {
  label: string;
  state: BoardState;
  value: string;
  score: number;
  scoreMode: ScoreMode;
}) {
  return (
    <div className="rounded-[14px] bg-slate-50 p-3.5">
      <div className="text-[11px] font-bold text-slate-500">{label}</div>
      <div className="mt-2 text-sm font-semibold text-slate-900">{BOARD_META[state].label}</div>
      <div className="mt-1 text-xs leading-5 text-slate-500">
        {scoreMode === 'direct'
          ? `직접 입력 · 평점 ${fmt2(score)}`
          : `b ${value} · 평점 ${fmt2(score)}`}
      </div>
    </div>
  );
}

function ChangeDetailCard({
  change,
  onSelect,
}: {
  change: ItemChange;
  onSelect: () => void;
}) {
  const meta = SECTION_META[change.section];
  const baseContribution = change.baseState === 'selected' ? change.baseScore : 0;
  const currentContribution = change.currentState === 'selected' ? change.currentScore : 0;
  const totalDelta = currentContribution - baseContribution;
  const deltaTone =
    totalDelta > 0
      ? 'border-red-200 bg-red-50 text-red-600'
      : totalDelta < 0
        ? 'border-blue-200 bg-blue-50 text-blue-600'
        : 'border-slate-200 bg-slate-100 text-slate-500';
  const deltaLabel =
    totalDelta > 0
      ? `${fmt2(totalDelta)}점 상향`
      : totalDelta < 0
        ? `${fmt2(Math.abs(totalDelta))}점 하향`
        : '총점 영향 없음';
  const DeltaIcon =
    totalDelta > 0 ? TrendingUp : totalDelta < 0 ? TrendingDown : CircleMinus;

  return (
    <button
      type="button"
      onClick={onSelect}
      className="block w-full rounded-[18px] border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-teal-200 hover:bg-teal-50/20 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-teal-100"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={cx(
              'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium',
              meta.className,
            )}
          >
            {meta.icon}
            {meta.label}
          </span>
          <h3 className="min-w-0 break-keep text-sm font-bold leading-5 text-slate-950">
            {change.title}
          </h3>
        </div>
        <span
          className={cx(
            'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold',
            deltaTone,
          )}
        >
          <DeltaIcon className="h-3.5 w-3.5" />
          {deltaLabel}
        </span>
      </div>
      <div className="mt-4 grid items-center gap-3 md:grid-cols-[1fr_auto_1fr]">
        <ChangeValueBox
          label="기준 항목값"
          state={change.baseState}
          value={change.baseValue}
          score={change.baseScore}
          scoreMode={change.baseScoreMode}
        />
        <div className="hidden text-center text-sm text-slate-300 md:block">→</div>
        <ChangeValueBox
          label="현재 항목값"
          state={change.currentState}
          value={change.currentValue}
          score={change.currentScore}
          scoreMode={change.currentScoreMode}
        />
      </div>
      <div className="mt-4 rounded-[14px] border border-dashed border-slate-200 bg-slate-50 p-3.5">
        <div className="text-[11px] font-bold text-slate-500">변화 요약</div>
        <div className="mt-2 space-y-1 text-xs leading-5 text-slate-600">
          {change.stateChanged ? (
            <p>
              상태 변경: {BOARD_META[change.baseState].label} →{' '}
              {BOARD_META[change.currentState].label}
            </p>
          ) : null}
          {change.scoreChanged ? (
            <p>
              점수 변경: {fmt2(change.baseScore)}점 → {fmt2(change.currentScore)}점 (
              {change.scoreDelta > 0
                ? `${fmt2(change.scoreDelta)}점 상향`
                : `${fmt2(Math.abs(change.scoreDelta))}점 하향`}
              )
            </p>
          ) : null}
          {!change.scoreChanged && change.stateChanged ? (
            <p>항목 점수는 유지되고, 반영 여부에 따른 총점 영향만 발생했습니다.</p>
          ) : null}
        </div>
      </div>
    </button>
  );
}

// -------------------------------------------------------
// Main
// -------------------------------------------------------
export default function EPIScenarioCompare() {
  const baselineScenarioRef = useRef<Scenario | null>(null);
  if (!baselineScenarioRef.current) {
    baselineScenarioRef.current = createStandardScenario();
  }

  const [scenarios, setScenarios] = useState<Scenario[]>(() => [createStandardScenario()]);
  const [activeScenarioId, setActiveScenarioId] = useState<ScenarioId>('standard');
  const [selectedItemId, setSelectedItemId] = useState('A1');
  const [sectionFilter, setSectionFilter] = useState<SectionKey>('arch');
  const [changeFilter, setChangeFilter] = useState<ChangeFilter>('all');
  const [directScoreInput, setDirectScoreInput] = useState('');
  const [isDirectScoreEditing, setIsDirectScoreEditing] = useState(false);

  const changeDetailRef = useRef<HTMLElement | null>(null);
  const scenarioBoardRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const activeScenario = useMemo(
    () => scenarios.find((s) => s.id === activeScenarioId) ?? scenarios[0],
    [activeScenarioId, scenarios],
  );

  const selectedItem = useMemo(
    () => activeScenario.items.find((item) => item.id === selectedItemId) ?? activeScenario.items[0],
    [activeScenario.items, selectedItemId],
  );

  const selectedMeta = SECTION_META[selectedItem.section];
  const baselineScenario = baselineScenarioRef.current;
  const currentStandardScenario =
    scenarios.find((s) => s.id === 'standard') ?? createStandardScenario();
  const activeChanges = useMemo(
    () => getItemChanges(baselineScenario, activeScenario),
    [activeScenario, baselineScenario],
  );
  const filteredChanges = useMemo(
    () =>
      activeChanges.filter((change) => {
        if (changeFilter === 'state') return change.stateChanged;
        if (changeFilter === 'score') return change.scoreChanged;
        return true;
      }),
    [activeChanges, changeFilter],
  );

  const isEditDisabled = selectedItem.locked;
  const canEditRisk = !selectedItem.locked && selectedItem.boardState === 'selected';
  const canEditHold = !selectedItem.locked && selectedItem.boardState === 'backlog';
  const canEditRiskMemo = canEditRisk && selectedItem.risk;
  const canEditHoldMemo = canEditHold && selectedItem.hold;
  const addableScenarioId = nextScenarioId(scenarios);
  const isDirectModeActive = selectedItem.scoreMode === 'direct' || isDirectScoreEditing;

  useEffect(() => {
    setDirectScoreInput(
      selectedItem.scoreMode === 'direct' ? String(selectedItem.currentScore) : '',
    );
    setIsDirectScoreEditing(false);
  }, [selectedItem.currentScore, selectedItem.id, selectedItem.scoreMode]);

  const addScenario = (targetId = addableScenarioId) => {
    if (!targetId) return;
    const next = cloneAsAlternative(currentStandardScenario, targetId);
    setScenarios((prev) => [...prev, next]);
    setActiveScenarioId(next.id);
    setSelectedItemId(next.items[0]?.id ?? 'A1');
  };

  const removeScenario = (id: ScenarioId) => {
    if (id === 'standard') return;
    setScenarios((prev) => prev.filter((s) => s.id !== id));
    if (activeScenarioId === id) {
      setActiveScenarioId('standard');
      setSelectedItemId(scenarios.find((s) => s.id === 'standard')?.items[0]?.id ?? 'A1');
    }
  };

  const updateItem = (scenarioId: ScenarioId, itemId: string, patch: Partial<EpiItem>) => {
    setScenarios((prev) =>
      prev.map((scenario) =>
        scenario.id !== scenarioId
          ? scenario
          : {
              ...scenario,
              items: scenario.items.map((item) =>
                item.id === itemId ? { ...item, ...patch } : item,
              ),
            },
      ),
    );
  };

  const focusMemoField = (fieldId: string) => {
    requestAnimationFrame(() => {
      (document.getElementById(fieldId) as HTMLTextAreaElement | null)?.focus();
    });
  };

  const toggleItemLock = (scenarioId: ScenarioId, itemId: string) => {
    const target = scenarios.find((s) => s.id === scenarioId)?.items.find((i) => i.id === itemId);
    if (!target) return;
    updateItem(scenarioId, itemId, { locked: !target.locked });
  };

  const updateScoreFactor = (scenarioId: ScenarioId, itemId: string, value: string) => {
    const target = scenarios.find((s) => s.id === scenarioId)?.items.find((i) => i.id === itemId);
    if (!target) return;
    const currentValue = normalizeScoreFactor(value);
    const newScore = calcScore(target.basePoint, currentValue);
    updateItem(scenarioId, itemId, {
      currentValue,
      currentScore: newScore,
      scoreMode: 'factor',
      direction:
        newScore > target.standardScore ? 'up' : newScore < target.standardScore ? 'down' : 'standard',
    });
  };

  const updateDirectScore = (scenarioId: ScenarioId, itemId: string, value: string) => {
    const target = scenarios.find((s) => s.id === scenarioId)?.items.find((i) => i.id === itemId);
    if (!target) return;
    setDirectScoreInput(value);
    const normalizedScore = normalizeDirectScore(value, target.basePoint);
    updateItem(scenarioId, itemId, {
      currentScore: normalizedScore,
      scoreMode: 'direct',
      direction:
        normalizedScore > target.standardScore
          ? 'up'
          : normalizedScore < target.standardScore
            ? 'down'
            : 'standard',
    });
  };

  const applyDirectScore = (scenarioId: ScenarioId, itemId: string) => {
    updateDirectScore(scenarioId, itemId, directScoreInput);
    setIsDirectScoreEditing(false);
  };

  const resetDirectScore = (scenarioId: ScenarioId, itemId: string) => {
    const target = scenarios.find((s) => s.id === scenarioId)?.items.find((i) => i.id === itemId);
    if (!target) return;
    setIsDirectScoreEditing(false);
    setDirectScoreInput('');
    updateScoreFactor(scenarioId, itemId, target.currentValue);
  };

  const handleRiskToggle = (checked: boolean) => {
    updateItem(activeScenario.id, selectedItem.id, { risk: checked });
    if (checked) focusMemoField(`risk-memo-${activeScenario.id}-${selectedItem.id}`);
  };

  const handleHoldToggle = (checked: boolean) => {
    updateItem(activeScenario.id, selectedItem.id, { hold: checked });
    if (checked) focusMemoField(`hold-memo-${activeScenario.id}-${selectedItem.id}`);
  };

  const showScenarioChanges = (scenario: Scenario) => {
    setActiveScenarioId(scenario.id);
    changeDetailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const focusChangeItem = (change: ItemChange) => {
    setActiveScenarioId(activeScenario.id);
    setSelectedItemId(change.itemId);
    setSectionFilter(change.section);
    requestAnimationFrame(() => {
      const target = itemRefs.current[`${activeScenario.id}:${change.itemId}`];
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
      } else {
        scenarioBoardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  };

  return (
    <div className="w-full">
      {/* 헤더 */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-normal text-slate-950">
            EPI 법규 검토 대안 비교
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            기준안을 먼저 확인하고, 필요할 때 대안을 생성해 항목 조합을 비교합니다.
          </p>
        </div>
        <button
          type="button"
          disabled={!addableScenarioId}
          onClick={() => addScenario()}
          className="inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-full bg-teal-700 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          대안 생성 ({scenarios.length}/3)
        </button>
      </div>

      {/* 시나리오 보드 + 편집 패널 */}
      <div
        ref={scenarioBoardRef}
        className="scroll-mt-8 grid grid-cols-1 gap-7 xl:grid-cols-[repeat(3,minmax(0,390px))_360px]"
      >
        {SCENARIO_ORDER.map((scenarioId) => {
          const scenario = scenarios.find((s) => s.id === scenarioId);
          if (!scenario) {
            return addableScenarioId === scenarioId ? (
              <EmptyScenarioSlot
                key={scenarioId}
                slotId={scenarioId}
                onCreate={() =>
                  addScenario(scenarioId as Extract<ScenarioId, 'option1' | 'option2'>)
                }
              />
            ) : (
              <ScenarioSpacer key={scenarioId} />
            );
          }
          return (
            <ScenarioCard
              key={scenario.id}
              scenario={scenario}
              baseline={baselineScenario}
              active={scenario.id === activeScenarioId}
              filter={sectionFilter}
              selectedItemId={selectedItemId}
              registerItemRef={(itemId, node) => {
                itemRefs.current[`${scenario.id}:${itemId}`] = node;
              }}
              onFilterChange={setSectionFilter}
              onRemove={() => removeScenario(scenario.id)}
              onItemSelect={(itemId) => {
                setActiveScenarioId(scenario.id);
                setSelectedItemId(itemId);
              }}
              onMoveItem={(itemId, boardState) =>
                updateItem(
                  scenario.id,
                  itemId,
                  boardState === 'selected'
                    ? { boardState, hold: false }
                    : { boardState, risk: false },
                )
              }
              onToggleLock={(itemId) => {
                setActiveScenarioId(scenario.id);
                setSelectedItemId(itemId);
                toggleItemLock(scenario.id, itemId);
              }}
              onShowChanges={() => showScenarioChanges(scenario)}
            />
          );
        })}

        {/* 항목 편집 패널 */}
        <section
          className={cx(
            'rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm xl:sticky xl:top-8 xl:self-start',
            isEditDisabled && 'bg-slate-50/70',
          )}
        >
          <h2 className="text-lg font-bold tracking-normal">항목 편집 패널</h2>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span
              className={cx(
                'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
                selectedMeta.className,
              )}
            >
              {selectedMeta.icon}
              {selectedMeta.label}
            </span>
            <h3 className="min-w-0 flex-1 break-keep text-base font-bold leading-6">
              {selectedItem.title}
            </h3>
            {selectedItem.locked ? (
              <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600">
                잠금 항목
              </span>
            ) : null}
          </div>

          {isEditDisabled ? (
            <div className="mt-4 rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-500">
              항목 카드의 열쇠 버튼을 열림 상태로 바꾸면 리스크, 보류, 메모를 수정할 수 있습니다.
            </div>
          ) : null}

          <div className="mt-4 grid grid-cols-2 gap-3">
            <MetricTile label="기본배점(a)" value={`${fmt(selectedItem.basePoint)}점`} />
            <MetricTile
              label="평점(a×b)"
              value={`${selectedItem.scoreMode === 'direct' ? fmt2(selectedItem.currentScore) : fmt(selectedItem.currentScore)}점`}
              tone="mint"
              editing={isDirectScoreEditing}
              inputValue={directScoreInput}
              inputPlaceholder={
                selectedItem.scoreMode === 'direct'
                  ? fmt2(selectedItem.currentScore)
                  : fmt(selectedItem.currentScore)
              }
              inputMax={selectedItem.basePoint}
              note={
                selectedItem.scoreMode === 'direct' && !isDirectScoreEditing
                  ? '직접 입력 적용됨'
                  : undefined
              }
              onEdit={() => {
                setDirectScoreInput(String(selectedItem.currentScore));
                setIsDirectScoreEditing(true);
              }}
              onInputChange={setDirectScoreInput}
              onInputKeyDown={(event) => {
                if (event.key === 'Enter') applyDirectScore(activeScenario.id, selectedItem.id);
              }}
              onSave={() => applyDirectScore(activeScenario.id, selectedItem.id)}
            />
          </div>

          {/* 배점(b) */}
          <label className="mt-5 block text-sm font-semibold">배점(b)</label>
          <div
            className={cx(
              'mt-2 rounded-[16px] border p-3 transition',
              isDirectModeActive ? 'border-slate-200 bg-slate-50' : 'border-slate-200 bg-white',
            )}
          >
            {isDirectModeActive ? (
              <p className="mb-3 text-xs font-medium text-slate-500">
                평점 직접 입력 중에는 배점(b) 옵션 입력이 비활성화됩니다.
              </p>
            ) : null}
            <div className="grid grid-cols-[1fr_auto] items-center gap-3">
              <input
                type="number"
                min="0.6"
                max="1"
                step="0.1"
                value={selectedItem.currentValue}
                onChange={(event) =>
                  updateScoreFactor(activeScenario.id, selectedItem.id, event.target.value)
                }
                onBlur={(event) =>
                  updateScoreFactor(activeScenario.id, selectedItem.id, event.target.value)
                }
                disabled={isDirectModeActive}
                className="h-10 min-w-0 rounded-[12px] border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-950 outline-none transition focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 disabled:cursor-not-allowed disabled:opacity-45"
                aria-label={`${selectedItem.title} 배점(b)`}
              />
              {isDirectModeActive ? (
                <button
                  type="button"
                  onClick={() => resetDirectScore(activeScenario.id, selectedItem.id)}
                  className="inline-flex h-8 items-center gap-1 rounded-full bg-teal-700 px-3 text-xs font-semibold text-white transition hover:bg-teal-800"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  옵션 입력
                </button>
              ) : (
                <span className="whitespace-nowrap text-xs font-semibold text-slate-500">
                  옵션 선택
                </span>
              )}
            </div>
            <div className="mt-5 grid grid-cols-5 gap-1.5">
              {SCORE_FACTOR_OPTIONS.map((option) => (
                <div key={option} className="relative pt-7">
                  {selectedItem.standardValue === option ? (
                    <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-col items-center">
                      <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-700">
                        기준
                      </span>
                      <span className="mt-[2px] h-0 w-0 border-x-[4px] border-t-[5px] border-x-transparent border-t-teal-400" />
                    </div>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => updateScoreFactor(activeScenario.id, selectedItem.id, option)}
                    disabled={isDirectModeActive}
                    className={cx(
                      'h-8 w-full rounded-full border text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-40',
                      selectedItem.currentValue === option
                        ? 'border-teal-700 bg-teal-700 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]'
                        : selectedItem.standardValue === option
                          ? 'border-teal-200 bg-teal-50 text-teal-700 hover:border-teal-300 hover:bg-teal-100'
                          : 'border-slate-200 bg-white text-slate-500 hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700',
                    )}
                  >
                    {option}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 리스크 */}
          <div
            className={cx(
              'mt-7 rounded-[16px] border border-slate-200 px-4 py-3 transition',
              !canEditRisk && 'opacity-45 grayscale',
            )}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <h3 className="text-base font-bold">리스크 항목 지정</h3>
                <p className="mt-1 break-keep text-xs leading-5 text-slate-500">
                  반영된 항목 중 설계 변경 등으로 점수 하향 또는 누락 가능성이 있으면 체크합니다.
                </p>
              </div>
              <Switch
                checked={selectedItem.boardState === 'selected' && selectedItem.risk}
                disabled={!canEditRisk}
                onChange={handleRiskToggle}
                className="shrink-0"
              />
            </div>
            <textarea
              id={`risk-memo-${activeScenario.id}-${selectedItem.id}`}
              value={selectedItem.riskMemo}
              onChange={(event) =>
                updateItem(activeScenario.id, selectedItem.id, { riskMemo: event.target.value })
              }
              disabled={!canEditRiskMemo}
              placeholder="리스크 근거를 적어주세요."
              className={cx(
                'mt-3 min-h-[92px] w-full resize-none rounded-[14px] border border-slate-200 px-4 py-3 text-sm leading-6 outline-none transition focus:border-teal-300 focus:ring-2 focus:ring-teal-50 disabled:cursor-not-allowed disabled:opacity-45',
                canEditRiskMemo ? 'bg-teal-50/40' : 'bg-white',
              )}
            />
          </div>

          {/* 보류 */}
          <div
            className={cx(
              'mt-3 rounded-[16px] border border-slate-200 px-4 py-3 transition',
              !canEditHold && 'opacity-45 grayscale',
            )}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <h3 className="text-base font-bold">보류 항목 지정</h3>
                <p className="mt-1 break-keep text-xs leading-5 text-slate-500">
                  미반영 항목 중 선택 여지가 높거나 안전률 확보용 후보로 남길 항목이면 체크합니다.
                </p>
              </div>
              <Switch
                checked={selectedItem.boardState === 'backlog' && selectedItem.hold}
                disabled={!canEditHold}
                onChange={handleHoldToggle}
                className="shrink-0"
              />
            </div>
            <label className="mt-3 block text-xs font-bold text-slate-500">보류 메모</label>
            <textarea
              id={`hold-memo-${activeScenario.id}-${selectedItem.id}`}
              value={selectedItem.holdMemo}
              onChange={(event) =>
                updateItem(activeScenario.id, selectedItem.id, { holdMemo: event.target.value })
              }
              disabled={!canEditHoldMemo}
              placeholder="보류 이유를 적어주세요."
              className={cx(
                'mt-2 min-h-[92px] w-full resize-none rounded-[14px] border border-slate-200 px-4 py-3 text-sm leading-6 outline-none transition focus:border-teal-300 focus:ring-2 focus:ring-teal-50 disabled:cursor-not-allowed disabled:opacity-45',
                canEditHoldMemo ? 'bg-amber-50/60' : 'bg-white',
              )}
            />
          </div>
        </section>

        {/* 변경 상세 패널 */}
        <section
          ref={changeDetailRef}
          className="scroll-mt-8 rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm xl:col-span-3"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-normal">변경 상세</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                대안 단위 요약이 아니라 항목별 상태, 배점(b), 평점 변화를 추적합니다.
              </p>
            </div>
            <span className="rounded-full border border-teal-200 bg-teal-50 px-4 py-1.5 text-sm font-semibold text-teal-700">
              항목 추적: {activeScenario.title}
            </span>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <ChangeFilterTile
              label="변경 항목"
              value={`${activeChanges.length}개`}
              active={changeFilter === 'all'}
              onClick={() => setChangeFilter('all')}
            />
            <ChangeFilterTile
              label="상태 변경"
              value={`${activeChanges.filter((c) => c.stateChanged).length}개`}
              active={changeFilter === 'state'}
              onClick={() => setChangeFilter('state')}
            />
            <ChangeFilterTile
              label="점수 변경"
              value={`${activeChanges.filter((c) => c.scoreChanged).length}개`}
              active={changeFilter === 'score'}
              onClick={() => setChangeFilter('score')}
            />
          </div>

          <div className="mt-6 space-y-3">
            {filteredChanges.length === 0 ? (
              <div className="rounded-[18px] border border-dashed border-slate-200 bg-slate-50/70 p-9 text-center text-sm font-semibold text-slate-400">
                {changeFilter === 'state'
                  ? '상태가 변경된 항목이 없습니다.'
                  : changeFilter === 'score'
                    ? '점수가 변경된 항목이 없습니다.'
                    : '기준안 대비 변경된 항목이 없습니다.'}
              </div>
            ) : (
              filteredChanges.map((change) => (
                <ChangeDetailCard
                  key={change.itemId}
                  change={change}
                  onSelect={() => focusChangeItem(change)}
                />
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
