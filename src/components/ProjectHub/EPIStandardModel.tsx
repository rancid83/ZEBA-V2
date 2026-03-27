'use client';

import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock3,
  Info,
  Leaf,
  Lock,
  LockOpen,
  MessageSquareMore,
  RotateCcw,
  Save,
  Search,
  Wrench,
  Zap,
} from 'lucide-react';

// -------------------------------------------------------
// Types
// -------------------------------------------------------
type SectionKey = 'arch' | 'mech' | 'elec' | 'renew';
type BoardState = 'backlog' | 'selected' | 'hold';
type SourceType = '표준' | '조정' | '추가';
type HvacType = 'central' | 'individual';
type ValueOption = '1.0' | '0.9' | '0.8' | '0.7' | '0.6' | '적용' | '미적용';

type Item = {
  id: string;
  section: SectionKey;
  title: string;
  standardValue: ValueOption;
  currentValue: ValueOption;
  standardScore: number;
  currentScore: number;
  maxScore: number;
  boardState: BoardState;
  sourceType: SourceType;
  locked: boolean;
  holdReason: string;
  note: string;
};

type SavedScenario = {
  id: string;
  name: string;
  hvacType: HvacType;
  savedAt: string;
  totalScore: number;
  holdCount: number;
  selectedCount: number;
};

type AdvisoryRequest = {
  id: string;
  createdAt: string;
  hvacLabel: string;
  score: number;
  itemTitles: string[];
};

type SectionMeta = {
  label: string;
  icon: React.ReactNode;
  badgeClass: string;
};

// -------------------------------------------------------
// Constants
// -------------------------------------------------------
const sectionMeta: Record<SectionKey, SectionMeta> = {
  arch: {
    label: '건축',
    icon: <Building2 className="h-3.5 w-3.5" />,
    badgeClass: 'border-sky-200 bg-sky-50 text-sky-700',
  },
  mech: {
    label: '기계',
    icon: <Wrench className="h-3.5 w-3.5" />,
    badgeClass: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  },
  elec: {
    label: '전기',
    icon: <Zap className="h-3.5 w-3.5" />,
    badgeClass: 'border-violet-200 bg-violet-50 text-violet-700',
  },
  renew: {
    label: '신재생',
    icon: <Leaf className="h-3.5 w-3.5" />,
    badgeClass: 'border-amber-200 bg-amber-50 text-amber-800',
  },
};

const boardMeta: Record<
  BoardState,
  { title: string; desc: string; boxClass: string; icon: React.ReactNode }
> = {
  backlog: {
    title: '검토 전',
    desc: '아직 판단되지 않은 항목',
    boxClass: 'border-zinc-200 bg-zinc-50',
    icon: <Clock3 className="h-4 w-4" />,
  },
  selected: {
    title: '채택',
    desc: '현재 설계 시나리오에 반영된 항목',
    boxClass: 'border-emerald-200 bg-emerald-50/50',
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
  hold: {
    title: '보류',
    desc: '추가 판단 또는 자문이 필요한 항목',
    boxClass: 'border-amber-200 bg-amber-50/50',
    icon: <MessageSquareMore className="h-4 w-4" />,
  },
};

const VALUE_OPTIONS: ValueOption[] = ['1.0', '0.9', '0.8', '0.7', '0.6', '적용', '미적용'];
const HOLD_OPTIONS = [
  '사유 없음',
  '기술 검토 필요',
  '설비 적용 가능 여부 확인 필요',
  '비용 영향 확인 필요',
  '법규 해석 자문 필요',
] as const;

const PROJECT = {
  name: '성수 업무시설',
  region: '서울',
  usage: '업무시설',
  gfa: '2,400㎡',
  floors: '8층',
  sizeType: '소형',
  target: '서비스 대상',
};

const SEED_ITEMS: Record<HvacType, Item[]> = {
  central: [
    {
      id: 'A1', section: 'arch', title: '외벽의 평균 열관류율',
      standardValue: '0.8', currentValue: '0.8', standardScore: 27.2, currentScore: 27.2, maxScore: 34,
      boardState: 'selected', sourceType: '표준', locked: true, holdReason: '사유 없음', note: '표준모델 기본 적용 항목',
    },
    {
      id: 'M1', section: 'mech', title: '난방 설비',
      standardValue: '0.8', currentValue: '0.8', standardScore: 4.8, currentScore: 4.8, maxScore: 6,
      boardState: 'selected', sourceType: '표준', locked: true, holdReason: '사유 없음', note: '중앙식 기준 기본 적용',
    },
    {
      id: 'E1', section: 'elec', title: '조명 밀도',
      standardValue: '0.8', currentValue: '0.8', standardScore: 6.4, currentScore: 6.4, maxScore: 8,
      boardState: 'selected', sourceType: '표준', locked: true, holdReason: '사유 없음', note: '표준모델 기본 적용 항목',
    },
    {
      id: 'R4', section: 'renew', title: '조명 설비 신재생에너지 설비 적용',
      standardValue: '0.6', currentValue: '0.6', standardScore: 2.4, currentScore: 2.4, maxScore: 4,
      boardState: 'selected', sourceType: '표준', locked: false, holdReason: '사유 없음', note: '기본 반영 수준',
    },
    {
      id: 'M6', section: 'mech', title: '열교환기 효율',
      standardValue: '0.8', currentValue: '0.8', standardScore: 2.4, currentScore: 2.4, maxScore: 3,
      boardState: 'backlog', sourceType: '추가', locked: false, holdReason: '사유 없음', note: '점수 보완 후보',
    },
    {
      id: 'R1', section: 'renew', title: '난방 설비 신재생에너지 설비 적용',
      standardValue: '0.6', currentValue: '0.6', standardScore: 2.4, currentScore: 2.4, maxScore: 4,
      boardState: 'hold', sourceType: '추가', locked: false, holdReason: '기술 검토 필요', note: '컨설턴트 자문 후보',
    },
  ],
  individual: [
    {
      id: 'A1', section: 'arch', title: '외벽의 평균 열관류율',
      standardValue: '0.8', currentValue: '0.8', standardScore: 27.2, currentScore: 27.2, maxScore: 34,
      boardState: 'selected', sourceType: '표준', locked: true, holdReason: '사유 없음', note: '표준모델 기본 적용 항목',
    },
    {
      id: 'M1', section: 'mech', title: '난방 설비',
      standardValue: '0.7', currentValue: '0.7', standardScore: 4.2, currentScore: 4.2, maxScore: 6,
      boardState: 'selected', sourceType: '표준', locked: false, holdReason: '사유 없음', note: '개별식 기준 기본 적용',
    },
    {
      id: 'M17', section: 'mech', title: '개별식 보상 점수',
      standardValue: '적용', currentValue: '적용', standardScore: 2, currentScore: 2, maxScore: 2,
      boardState: 'selected', sourceType: '표준', locked: true, holdReason: '사유 없음', note: '개별식 기본 반영',
    },
    {
      id: 'E1', section: 'elec', title: '조명 밀도',
      standardValue: '0.8', currentValue: '0.8', standardScore: 6.4, currentScore: 6.4, maxScore: 8,
      boardState: 'selected', sourceType: '표준', locked: true, holdReason: '사유 없음', note: '표준모델 기본 적용 항목',
    },
    {
      id: 'R4', section: 'renew', title: '조명 설비 신재생에너지 설비 적용',
      standardValue: '0.6', currentValue: '0.6', standardScore: 2.4, currentScore: 2.4, maxScore: 4,
      boardState: 'selected', sourceType: '표준', locked: false, holdReason: '사유 없음', note: '기본 반영 수준',
    },
    {
      id: 'M6', section: 'mech', title: '열교환기 효율',
      standardValue: '0.8', currentValue: '0.8', standardScore: 2.4, currentScore: 2.4, maxScore: 3,
      boardState: 'backlog', sourceType: '추가', locked: false, holdReason: '사유 없음', note: '점수 보완 후보',
    },
    {
      id: 'E8', section: 'elec', title: 'BEMS 적용',
      standardValue: '0.7', currentValue: '0.7', standardScore: 2.1, currentScore: 2.1, maxScore: 3,
      boardState: 'backlog', sourceType: '추가', locked: false, holdReason: '사유 없음', note: '점수 확보 후보',
    },
    {
      id: 'R1', section: 'renew', title: '난방 설비 신재생에너지 설비 적용',
      standardValue: '0.6', currentValue: '0.6', standardScore: 2.4, currentScore: 2.4, maxScore: 4,
      boardState: 'hold', sourceType: '추가', locked: false, holdReason: '기술 검토 필요', note: '컨설턴트 자문 후보',
    },
    {
      id: 'M10', section: 'mech', title: '전기 제외한 냉방 에너지원 적용',
      standardValue: '0.7', currentValue: '0.7', standardScore: 0.7, currentScore: 0.7, maxScore: 1,
      boardState: 'hold', sourceType: '추가', locked: false, holdReason: '설비 적용 가능 여부 확인 필요', note: '설계 가정 검토 필요',
    },
  ],
};

// -------------------------------------------------------
// Helpers
// -------------------------------------------------------
function cloneSeed(type: HvacType): Item[] {
  return SEED_ITEMS[type].map((item) => ({ ...item }));
}

function fmt(value: number): string {
  return value.toFixed(1);
}

function hvacLabel(type: HvacType): string {
  return type === 'central' ? '중앙식' : '개별식';
}

function buildScenarioName(type: HvacType): string {
  return type === 'central' ? '소형(중앙식) 표준 조정안' : '소형(개별식) 표준 조정안';
}

function calcScoreFromValue(value: ValueOption, maxScore: number, fallback: number): number {
  if (value === '적용') return maxScore;
  if (value === '미적용') return 0;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : Math.min(maxScore, parsed * maxScore);
}

function summarizeSourceType(item: Item): SourceType {
  if (item.boardState !== 'selected') return item.sourceType;
  if (item.currentValue === item.standardValue) return item.sourceType === '추가' ? '추가' : '표준';
  return '조정';
}

function cx(...tokens: Array<string | false | null | undefined>): string {
  return tokens.filter(Boolean).join(' ');
}

// -------------------------------------------------------
// Sub-components
// -------------------------------------------------------
function SectionBadge({ section }: { section: SectionKey }) {
  const meta = sectionMeta[section];
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium',
        meta.badgeClass,
      )}
    >
      {meta.icon}
      {meta.label}
    </span>
  );
}

function ProjectInfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-zinc-900">{value}</p>
    </div>
  );
}

function KpiCell({ title, value, helper }: { title: string; value: string; helper: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3">
      <p className="text-xs text-zinc-500">{title}</p>
      <p className="mt-1.5 text-base font-semibold text-zinc-900">{value}</p>
      <p className="mt-0.5 text-[11px] text-zinc-400">{helper}</p>
    </div>
  );
}

function ItemCard({
  item,
  active,
  onClick,
  onToggleLock,
}: {
  item: Item;
  active: boolean;
  onClick: () => void;
  onToggleLock?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        'w-full rounded-2xl border bg-white p-3 text-left transition hover:border-zinc-300 hover:shadow-sm',
        active ? 'border-zinc-900 shadow-sm' : 'border-zinc-200',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <SectionBadge section={item.section} />
            <span className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-2 py-0.5 text-[11px] text-zinc-600">
              {item.sourceType}
            </span>
          </div>
          <p className="mt-2 text-sm font-semibold text-zinc-900">{item.title}</p>
          <p className="mt-0.5 text-xs text-zinc-500">
            표준 {item.standardValue} · 현재 {item.currentValue} · {fmt(item.currentScore)}점
          </p>
          {item.boardState === 'hold' && item.holdReason !== '사유 없음' && (
            <p className="mt-1.5 text-xs text-amber-700">{item.holdReason}</p>
          )}
        </div>
        {item.boardState === 'selected' && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleLock?.();
            }}
            className="rounded-xl border border-zinc-200 bg-zinc-50 p-1.5 text-zinc-500 transition hover:bg-zinc-100"
            aria-label={item.locked ? '잠금 해제' : '잠금 설정'}
          >
            {item.locked ? <Lock className="h-3.5 w-3.5" /> : <LockOpen className="h-3.5 w-3.5" />}
          </button>
        )}
      </div>
    </button>
  );
}

function BoardColumn({
  state,
  items,
  selectedId,
  onSelect,
  onToggleLock,
}: {
  state: BoardState;
  items: Item[];
  selectedId: string;
  onSelect: (id: string) => void;
  onToggleLock: (id: string) => void;
}) {
  const meta = boardMeta[state];
  return (
    <div className={cx('rounded-3xl border p-3', meta.boxClass)}>
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
            {meta.icon}
            {meta.title}
          </div>
          <p className="mt-0.5 text-xs text-zinc-500">{meta.desc}</p>
        </div>
        <span className="inline-flex items-center rounded-full bg-white px-2 py-0.5 text-xs font-medium text-zinc-600 shadow-sm border border-zinc-200">
          {items.length}
        </span>
      </div>
      <div className="space-y-2">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-200 bg-white/70 px-3 py-6 text-center text-xs text-zinc-500">
            표시할 항목이 없습니다.
          </div>
        ) : (
          items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              active={item.id === selectedId}
              onClick={() => onSelect(item.id)}
              onToggleLock={() => onToggleLock(item.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

// -------------------------------------------------------
// Main component
// -------------------------------------------------------
export default function EPIStandardModel() {
  const [hvacType, setHvacType] = useState<HvacType>('individual');
  const [items, setItems] = useState<Item[]>(() => cloneSeed('individual'));
  const [selectedId, setSelectedId] = useState<string>(SEED_ITEMS.individual[0]?.id ?? '');
  const [query, setQuery] = useState('');
  const [sectionFilter, setSectionFilter] = useState<SectionKey | 'all'>('all');
  const [scenarioName, setScenarioName] = useState(buildScenarioName('individual'));
  const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>([]);
  const [advisoryRequests, setAdvisoryRequests] = useState<AdvisoryRequest[]>([]);
  const [toast, setToast] = useState('');

  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedId) ?? null,
    [items, selectedId],
  );

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return items.filter((item) => {
      const sameSection = sectionFilter === 'all' || item.section === sectionFilter;
      const matchesQuery = !normalized || item.title.toLowerCase().includes(normalized);
      return sameSection && matchesQuery;
    });
  }, [items, query, sectionFilter]);

  const columns = useMemo(
    () => ({
      backlog: filteredItems.filter((i) => i.boardState === 'backlog'),
      selected: filteredItems.filter((i) => i.boardState === 'selected'),
      hold: filteredItems.filter((i) => i.boardState === 'hold'),
    }),
    [filteredItems],
  );

  const selectedItems = useMemo(() => items.filter((i) => i.boardState === 'selected'), [items]);
  const holdItems = useMemo(() => items.filter((i) => i.boardState === 'hold'), [items]);
  const standardTotal = useMemo(
    () => items.filter((i) => i.sourceType === '표준').reduce((s, i) => s + i.standardScore, 0),
    [items],
  );
  const currentTotal = useMemo(
    () => selectedItems.reduce((s, i) => s + i.currentScore, 0),
    [selectedItems],
  );

  const sectionKpis = useMemo(() => {
    const order: SectionKey[] = ['arch', 'mech', 'elec', 'renew'];
    return order.map((section) => {
      const rows = items.filter((i) => i.section === section);
      return {
        section,
        totalCount: rows.length,
        selectedCount: rows.filter((i) => i.boardState === 'selected').length,
        standardScore: rows.filter((i) => i.sourceType === '표준').reduce((s, i) => s + i.standardScore, 0),
        currentScore: rows.filter((i) => i.boardState === 'selected').reduce((s, i) => s + i.currentScore, 0),
        maxScore: rows.reduce((s, i) => s + i.maxScore, 0),
      };
    });
  }, [items]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const resetByType = (nextType: HvacType) => {
    const nextItems = cloneSeed(nextType);
    setHvacType(nextType);
    setItems(nextItems);
    setSelectedId(nextItems[0]?.id ?? '');
    setScenarioName(buildScenarioName(nextType));
    showToast(`${hvacLabel(nextType)} 표준모델로 초기화했습니다.`);
  };

  const updateItem = (id: string, updater: (item: Item) => Item) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const next = updater(item);
        return { ...next, sourceType: summarizeSourceType(next) };
      }),
    );
  };

  const moveItem = (id: string, nextState: BoardState) => {
    const target = items.find((i) => i.id === id);
    if (!target) return;
    updateItem(id, (item) => ({
      ...item,
      boardState: nextState,
      sourceType:
        nextState === 'selected'
          ? item.currentValue === item.standardValue
            ? item.sourceType === '추가' ? '추가' : '표준'
            : '조정'
          : item.sourceType,
    }));
    showToast(`${target.title} 항목을 ${boardMeta[nextState].title} 상태로 이동했습니다.`);
  };

  const toggleLock = (id: string) => {
    const target = items.find((i) => i.id === id);
    if (!target || target.boardState !== 'selected') return;
    updateItem(id, (item) => ({ ...item, locked: !item.locked }));
    showToast(`${target.title} 항목 ${target.locked ? '잠금 해제' : '잠금 설정'} 완료`);
  };

  const restoreStandard = () => {
    if (!selectedItem) return;
    updateItem(selectedItem.id, (item) => ({
      ...item,
      currentValue: item.standardValue,
      currentScore: item.standardScore,
      note: '표준모델 값으로 되돌림',
    }));
    showToast(`${selectedItem.title} 항목을 표준값으로 되돌렸습니다.`);
  };

  const saveScenario = () => {
    const name = scenarioName.trim() || buildScenarioName(hvacType);
    setSavedScenarios((prev) => [
      {
        id: String(Date.now()),
        name,
        hvacType,
        savedAt: new Date().toLocaleString('ko-KR'),
        totalScore: currentTotal,
        holdCount: holdItems.length,
        selectedCount: selectedItems.length,
      },
      ...prev,
    ]);
    showToast('현재 시나리오를 저장했습니다.');
  };

  const createAdvisory = () => {
    if (holdItems.length === 0) return;
    setAdvisoryRequests((prev) => [
      {
        id: String(Date.now()),
        createdAt: new Date().toLocaleString('ko-KR'),
        hvacLabel: hvacLabel(hvacType),
        score: currentTotal,
        itemTitles: holdItems.map((i) => i.title),
      },
      ...prev,
    ]);
    showToast('보류 항목 자문 요청 초안을 생성했습니다.');
  };

  return (
    <div className="space-y-4">
      {/* Toast */}
      {toast && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {toast}
        </div>
      )}

      {/* Project info + HVAC assumption */}
      <div className="grid gap-4 xl:grid-cols-2">
        {/* Project overview */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-5">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-400">
            Project Overview
          </p>
          <div className="mt-2 flex items-start justify-between gap-3">
            <h2 className="text-lg font-bold text-zinc-900">{PROJECT.name}</h2>
            <div className="flex gap-1.5">
              <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 text-xs text-zinc-600">
                {PROJECT.sizeType}
              </span>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs text-emerald-700">
                {PROJECT.target}
              </span>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-4 gap-2">
            <ProjectInfoCell label="지역" value={PROJECT.region} />
            <ProjectInfoCell label="용도" value={PROJECT.usage} />
            <ProjectInfoCell label="연면적" value={PROJECT.gfa} />
            <ProjectInfoCell label="층 수" value={PROJECT.floors} />
          </div>
        </div>

        {/* HVAC assumption */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-5">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-400">
            Scenario Assumption
          </p>
          <h2 className="mt-2 text-lg font-bold text-zinc-900">설비 방식 가정</h2>
          <div className="mt-4 space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-700">주 설비 방식</label>
              <select
                value={hvacType}
                onChange={(e) => resetByType(e.target.value as HvacType)}
                className="h-10 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="central">중앙식</option>
                <option value="individual">개별식</option>
              </select>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-sm">
              <p className="font-semibold text-zinc-800">{buildScenarioName(hvacType)}</p>
              <p className="mt-1 text-xs text-zinc-500">
                설비 방식은 확정 설계값이 아니라 비교용 시나리오 가정값입니다.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <KpiCell title="표준 총점" value={fmt(standardTotal)} helper="기준 모델" />
              <KpiCell title="현재 총점" value={fmt(currentTotal)} helper="채택 합계" />
              <KpiCell title="보류 항목" value={`${holdItems.length}건`} helper="자문 후보" />
            </div>
          </div>
        </div>
      </div>

      {/* Section KPIs */}
      <div className="grid gap-3 grid-cols-2 xl:grid-cols-4">
        {sectionKpis.map((kpi) => (
          <div key={kpi.section} className="rounded-3xl border border-zinc-200 bg-white p-4 space-y-3">
            <div className="flex items-center justify-between">
              <SectionBadge section={kpi.section} />
              <span className="text-[10px] text-zinc-400">현재 / 최대</span>
            </div>
            <div>
              <p className="text-xs text-zinc-500">점수</p>
              <p className="mt-1 text-sm font-semibold text-zinc-900">
                {fmt(kpi.currentScore)} / {fmt(kpi.maxScore)}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">항목 수</p>
              <p className="mt-1 text-sm font-semibold text-zinc-900">
                {kpi.selectedCount} / {kpi.totalCount}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">표준점수</p>
              <p className="mt-1 text-sm font-semibold text-zinc-900">{fmt(kpi.standardScore)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Kanban + Editor */}
      <div className="grid gap-4 xl:grid-cols-[1.7fr_1fr]">
        {/* Kanban board */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-5">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-400">
            EPI Standard Model
          </p>
          <div className="mt-2 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <h2 className="text-lg font-bold text-zinc-900">칸반 보드</h2>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[200px] flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="항목 검색"
                  className="h-9 w-full rounded-2xl border border-zinc-200 bg-white pl-9 pr-3 text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <select
                value={sectionFilter}
                onChange={(e) => setSectionFilter(e.target.value as SectionKey | 'all')}
                className="h-9 rounded-2xl border border-zinc-200 bg-white px-3 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">전체 공종</option>
                <option value="arch">건축</option>
                <option value="mech">기계</option>
                <option value="elec">전기</option>
                <option value="renew">신재생</option>
              </select>
              <button
                onClick={() => resetByType(hvacType)}
                className="flex h-9 items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-3 text-sm text-zinc-600 transition hover:border-zinc-300 hover:text-zinc-900"
              >
                <RotateCcw className="h-4 w-4" />
                초기화
              </button>
            </div>
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-3">
            <BoardColumn
              state="backlog"
              items={columns.backlog}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onToggleLock={toggleLock}
            />
            <BoardColumn
              state="selected"
              items={columns.selected}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onToggleLock={toggleLock}
            />
            <BoardColumn
              state="hold"
              items={columns.hold}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onToggleLock={toggleLock}
            />
          </div>
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          {/* Editor */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-5">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-400">
              Editor
            </p>
            <h2 className="mt-2 text-lg font-bold text-zinc-900">선택 항목 편집</h2>
            <div className="mt-4">
              {selectedItem ? (
                <div className="space-y-4">
                  {/* Item header */}
                  <div className="flex items-start justify-between gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                    <div>
                      <SectionBadge section={selectedItem.section} />
                      <p className="mt-2 text-sm font-semibold text-zinc-900">{selectedItem.title}</p>
                      <p className="mt-0.5 text-xs text-zinc-500">
                        최대 배점 {fmt(selectedItem.maxScore)}점
                      </p>
                    </div>
                    {selectedItem.boardState === 'selected' && (
                      <span className="rounded-full border border-zinc-200 bg-white px-2.5 py-0.5 text-xs text-zinc-600">
                        {selectedItem.locked ? '잠금' : '편집 가능'}
                      </span>
                    )}
                  </div>

                  {/* Score KPIs */}
                  <div className="grid grid-cols-3 gap-2">
                    <KpiCell
                      title="표준값"
                      value={selectedItem.standardValue}
                      helper={`${fmt(selectedItem.standardScore)}점`}
                    />
                    <KpiCell
                      title="현재값"
                      value={selectedItem.currentValue}
                      helper={`${fmt(selectedItem.currentScore)}점`}
                    />
                    <KpiCell
                      title="변화"
                      value={fmt(selectedItem.currentScore - selectedItem.standardScore)}
                      helper={
                        selectedItem.currentValue === selectedItem.standardValue
                          ? '표준 유지'
                          : '조정 반영'
                      }
                    />
                  </div>

                  {/* Current value select */}
                  <div className="space-y-2 rounded-2xl border border-zinc-200 p-4">
                    <label className="text-xs font-medium text-zinc-700">현재값</label>
                    <select
                      value={selectedItem.currentValue}
                      disabled={selectedItem.locked}
                      onChange={(e) => {
                        const value = e.target.value as ValueOption;
                        updateItem(selectedItem.id, (item) => ({
                          ...item,
                          currentValue: value,
                          currentScore: calcScoreFromValue(value, item.maxScore, item.currentScore),
                        }));
                      }}
                      className="h-9 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {VALUE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-zinc-400">
                      표준값과 다르면 자동으로 조정안으로 표시됩니다.
                    </p>
                  </div>

                  {/* Note */}
                  <div className="space-y-2 rounded-2xl border border-zinc-200 p-4">
                    <label className="text-xs font-medium text-zinc-700">Editor 메모</label>
                    <textarea
                      value={selectedItem.note}
                      disabled={selectedItem.locked}
                      onChange={(e) =>
                        updateItem(selectedItem.id, (item) => ({ ...item, note: e.target.value }))
                      }
                      rows={3}
                      className="w-full rounded-2xl border border-zinc-200 bg-white p-3 text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                      placeholder="설계 메모 또는 협의 포인트를 입력"
                    />
                  </div>

                  {/* Hold reason */}
                  <div className="space-y-2 rounded-2xl border border-zinc-200 p-4">
                    <label className="text-xs font-medium text-zinc-700">보류 사유</label>
                    <select
                      value={selectedItem.holdReason}
                      onChange={(e) =>
                        updateItem(selectedItem.id, (item) => ({ ...item, holdReason: e.target.value }))
                      }
                      className="h-9 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      {HOLD_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="border-t border-zinc-100 pt-2" />

                  {/* Action buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => moveItem(selectedItem.id, 'selected')}
                      className="h-9 rounded-2xl bg-zinc-900 text-xs font-semibold text-white transition hover:bg-zinc-700"
                    >
                      채택으로 반영
                    </button>
                    <button
                      onClick={() => moveItem(selectedItem.id, 'hold')}
                      className="h-9 rounded-2xl border border-zinc-200 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50"
                    >
                      보류로 이동
                    </button>
                    <button
                      onClick={() => moveItem(selectedItem.id, 'backlog')}
                      className="h-9 rounded-2xl border border-zinc-200 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50"
                    >
                      검토 전으로 이동
                    </button>
                    <button
                      onClick={restoreStandard}
                      className="h-9 rounded-2xl border border-zinc-200 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50"
                    >
                      표준값으로 되돌리기
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-8 text-center text-sm text-zinc-500">
                  편집할 항목을 선택하세요.
                </div>
              )}
            </div>
          </div>

          {/* Action layer */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-5">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-400">
              Action Layer
            </p>
            <h2 className="mt-2 text-lg font-bold text-zinc-900">판단 결과 → 실행</h2>

            <div className="mt-4 space-y-4">
              {/* Save scenario */}
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <KpiCell title="채택" value={`${selectedItems.length}건`} helper="현재 시나리오" />
                  <KpiCell title="보류" value={`${holdItems.length}건`} helper="자문 후보" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-700">시나리오 이름</label>
                  <input
                    value={scenarioName}
                    onChange={(e) => setScenarioName(e.target.value)}
                    placeholder="시나리오 이름 입력"
                    className="h-9 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={saveScenario}
                    className="flex h-9 items-center justify-center gap-1.5 rounded-2xl bg-zinc-900 text-xs font-semibold text-white transition hover:bg-zinc-700"
                  >
                    <Save className="h-3.5 w-3.5" />
                    시나리오 저장
                  </button>
                  <button
                    onClick={createAdvisory}
                    disabled={holdItems.length === 0}
                    className="flex h-9 items-center justify-center gap-1.5 rounded-2xl border border-zinc-200 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <MessageSquareMore className="h-3.5 w-3.5" />
                    보류 항목 자문 요청
                  </button>
                </div>
              </div>

              {/* Saved scenarios */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-zinc-900">저장된 시나리오</p>
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
                    {savedScenarios.length}
                  </span>
                </div>
                <div className="mt-3 space-y-2">
                  {savedScenarios.length === 0 ? (
                    <p className="rounded-xl bg-zinc-50 px-3 py-3 text-xs text-zinc-500">
                      저장된 시나리오가 없습니다.
                    </p>
                  ) : (
                    savedScenarios.map((s) => (
                      <div key={s.id} className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-zinc-900">{s.name}</p>
                            <p className="mt-0.5 text-xs text-zinc-500">{s.savedAt}</p>
                          </div>
                          <span className="rounded-full border border-zinc-200 bg-white px-2 py-0.5 text-xs text-zinc-600">
                            {hvacLabel(s.hvacType)}
                          </span>
                        </div>
                        <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                          {[
                            { label: '총점', value: fmt(s.totalScore) },
                            { label: '채택', value: `${s.selectedCount}건` },
                            { label: '보류', value: `${s.holdCount}건` },
                          ].map(({ label, value }) => (
                            <div
                              key={label}
                              className="rounded-lg border border-zinc-200 bg-white px-2 py-2 text-center"
                            >
                              <p className="text-zinc-500">{label}</p>
                              <p className="mt-0.5 font-semibold text-zinc-900">{value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Advisory requests */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-zinc-900">자문 요청 초안</p>
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
                    {advisoryRequests.length}
                  </span>
                </div>
                <div className="mt-3 space-y-2">
                  {advisoryRequests.length === 0 ? (
                    <p className="rounded-xl bg-zinc-50 px-3 py-3 text-xs text-zinc-500">
                      생성된 자문 요청이 없습니다.
                    </p>
                  ) : (
                    advisoryRequests.map((r) => (
                      <div
                        key={r.id}
                        className="rounded-xl border border-amber-200 bg-amber-50 p-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-zinc-900">
                              {r.hvacLabel} 자문 요청
                            </p>
                            <p className="mt-0.5 text-xs text-zinc-600">{r.createdAt}</p>
                          </div>
                          <span className="rounded-full border border-amber-300 bg-white px-2 py-0.5 text-xs text-amber-800">
                            총점 {fmt(r.score)}
                          </span>
                        </div>
                        <div className="mt-3 rounded-xl border border-amber-200 bg-white p-3">
                          <p className="text-xs font-medium text-zinc-900">요청 항목</p>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {r.itemTitles.map((title) => (
                              <span
                                key={title}
                                className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 text-xs text-zinc-700"
                              >
                                {title}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-3 rounded-3xl border border-zinc-200 bg-white p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2 text-sm text-zinc-600">
          <Info className="h-4 w-4 shrink-0" />
          <span>버그를 줄이기 위해 상태를 단순화하고, 모달 대신 인라인 액션 구조로 재작성했습니다.</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-400 shrink-0">
          <span>표준모델</span>
          <ArrowRight className="h-3.5 w-3.5" />
          <span>시나리오 조정</span>
          <ArrowRight className="h-3.5 w-3.5" />
          <span>자문 요청</span>
        </div>
      </div>
    </div>
  );
}
