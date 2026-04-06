'use client';

import React, { useMemo, useState } from 'react';
import {
  Building2,
  CheckCircle2,
  Clock3,
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
type BuildingScale = 'small' | 'large';
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

type SelectedStatusBadge = {
  label: '상향' | '표준' | '하향';
  className: string;
};

// -------------------------------------------------------
// Constants
// -------------------------------------------------------
const PROJECT = {
  name: '성수 업무시설',
  region: '서울',
  usage: '업무시설',
  gfa: '2,400㎡',
  floors: '8층',
};

const VALUE_OPTIONS: ValueOption[] = ['1.0', '0.9', '0.8', '0.7', '0.6', '적용', '미적용'];
const HVAC_OPTIONS: Array<{ value: HvacType; label: string }> = [
  { value: 'individual', label: '개별식' },
  { value: 'central', label: '중앙식' },
];
const SECTION_FILTER_OPTIONS: Array<{ value: SectionKey | 'all'; label: string }> = [
  { value: 'all', label: '전체 공종' },
  { value: 'arch', label: '건축' },
  { value: 'mech', label: '기계' },
  { value: 'elec', label: '전기' },
  { value: 'renew', label: '신재생' },
];
const HOLD_OPTIONS = [
  '사유 없음',
  '기술 검토 필요',
  '설비 적용 가능 여부 확인 필요',
  '비용 영향 확인 필요',
  '법규 해석 자문 필요',
] as const;

const SECTION_META: Record<SectionKey, SectionMeta> = {
  arch: {
    label: '건축',
    icon: <Building2 className="h-4 w-4" />,
    badgeClass: 'border-sky-100 bg-sky-50 text-sky-700',
  },
  mech: {
    label: '기계',
    icon: <Wrench className="h-4 w-4" />,
    badgeClass: 'border-emerald-100 bg-emerald-50 text-emerald-700',
  },
  elec: {
    label: '전기',
    icon: <Zap className="h-4 w-4" />,
    badgeClass: 'border-violet-100 bg-violet-50 text-violet-700',
  },
  renew: {
    label: '신재생',
    icon: <Leaf className="h-4 w-4" />,
    badgeClass: 'border-amber-100 bg-amber-50 text-amber-700',
  },
};

const BOARD_META: Record<
  BoardState,
  { title: string; desc: string; boxClass: string; icon: React.ReactNode }
> = {
  backlog: {
    title: '검토 전',
    desc: '아직 판단되지 않은 항목',
    boxClass: 'border-slate-200 bg-slate-50',
    icon: <Clock3 className="h-4 w-4" />,
  },
  selected: {
    title: '채택',
    desc: '현재 설계 시나리오에 반영된 항목',
    boxClass: 'border-teal-100 bg-teal-50/60',
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
  hold: {
    title: '보류',
    desc: '추가 판단 또는 자문이 필요한 항목',
    boxClass: 'border-amber-100 bg-amber-50/60',
    icon: <MessageSquareMore className="h-4 w-4" />,
  },
};

const SEED_ITEMS: Record<BuildingScale, Record<HvacType, Item[]>> = {
  small: {
    individual: [
      {
        id: 'A1',
        section: 'arch',
        title: '외벽 평균 열관류율',
        standardValue: '0.8',
        currentValue: '0.8',
        standardScore: 27.2,
        currentScore: 27.2,
        maxScore: 34,
        boardState: 'selected',
        sourceType: '표준',
        locked: true,
        holdReason: '사유 없음',
        note: '소형·개별식 표준 모델',
      },
      {
        id: 'M1',
        section: 'mech',
        title: '난방설비 효율',
        standardValue: '0.7',
        currentValue: '0.7',
        standardScore: 4.2,
        currentScore: 4.2,
        maxScore: 6,
        boardState: 'selected',
        sourceType: '표준',
        locked: false,
        holdReason: '사유 없음',
        note: '소형·개별식 표준 모델',
      },
      {
        id: 'M17',
        section: 'mech',
        title: '개별식 보상 점수',
        standardValue: '적용',
        currentValue: '적용',
        standardScore: 2,
        currentScore: 2,
        maxScore: 2,
        boardState: 'selected',
        sourceType: '표준',
        locked: true,
        holdReason: '사유 없음',
        note: '개별식일 때만 기본 반영',
      },
      {
        id: 'E1',
        section: 'elec',
        title: '조명 밀도',
        standardValue: '0.8',
        currentValue: '0.8',
        standardScore: 6.4,
        currentScore: 6.4,
        maxScore: 8,
        boardState: 'selected',
        sourceType: '표준',
        locked: true,
        holdReason: '사유 없음',
        note: '소형 공통 항목',
      },
      {
        id: 'R4',
        section: 'renew',
        title: '조명 설비 신재생에너지 설비 적용',
        standardValue: '0.6',
        currentValue: '0.6',
        standardScore: 2.4,
        currentScore: 2.4,
        maxScore: 4,
        boardState: 'selected',
        sourceType: '표준',
        locked: false,
        holdReason: '사유 없음',
        note: '신재생 기본 반영',
      },
      {
        id: 'M6',
        section: 'mech',
        title: '열교환기 효율',
        standardValue: '0.8',
        currentValue: '0.8',
        standardScore: 2.4,
        currentScore: 2.4,
        maxScore: 3,
        boardState: 'backlog',
        sourceType: '추가',
        locked: false,
        holdReason: '사유 없음',
        note: '보완 검토용 더미 항목',
      },
      {
        id: 'E8',
        section: 'elec',
        title: 'BEMS 적용',
        standardValue: '0.7',
        currentValue: '0.7',
        standardScore: 2.1,
        currentScore: 2.1,
        maxScore: 3,
        boardState: 'backlog',
        sourceType: '추가',
        locked: false,
        holdReason: '사유 없음',
        note: '추가 채택 후보',
      },
      {
        id: 'R1',
        section: 'renew',
        title: '난방 설비 신재생에너지 설비 적용',
        standardValue: '0.6',
        currentValue: '0.6',
        standardScore: 2.4,
        currentScore: 2.4,
        maxScore: 4,
        boardState: 'hold',
        sourceType: '추가',
        locked: false,
        holdReason: '기술 검토 필요',
        note: '자문 요청 예시',
      },
      {
        id: 'M10',
        section: 'mech',
        title: '전기 제외한 냉방 에너지원 적용',
        standardValue: '0.7',
        currentValue: '0.7',
        standardScore: 0.7,
        currentScore: 0.7,
        maxScore: 1,
        boardState: 'hold',
        sourceType: '추가',
        locked: false,
        holdReason: '설비 적용 가능 여부 확인 필요',
        note: '보류 예시',
      },
    ],
    central: [
      {
        id: 'A1',
        section: 'arch',
        title: '외벽 평균 열관류율',
        standardValue: '0.8',
        currentValue: '0.8',
        standardScore: 27.2,
        currentScore: 27.2,
        maxScore: 34,
        boardState: 'selected',
        sourceType: '표준',
        locked: true,
        holdReason: '사유 없음',
        note: '소형·중앙식 표준 모델',
      },
      {
        id: 'M1',
        section: 'mech',
        title: '난방설비 효율',
        standardValue: '0.8',
        currentValue: '0.8',
        standardScore: 4.8,
        currentScore: 4.8,
        maxScore: 6,
        boardState: 'selected',
        sourceType: '표준',
        locked: true,
        holdReason: '사유 없음',
        note: '중앙식 기준 기본 적용',
      },
      {
        id: 'M2',
        section: 'mech',
        title: '냉방설비 COP',
        standardValue: '0.8',
        currentValue: '0.8',
        standardScore: 1.6,
        currentScore: 1.6,
        maxScore: 2,
        boardState: 'selected',
        sourceType: '표준',
        locked: false,
        holdReason: '사유 없음',
        note: '중앙식에서 기본 포함',
      },
      {
        id: 'E1',
        section: 'elec',
        title: '조명 밀도',
        standardValue: '0.8',
        currentValue: '0.8',
        standardScore: 6.4,
        currentScore: 6.4,
        maxScore: 8,
        boardState: 'selected',
        sourceType: '표준',
        locked: true,
        holdReason: '사유 없음',
        note: '소형 공통 항목',
      },
      {
        id: 'R4',
        section: 'renew',
        title: '조명 설비 신재생에너지 설비 적용',
        standardValue: '0.6',
        currentValue: '0.6',
        standardScore: 2.4,
        currentScore: 2.4,
        maxScore: 4,
        boardState: 'selected',
        sourceType: '표준',
        locked: false,
        holdReason: '사유 없음',
        note: '신재생 기본 반영',
      },
      {
        id: 'M6',
        section: 'mech',
        title: '열교환기 효율',
        standardValue: '0.8',
        currentValue: '0.8',
        standardScore: 2.4,
        currentScore: 2.4,
        maxScore: 3,
        boardState: 'backlog',
        sourceType: '추가',
        locked: false,
        holdReason: '사유 없음',
        note: '보완 검토용 더미 항목',
      },
      {
        id: 'R1',
        section: 'renew',
        title: '난방 설비 신재생에너지 설비 적용',
        standardValue: '0.6',
        currentValue: '0.6',
        standardScore: 2.4,
        currentScore: 2.4,
        maxScore: 4,
        boardState: 'hold',
        sourceType: '추가',
        locked: false,
        holdReason: '기술 검토 필요',
        note: '자문 요청 예시',
      },
    ],
  },
  large: {
    individual: [
      {
        id: 'A1',
        section: 'arch',
        title: '외벽 평균 열관류율',
        standardValue: '0.8',
        currentValue: '0.8',
        standardScore: 16.8,
        currentScore: 16.8,
        maxScore: 21,
        boardState: 'selected',
        sourceType: '표준',
        locked: true,
        holdReason: '사유 없음',
        note: '대형·개별식 표준 모델',
      },
      {
        id: 'A2',
        section: 'arch',
        title: '지붕 열관류율',
        standardValue: '0.8',
        currentValue: '0.8',
        standardScore: 5.6,
        currentScore: 5.6,
        maxScore: 7,
        boardState: 'selected',
        sourceType: '표준',
        locked: true,
        holdReason: '사유 없음',
        note: '대형 공통 항목',
      },
      {
        id: 'M1',
        section: 'mech',
        title: '난방설비 효율',
        standardValue: '0.7',
        currentValue: '0.7',
        standardScore: 4.2,
        currentScore: 4.2,
        maxScore: 6,
        boardState: 'selected',
        sourceType: '표준',
        locked: false,
        holdReason: '사유 없음',
        note: '개별식 기준',
      },
      {
        id: 'M17',
        section: 'mech',
        title: '개별식 보상 점수',
        standardValue: '적용',
        currentValue: '적용',
        standardScore: 2,
        currentScore: 2,
        maxScore: 2,
        boardState: 'selected',
        sourceType: '표준',
        locked: true,
        holdReason: '사유 없음',
        note: '개별식 더미 항목',
      },
      {
        id: 'E1',
        section: 'elec',
        title: '조명 밀도',
        standardValue: '0.8',
        currentValue: '0.8',
        standardScore: 7.2,
        currentScore: 7.2,
        maxScore: 9,
        boardState: 'selected',
        sourceType: '표준',
        locked: true,
        holdReason: '사유 없음',
        note: '대형 기준 반영',
      },
      {
        id: 'R1',
        section: 'renew',
        title: '난방 신재생 비율',
        standardValue: '0.6',
        currentValue: '0.6',
        standardScore: 2.4,
        currentScore: 2.4,
        maxScore: 4,
        boardState: 'hold',
        sourceType: '추가',
        locked: false,
        holdReason: '기술 검토 필요',
        note: '보류 예시',
      },
      {
        id: 'E8',
        section: 'elec',
        title: 'BEMS 적용',
        standardValue: '0.7',
        currentValue: '0.7',
        standardScore: 2.1,
        currentScore: 2.1,
        maxScore: 3,
        boardState: 'backlog',
        sourceType: '추가',
        locked: false,
        holdReason: '사유 없음',
        note: '추가 검토 예시',
      },
    ],
    central: [
      {
        id: 'A1',
        section: 'arch',
        title: '외벽 평균 열관류율',
        standardValue: '0.8',
        currentValue: '0.8',
        standardScore: 16.8,
        currentScore: 16.8,
        maxScore: 21,
        boardState: 'selected',
        sourceType: '표준',
        locked: true,
        holdReason: '사유 없음',
        note: '대형·중앙식 표준 모델',
      },
      {
        id: 'A2',
        section: 'arch',
        title: '지붕 열관류율',
        standardValue: '0.8',
        currentValue: '0.8',
        standardScore: 5.6,
        currentScore: 5.6,
        maxScore: 7,
        boardState: 'selected',
        sourceType: '표준',
        locked: true,
        holdReason: '사유 없음',
        note: '대형 공통 항목',
      },
      {
        id: 'M1',
        section: 'mech',
        title: '난방설비 효율',
        standardValue: '0.8',
        currentValue: '0.8',
        standardScore: 4.8,
        currentScore: 4.8,
        maxScore: 6,
        boardState: 'selected',
        sourceType: '표준',
        locked: true,
        holdReason: '사유 없음',
        note: '중앙식 기준',
      },
      {
        id: 'M2',
        section: 'mech',
        title: '냉방설비 COP',
        standardValue: '0.8',
        currentValue: '0.8',
        standardScore: 4.8,
        currentScore: 4.8,
        maxScore: 6,
        boardState: 'selected',
        sourceType: '표준',
        locked: false,
        holdReason: '사유 없음',
        note: '중앙식일 때 포함',
      },
      {
        id: 'E1',
        section: 'elec',
        title: '조명 밀도',
        standardValue: '0.8',
        currentValue: '0.8',
        standardScore: 7.2,
        currentScore: 7.2,
        maxScore: 9,
        boardState: 'selected',
        sourceType: '표준',
        locked: true,
        holdReason: '사유 없음',
        note: '대형 기준 반영',
      },
      {
        id: 'R4',
        section: 'renew',
        title: '조명 신재생 비율',
        standardValue: '0.6',
        currentValue: '0.6',
        standardScore: 2.4,
        currentScore: 2.4,
        maxScore: 4,
        boardState: 'selected',
        sourceType: '표준',
        locked: false,
        holdReason: '사유 없음',
        note: '신재생 기본 반영',
      },
      {
        id: 'M6',
        section: 'mech',
        title: '열교환기 효율',
        standardValue: '0.8',
        currentValue: '0.8',
        standardScore: 2.4,
        currentScore: 2.4,
        maxScore: 3,
        boardState: 'backlog',
        sourceType: '추가',
        locked: false,
        holdReason: '사유 없음',
        note: '보완 검토 예시',
      },
      {
        id: 'R1',
        section: 'renew',
        title: '난방 신재생 비율',
        standardValue: '0.6',
        currentValue: '0.6',
        standardScore: 2.4,
        currentScore: 2.4,
        maxScore: 4,
        boardState: 'hold',
        sourceType: '추가',
        locked: false,
        holdReason: '기술 검토 필요',
        note: '자문 요청 예시',
      },
    ],
  },
};

// -------------------------------------------------------
// Helpers
// -------------------------------------------------------
function cloneSeed(scale: BuildingScale, type: HvacType): Item[] {
  return SEED_ITEMS[scale][type].map((item) => ({ ...item }));
}

function cx(...tokens: Array<string | false | null | undefined>): string {
  return tokens.filter(Boolean).join(' ');
}

function formatScore(value: number) {
  return value.toFixed(1);
}

function hvacLabel(type: HvacType) {
  return type === 'central' ? '중앙식' : '개별식';
}

function parseScaleFromGfa(gfaText: string): BuildingScale {
  const numeric = Number(gfaText.replace(/[^\d.]/g, ''));
  return numeric >= 3000 ? 'large' : 'small';
}

function buildScenarioName(scale: BuildingScale, type: HvacType) {
  const scaleKo = scale === 'small' ? '소형' : '대형';
  return type === 'central' ? `${scaleKo}(중앙식) 표준 조정안` : `${scaleKo}(개별식) 표준 조정안`;
}

function calcScoreFromValue(value: ValueOption, maxScore: number, fallback: number) {
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

function getSelectedStatusBadge(item: Item): SelectedStatusBadge | null {
  if (item.boardState !== 'selected') return null;
  if (item.currentScore > item.standardScore) {
    return {
      label: '상향',
      className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    };
  }
  if (item.currentScore < item.standardScore) {
    return {
      label: '하향',
      className: 'border-amber-200 bg-amber-50 text-amber-700',
    };
  }
  return {
    label: '표준',
    className: 'border-slate-200 bg-white text-slate-600',
  };
}

function SectionBadge({ section }: { section: SectionKey }) {
  const meta = SECTION_META[section];
  return (
    <div
      className={cx(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium',
        meta.badgeClass,
      )}
    >
      {meta.icon}
      <span>{meta.label}</span>
    </div>
  );
}

function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
  disabled,
}: {
  label?: string;
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      {label ? <span className="text-sm font-medium text-slate-700">{label}</span> : null}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        disabled={disabled}
        className="flex h-10 w-full rounded-[18px] border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-teal-300 focus:ring-2 focus:ring-teal-50 disabled:cursor-not-allowed disabled:bg-slate-100"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function ItemCard({
  item,
  active,
  onSelect,
  onToggleLock,
}: {
  item: Item;
  active: boolean;
  onSelect: () => void;
  onToggleLock: () => void;
}) {
  const selectedStatusBadge = getSelectedStatusBadge(item);

  return (
    <div
      className={cx(
        'rounded-[18px] border bg-white p-3 transition hover:border-slate-300 hover:shadow-sm',
        active ? 'border-teal-300 shadow-sm ring-2 ring-teal-50' : 'border-slate-200',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <button type="button" onClick={onSelect} className="min-w-0 flex-1 text-left">
          <div className="flex flex-wrap items-center gap-2">
            <SectionBadge section={item.section} />
            {selectedStatusBadge ? (
              <span
                className={cx(
                  'inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-medium',
                  selectedStatusBadge.className,
                )}
              >
                {selectedStatusBadge.label}
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-sm font-semibold text-slate-900">{item.title}</p>
          <p className="mt-1 text-xs text-slate-500">
            표준 {item.standardValue} · 현재 {item.currentValue} · {formatScore(item.currentScore)}점
          </p>
          {item.boardState === 'hold' && item.holdReason !== '사유 없음' ? (
            <p className="mt-2 text-xs text-amber-700">{item.holdReason}</p>
          ) : null}
        </button>
        {item.boardState === 'selected' ? (
          <button
            type="button"
            onClick={onToggleLock}
            className="rounded-[18px] border border-slate-200 bg-slate-50 p-2 text-slate-600 hover:bg-slate-100"
            aria-label={item.locked ? '잠금 해제' : '잠금 설정'}
          >
            {item.locked ? <Lock className="h-4 w-4" /> : <LockOpen className="h-4 w-4" />}
          </button>
        ) : null}
      </div>
    </div>
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
  const meta = BOARD_META[state];
  return (
    <div className={cx('rounded-[22px] border p-3', meta.boxClass)}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            {meta.icon}
            <span>{meta.title}</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">{meta.desc}</p>
        </div>
        <span className="inline-flex rounded-full bg-white px-2.5 py-0.5 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
          {items.length}
        </span>
      </div>
      <div className="space-y-2">
        {items.length === 0 ? (
          <div className="rounded-[18px] border border-dashed border-slate-200 bg-white/70 px-3 py-6 text-center text-xs text-slate-500">
            표시할 항목이 없습니다.
          </div>
        ) : (
          items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              active={item.id === selectedId}
              onSelect={() => onSelect(item.id)}
              onToggleLock={() => onToggleLock(item.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function SectionSummaryCard({
  section,
  currentScore,
  standardScore,
  maxScore,
  currentCount,
  standardCount,
  totalCount,
}: {
  section: SectionKey;
  currentScore: number;
  standardScore: number;
  maxScore: number;
  currentCount: number;
  standardCount: number;
  totalCount: number;
}) {
  const meta = SECTION_META[section];
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white shadow-sm">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="inline-flex items-center gap-2">
            <div
              className={cx(
                'inline-flex h-10 w-10 items-center justify-center rounded-full border',
                meta.badgeClass,
              )}
            >
              {meta.icon}
            </div>
            <span className="text-sm font-semibold text-slate-900">{meta.label}</span>
          </div>
          <p className="text-xs font-medium text-slate-500">현황 / 표준 / 전체</p>
        </div>
        <div className="mt-5 space-y-2 text-sm text-slate-700">
          <div className="flex items-center justify-between gap-3">
            <span>점수 :</span>
            <span className="font-semibold text-slate-900">
              {formatScore(currentScore)} / {formatScore(standardScore)} / {formatScore(maxScore)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span>항목 수 :</span>
            <span className="font-semibold text-slate-900">
              {currentCount} / {standardCount} / {totalCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function PanelCard({
  title,
  children,
  className = '',
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cx('rounded-[28px] border border-slate-200 bg-white shadow-sm', className)}>
      <div className="border-b border-slate-100 px-5 pb-3 pt-5">
        <h3 className="text-[20px] font-semibold tracking-[-0.03em] text-slate-900">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// -------------------------------------------------------
// Main
// -------------------------------------------------------
export default function EPIStandardModel() {
  const initialScale = parseScaleFromGfa(PROJECT.gfa);
  const [buildingScale, setBuildingScale] = useState<BuildingScale>(initialScale);
  const [hvacType, setHvacType] = useState<HvacType>('individual');
  const [items, setItems] = useState<Item[]>(() => cloneSeed(initialScale, 'individual'));
  const [selectedId, setSelectedId] = useState<string>(
    () => SEED_ITEMS[initialScale].individual[0]?.id ?? '',
  );
  const [query, setQuery] = useState('');
  const [sectionFilter, setSectionFilter] = useState<SectionKey | 'all'>('all');
  const [scenarioName, setScenarioName] = useState(() => buildScenarioName(initialScale, 'individual'));
  const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>([]);
  const [advisoryRequests, setAdvisoryRequests] = useState<AdvisoryRequest[]>([]);
  const [toast, setToast] = useState('');

  const selectedItem = useMemo(() => items.find((item) => item.id === selectedId) ?? null, [items, selectedId]);

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return items.filter(
      (item) =>
        (sectionFilter === 'all' || item.section === sectionFilter) &&
        (normalized.length === 0 || item.title.toLowerCase().includes(normalized)),
    );
  }, [items, query, sectionFilter]);

  const columns = useMemo(
    () => ({
      backlog: filteredItems.filter((item) => item.boardState === 'backlog'),
      selected: filteredItems.filter((item) => item.boardState === 'selected'),
      hold: filteredItems.filter((item) => item.boardState === 'hold'),
    }),
    [filteredItems],
  );

  const selectedItems = useMemo(() => items.filter((item) => item.boardState === 'selected'), [items]);
  const holdItems = useMemo(() => items.filter((item) => item.boardState === 'hold'), [items]);
  const standardTotal = useMemo(
    () => items.filter((item) => item.sourceType === '표준').reduce((sum, item) => sum + item.standardScore, 0),
    [items],
  );
  const currentTotal = useMemo(
    () => selectedItems.reduce((sum, item) => sum + item.currentScore, 0),
    [selectedItems],
  );

  const sectionKpis = useMemo(() => {
    const order: SectionKey[] = ['arch', 'mech', 'elec', 'renew'];
    return order.map((section) => {
      const rows = items.filter((item) => item.section === section);
      const selected = rows.filter((item) => item.boardState === 'selected');
      const standard = rows.filter((item) => item.sourceType === '표준');
      return {
        section,
        totalCount: rows.length,
        currentCount: selected.length,
        standardCount: standard.length,
        currentScore: selected.reduce((sum, item) => sum + item.currentScore, 0),
        standardScore: standard.reduce((sum, item) => sum + item.standardScore, 0),
        maxScore: rows.reduce((sum, item) => sum + item.maxScore, 0),
      };
    });
  }, [items]);

  const resetSeed = (nextScale: BuildingScale, nextType: HvacType) => {
    const nextItems = cloneSeed(nextScale, nextType);
    setBuildingScale(nextScale);
    setHvacType(nextType);
    setItems(nextItems);
    setSelectedId(nextItems[0]?.id ?? '');
    setScenarioName(buildScenarioName(nextScale, nextType));
    setToast(
      `${nextScale === 'small' ? '소형' : '대형'} · ${hvacLabel(nextType)} 표준모델을 불러왔습니다.`,
    );
  };

  const updateItem = (id: string, updater: (item: Item) => Item) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const nextItem = updater(item);
        return { ...nextItem, sourceType: summarizeSourceType(nextItem) };
      }),
    );
  };

  const moveItem = (id: string, nextState: BoardState) => {
    const target = items.find((item) => item.id === id);
    if (!target) return;
    updateItem(id, (item) => ({
      ...item,
      boardState: nextState,
      sourceType:
        nextState === 'selected'
          ? item.currentValue === item.standardValue
            ? item.sourceType === '추가'
              ? '추가'
              : '표준'
            : '조정'
          : item.sourceType,
    }));
    setToast(`${target.title} 항목을 ${BOARD_META[nextState].title} 상태로 이동했습니다.`);
  };

  const toggleLock = (id: string) => {
    const target = items.find((item) => item.id === id);
    if (!target || target.boardState !== 'selected') return;
    updateItem(id, (item) => ({ ...item, locked: !item.locked }));
    setToast(`${target.title} 항목 ${target.locked ? '잠금 해제' : '잠금 설정'} 완료`);
  };

  const restoreStandard = () => {
    if (!selectedItem) return;
    updateItem(selectedItem.id, (item) => ({
      ...item,
      currentValue: item.standardValue,
      currentScore: item.standardScore,
      note: '표준모델 값으로 되돌림',
    }));
    setToast(`${selectedItem.title} 항목을 표준값으로 되돌렸습니다.`);
  };

  const saveScenario = () => {
    const nextName = scenarioName.trim() || buildScenarioName(buildingScale, hvacType);
    const next: SavedScenario = {
      id: String(Date.now()),
      name: nextName,
      hvacType,
      savedAt: new Date().toLocaleString('ko-KR'),
      totalScore: currentTotal,
      holdCount: holdItems.length,
      selectedCount: selectedItems.length,
    };
    setSavedScenarios((prev) => [next, ...prev]);
    setScenarioName(nextName);
    setToast('현재 시나리오를 저장했습니다.');
  };

  const createAdvisory = () => {
    if (holdItems.length === 0) return;
    const next: AdvisoryRequest = {
      id: String(Date.now()),
      createdAt: new Date().toLocaleString('ko-KR'),
      hvacLabel: hvacLabel(hvacType),
      score: currentTotal,
      itemTitles: holdItems.map((item) => item.title),
    };
    setAdvisoryRequests((prev) => [next, ...prev]);
    setToast('보류 항목 자문 요청 초안을 생성했습니다.');
  };

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-4">
      <div className="inline-flex rounded-md bg-slate-950 px-3 py-1 text-sm font-semibold text-white">
        EPI
      </div>

      {toast ? (
        <div className="rounded-[18px] border border-teal-100 bg-teal-50 px-4 py-3 text-sm text-teal-800">
          {toast}
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[1.6fr_5fr_2.4fr]">
        {/* 좌측: 개요 · 설비 · 공종별 요약 */}
        <div className="space-y-4">
          <div className="rounded-[24px] border-2 border-slate-300 bg-slate-50 p-4">
            <div className="mb-4 text-center text-[24px] font-semibold text-slate-900">{PROJECT.name}</div>

            <div className="mb-4 space-y-2 rounded-[16px] border-2 border-slate-300 bg-white p-4 text-sm">
              <div>지역 : {PROJECT.region}</div>
              <div>용도 : {PROJECT.usage}</div>
              <div>연면적 : {PROJECT.gfa}</div>
              <div>층 수 : {PROJECT.floors}</div>
              <div>
                표준 모델 : {buildingScale === 'small' ? '소형' : '대형'} · {hvacLabel(hvacType)}
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex h-[110px] flex-1 flex-col justify-center rounded-[16px] border-2 border-slate-300 bg-white p-3 text-center">
                <p className="text-xs text-slate-600">현황</p>
                <p className="mt-1 text-base font-semibold">{formatScore(currentTotal)} 점</p>
              </div>
              <div className="flex h-[110px] flex-1 flex-col justify-center rounded-[16px] border-2 border-slate-300 bg-white p-3 text-center">
                <p className="text-xs text-slate-600">표준</p>
                <p className="mt-1 text-base font-semibold">{formatScore(standardTotal)} 점</p>
              </div>
              <div className="flex h-[110px] flex-1 flex-col justify-center rounded-[16px] border-2 border-slate-300 bg-white p-3 text-center">
                <p className="text-xs text-slate-600">보류 항목</p>
                <p className="mt-1 text-base font-semibold">{holdItems.length} 건</p>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white shadow-sm">
            <div className="p-3">
              <SelectField
                label="설비 방식"
                value={hvacType}
                options={HVAC_OPTIONS}
                onChange={(value) => resetSeed(buildingScale, value)}
              />
            </div>
          </div>

          {sectionKpis.map((kpi) => (
            <SectionSummaryCard
              key={kpi.section}
              section={kpi.section}
              currentScore={kpi.currentScore}
              standardScore={kpi.standardScore}
              maxScore={kpi.maxScore}
              currentCount={kpi.currentCount}
              standardCount={kpi.standardCount}
              totalCount={kpi.totalCount}
            />
          ))}
        </div>

        {/* 중앙: 칸반 */}
        <PanelCard title="칸반 보드" className="min-h-[1180px] xl:min-h-0">
          <div className="space-y-4">
            <div className="flex flex-col gap-2 xl:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="항목 검색"
                  className="h-10 w-full rounded-[18px] border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-teal-300 focus:ring-2 focus:ring-teal-50"
                />
              </div>
              <div className="xl:w-[170px]">
                <SelectField value={sectionFilter} options={SECTION_FILTER_OPTIONS} onChange={setSectionFilter} />
              </div>
              <button
                type="button"
                className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-[18px] border border-slate-200 bg-white px-4 text-sm text-slate-700 transition hover:bg-slate-50"
                onClick={() => resetSeed(buildingScale, hvacType)}
              >
                <RotateCcw className="h-4 w-4" />
                초기화
              </button>
            </div>

            <div className="grid gap-3 xl:grid-cols-3">
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
        </PanelCard>

        {/* 우측: 편집 + 실행 */}
        <div className="grid gap-4 xl:grid-rows-[minmax(0,1fr)_auto]">
          <PanelCard title="선택 항목 편집" className="min-h-[520px] xl:min-h-[800px]">
            <div className="space-y-4">
              {selectedItem ? (
                <>
                  <div className="flex items-start justify-between gap-3 rounded-[18px] border border-slate-200 bg-slate-50 p-4">
                    <div>
                      <SectionBadge section={selectedItem.section} />
                      <p className="mt-2 text-sm font-semibold text-slate-900">{selectedItem.title}</p>
                      <p className="mt-1 text-xs text-slate-500">최대 배점 {formatScore(selectedItem.maxScore)}점</p>
                    </div>
                    {selectedItem.boardState === 'selected' ? (
                      <span className="inline-flex rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-xs text-slate-700">
                        {selectedItem.locked ? '잠금' : '편집 가능'}
                      </span>
                    ) : null}
                  </div>

                  <div className="grid gap-2 sm:grid-cols-3">
                    <div className="rounded-[18px] border border-slate-200 p-4">
                      <p className="text-xs text-slate-500">표준값</p>
                      <p className="mt-2 text-lg font-semibold text-slate-900">{selectedItem.standardValue}</p>
                      <p className="mt-1 text-xs text-slate-500">{formatScore(selectedItem.standardScore)}점</p>
                    </div>
                    <div className="rounded-[18px] border border-slate-200 p-4">
                      <p className="text-xs text-slate-500">현재값</p>
                      <p className="mt-2 text-lg font-semibold text-slate-900">{selectedItem.currentValue}</p>
                      <p className="mt-1 text-xs text-slate-500">{formatScore(selectedItem.currentScore)}점</p>
                    </div>
                    <div className="rounded-[18px] border border-slate-200 p-4">
                      <p className="text-xs text-slate-500">변화</p>
                      <p className="mt-2 text-lg font-semibold text-slate-900">
                        {formatScore(selectedItem.currentScore - selectedItem.standardScore)}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {selectedItem.currentValue === selectedItem.standardValue ? '표준 유지' : '조정 반영'}
                      </p>
                    </div>
                  </div>

                  <SelectField
                    label="현재값"
                    value={selectedItem.currentValue}
                    options={VALUE_OPTIONS.map((v) => ({ value: v, label: v }))}
                    onChange={(value) =>
                      updateItem(selectedItem.id, (item) => ({
                        ...item,
                        currentValue: value,
                        currentScore: calcScoreFromValue(value, item.maxScore, item.currentScore),
                      }))
                    }
                    disabled={selectedItem.locked}
                  />

                  <div className="space-y-2 rounded-[18px] border border-slate-200 p-4">
                    <span className="text-sm font-medium text-slate-700">Editor 메모</span>
                    <textarea
                      value={selectedItem.note}
                      onChange={(event) =>
                        updateItem(selectedItem.id, (item) => ({ ...item, note: event.target.value }))
                      }
                      className="min-h-[220px] w-full resize-none rounded-[18px] border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-300 focus:ring-2 focus:ring-teal-50"
                      placeholder="설계 메모 또는 협의 포인트를 입력"
                      disabled={selectedItem.locked}
                    />
                  </div>

                  <SelectField
                    label="보류 사유"
                    value={selectedItem.holdReason}
                    options={HOLD_OPTIONS.map((v) => ({ value: v, label: v }))}
                    onChange={(value) => updateItem(selectedItem.id, (item) => ({ ...item, holdReason: value }))}
                  />

                  <div className="grid gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      className="h-10 rounded-[18px] bg-slate-950 text-sm font-medium text-white hover:bg-slate-900"
                      onClick={() => moveItem(selectedItem.id, 'selected')}
                    >
                      채택으로 반영
                    </button>
                    <button
                      type="button"
                      className="h-10 rounded-[18px] border border-slate-200 text-sm text-slate-700 hover:bg-slate-50"
                      onClick={() => moveItem(selectedItem.id, 'hold')}
                    >
                      보류로 이동
                    </button>
                    <button
                      type="button"
                      className="h-10 rounded-[18px] border border-slate-200 text-sm text-slate-700 hover:bg-slate-50"
                      onClick={() => moveItem(selectedItem.id, 'backlog')}
                    >
                      검토 전으로 이동
                    </button>
                    <button
                      type="button"
                      className="h-10 rounded-[18px] border border-slate-200 text-sm text-slate-700 hover:bg-slate-50"
                      onClick={restoreStandard}
                    >
                      표준값으로 되돌리기
                    </button>
                  </div>
                </>
              ) : (
                <div className="rounded-[18px] border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
                  편집할 항목을 선택하세요.
                </div>
              )}
            </div>
          </PanelCard>

          <PanelCard title="판단 결과 → 실행" className="min-h-[420px]">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-[18px] border border-slate-200 p-3 text-center">
                  <p className="text-xs text-slate-500">채택</p>
                  <p className="mt-1 text-base font-semibold text-slate-900">{selectedItems.length}건</p>
                </div>
                <div className="rounded-[18px] border border-slate-200 p-3 text-center">
                  <p className="text-xs text-slate-500">보류</p>
                  <p className="mt-1 text-base font-semibold text-slate-900">{holdItems.length}건</p>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-sm font-medium text-slate-700">시나리오 이름</span>
                <input
                  value={scenarioName}
                  onChange={(event) => setScenarioName(event.target.value)}
                  className="h-10 w-full rounded-[18px] border border-slate-200 bg-white px-3 text-sm outline-none focus:border-teal-300 focus:ring-2 focus:ring-teal-50"
                  placeholder="시나리오 이름 입력"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className="flex h-10 items-center justify-center gap-2 rounded-[18px] bg-slate-950 text-sm font-medium text-white hover:bg-slate-900"
                  onClick={saveScenario}
                >
                  <Save className="h-4 w-4" />
                  시나리오 저장
                </button>
                <button
                  type="button"
                  className="flex h-10 items-center justify-center gap-2 rounded-[18px] border border-slate-200 bg-white text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={createAdvisory}
                  disabled={holdItems.length === 0}
                >
                  <MessageSquareMore className="h-4 w-4" />
                  자문 요청
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-[18px] border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900">저장</p>
                    <span className="inline-flex rounded-full bg-white px-2 py-0.5 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
                      {savedScenarios.length}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-slate-500">
                    {savedScenarios[0] ? savedScenarios[0].name : '저장된 시나리오 없음'}
                  </div>
                </div>
                <div className="rounded-[18px] border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900">자문</p>
                    <span className="inline-flex rounded-full bg-white px-2 py-0.5 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
                      {advisoryRequests.length}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-slate-500">
                    {advisoryRequests[0]
                      ? `${advisoryRequests[0].hvacLabel} 요청 초안`
                      : '생성된 요청 없음'}
                  </div>
                </div>
              </div>
            </div>
          </PanelCard>
        </div>
      </div>

      <p className="text-center text-[10px] text-slate-400">
        * 본 화면은 UI 프리뷰용이며, 실제 EPI 산정·법규 로직과는 무관합니다.
      </p>
    </div>
  );
}
