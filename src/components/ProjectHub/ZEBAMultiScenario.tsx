'use client';

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Trash2,
  Wand2,
  CheckCircle2,
  AlertTriangle,
  Layers,
  SlidersHorizontal,
} from 'lucide-react';
import { Bar, Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ScatterController,
} from 'chart.js';
import type { TooltipItem } from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ScatterController,
);

// -------------------------------------------------------
// Types
// -------------------------------------------------------
type ScenarioId = 'A' | 'B' | 'C';

type Spec = {
  passive: { wallU: number; windowU: number; roofU: number; floorU: number };
  active: { ehpCOP: number; ventilationEff: number; lightingLPD: number; boilerEff: number };
  renewable: { pvArea: number; pvEff: number; fuelCellKW: number };
};

type Result = {
  zebGrade: number;
  selfSuff: number;
  prod: number;
  demand: number;
  costTotal: number;
  costBreakdown: { passive: number; active: number; renewable: number };
};

type Scenario = {
  id: ScenarioId;
  name: string;
  isStandard: boolean;
  spec: Spec;
  result: Result;
  updatedAt: string;
};

// -------------------------------------------------------
// Helpers
// -------------------------------------------------------
function fmt(num: number) {
  return new Intl.NumberFormat('ko-KR').format(Math.round(num));
}

function fmtPct(num: number, d = 1) {
  return `${num.toFixed(d)}%`;
}

function gradeBadge(grade: number): { label: string; bg: string } {
  const map: Record<number, { label: string; bg: string }> = {
    1: { label: '1등급', bg: '#059669' },
    2: { label: '2등급', bg: '#0f766e' },
    3: { label: '3등급', bg: '#0284c7' },
    4: { label: '4등급', bg: '#d97706' },
    5: { label: '5등급', bg: '#e11d48' },
  };
  return map[grade] ?? { label: `${grade}등급`, bg: '#64748b' };
}

function computeResultFromSpec(spec: Spec): Result {
  const passiveScore =
    (0.35 / spec.passive.wallU) * 0.6 +
    (0.35 / spec.passive.windowU) * 0.2 +
    (0.35 / spec.passive.roofU) * 0.1 +
    (0.35 / spec.passive.floorU) * 0.1;

  const activeScore =
    (spec.active.ehpCOP / 3.2) * 0.45 +
    (spec.active.ventilationEff / 60) * 0.25 +
    (6.3 / spec.active.lightingLPD) * 0.2 +
    (spec.active.boilerEff / 88) * 0.1;

  const demand = Math.max(35, 130 / (0.9 * passiveScore + 0.8 * activeScore));
  const prod =
    Math.max(0, spec.renewable.pvArea) * (spec.renewable.pvEff / 100) * 4.8 +
    spec.renewable.fuelCellKW * 7.5;
  const selfSuff = Math.min(99.9, (prod / demand) * 100);

  let zebGrade = 5;
  if (selfSuff >= 80) zebGrade = 1;
  else if (selfSuff >= 60) zebGrade = 2;
  else if (selfSuff >= 45) zebGrade = 3;
  else if (selfSuff >= 30) zebGrade = 4;

  const costPassive =
    250000 +
    (0.25 / spec.passive.wallU) * 45000 +
    (0.25 / spec.passive.windowU) * 35000 +
    (0.25 / spec.passive.roofU) * 15000 +
    (0.25 / spec.passive.floorU) * 15000;
  const costActive =
    120000 +
    (spec.active.ehpCOP - 3.0) * 25000 +
    (spec.active.ventilationEff - 50) * 1200 +
    (6.3 - spec.active.lightingLPD) * 15000 +
    (spec.active.boilerEff - 88) * 1200;
  const costRenew = spec.renewable.pvArea * 750 + spec.renewable.fuelCellKW * 3200;
  const costTotal = Math.max(0, costPassive + costActive + costRenew);

  return {
    zebGrade,
    selfSuff,
    prod,
    demand,
    costTotal,
    costBreakdown: { passive: costPassive, active: costActive, renewable: costRenew },
  };
}

function nowStamp() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function defaultScenarioName(id: ScenarioId, isStandard = false): string {
  if (isStandard) return '표준 모델';
  if (id === 'B') return '대안 1';
  return '대안 2';
}

function makeScenario(id: ScenarioId, isStandard = false): Scenario {
  const spec: Spec = {
    passive: { wallU: 0.24, windowU: 0.24, roofU: 0.24, floorU: 0.24 },
    active: { ehpCOP: 3.6, ventilationEff: 70, lightingLPD: 5.0, boilerEff: 88 },
    renewable: { pvArea: 160, pvEff: 18, fuelCellKW: 0 },
  };
  return {
    id,
    name: defaultScenarioName(id, isStandard),
    isStandard,
    spec,
    result: computeResultFromSpec(spec),
    updatedAt: nowStamp(),
  };
}

// -------------------------------------------------------
// Sub-components
// -------------------------------------------------------
function GradePill({ grade }: { grade: number }) {
  const { label, bg } = gradeBadge(grade);
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold text-white"
      style={{ backgroundColor: bg }}
    >
      ZEB {label}
    </span>
  );
}

function MiniSlider({
  label,
  min,
  max,
  step,
  value,
  unit,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  unit?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-slate-700">{label}</span>
        <span className="text-xs font-semibold text-slate-900">
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-teal-700"
      />
      <div className="mt-1 flex justify-between text-[10px] text-slate-400">
        <span>
          {min}
          {unit}
        </span>
        <span>
          {max}
          {unit}
        </span>
      </div>
    </div>
  );
}

type PassiveKey = keyof Spec['passive'];
type ActiveKey = keyof Spec['active'];
type RenewableKey = keyof Spec['renewable'];

function ScenarioCard({
  s,
  onRemove,
  onUpdate,
  onAnalyze,
}: {
  s: Scenario;
  onRemove: () => void;
  onUpdate: (patch: Partial<Spec>) => void;
  onAnalyze: () => void;
}) {
  const [tab, setTab] = useState<'passive' | 'active' | 'renew'>('passive');

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="min-w-0 w-full rounded-3xl border border-slate-200 bg-white shadow-sm"
    >
      {/* header */}
      <div className="flex items-start justify-between border-b border-slate-100 p-4">
        <div>
          <div className="text-sm font-semibold text-slate-900">{s.name}</div>
          <div className="text-xs text-slate-500">
            표준모델 기반 편집 · {s.id}
          </div>
        </div>
        {!s.isStandard && (
          <button
            onClick={onRemove}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition hover:border-rose-300 hover:text-rose-500"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="space-y-4 p-4">
        {/* kpi row */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
            <div className="mb-1 text-[10px] text-slate-500">ZEB 등급</div>
            <div className="flex items-center justify-between">
              <GradePill grade={s.result.zebGrade} />
              <span className="text-xs font-semibold text-slate-800">
                {fmtPct(s.result.selfSuff)}
              </span>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
            <div className="mb-1 text-[10px] text-slate-500">총 시공비</div>
            <div className="text-base font-bold text-slate-900">{fmt(s.result.costTotal)}</div>
            <div className="text-[10px] text-slate-400">만원</div>
          </div>
        </div>

        {/* tab bar */}
        <div className="flex rounded-2xl bg-slate-100 p-1 text-xs font-medium">
          {(['passive', 'active', 'renew'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-xl py-1.5 transition ${
                tab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t === 'passive' ? '패시브' : t === 'active' ? '액티브' : '신재생'}
            </button>
          ))}
        </div>

        {/* tab content */}
        {tab === 'passive' && (
          <div className="space-y-2">
            {(
              [
                { key: 'wallU' as PassiveKey, label: '외벽 열관류율', min: 0.12, max: 0.35, step: 0.01 },
                { key: 'windowU' as PassiveKey, label: '창호 열관류율', min: 0.12, max: 0.35, step: 0.01 },
                { key: 'roofU' as PassiveKey, label: '지붕 열관류율', min: 0.1, max: 0.3, step: 0.01 },
                { key: 'floorU' as PassiveKey, label: '바닥 열관류율', min: 0.1, max: 0.3, step: 0.01 },
              ] as { key: PassiveKey; label: string; min: number; max: number; step: number }[]
            ).map(({ key, label, min, max, step }) => (
              <MiniSlider
                key={key}
                label={label}
                min={min}
                max={max}
                step={step}
                value={s.spec.passive[key]}
                onChange={(v) => onUpdate({ passive: { [key]: v } as Spec['passive'] })}
              />
            ))}
          </div>
        )}

        {tab === 'active' && (
          <div className="space-y-2">
            {(
              [
                { key: 'ehpCOP' as ActiveKey, label: 'EHP COP', min: 2.8, max: 5.0, step: 0.1 },
                { key: 'ventilationEff' as ActiveKey, label: '전열교환 효율', min: 40, max: 85, step: 1, unit: '%' },
                { key: 'lightingLPD' as ActiveKey, label: '조명밀도 (LPD)', min: 3.0, max: 8.0, step: 0.1 },
                { key: 'boilerEff' as ActiveKey, label: '보일러 효율', min: 80, max: 98, step: 1, unit: '%' },
              ] as { key: ActiveKey; label: string; min: number; max: number; step: number; unit?: string }[]
            ).map(({ key, label, min, max, step, unit }) => (
              <MiniSlider
                key={key}
                label={label}
                min={min}
                max={max}
                step={step}
                value={s.spec.active[key]}
                unit={unit}
                onChange={(v) => onUpdate({ active: { [key]: v } as Spec['active'] })}
              />
            ))}
          </div>
        )}

        {tab === 'renew' && (
          <div className="space-y-2">
            {(
              [
                { key: 'pvArea' as RenewableKey, label: '태양광 면적', min: 0, max: 500, step: 10, unit: 'm²' },
                { key: 'pvEff' as RenewableKey, label: '태양광 효율', min: 12, max: 24, step: 1, unit: '%' },
                { key: 'fuelCellKW' as RenewableKey, label: '연료전지 용량', min: 0, max: 150, step: 10, unit: 'kW' },
              ] as { key: RenewableKey; label: string; min: number; max: number; step: number; unit?: string }[]
            ).map(({ key, label, min, max, step, unit }) => (
              <MiniSlider
                key={key}
                label={label}
                min={min}
                max={max}
                step={step}
                value={s.spec.renewable[key]}
                unit={unit}
                onChange={(v) => onUpdate({ renewable: { [key]: v } as Spec['renewable'] })}
              />
            ))}
          </div>
        )}

        <button
          onClick={onAnalyze}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-2xl bg-teal-700 text-sm font-semibold text-white transition hover:bg-teal-800"
        >
          <Wand2 className="h-4 w-4" />
          분석 업데이트
        </button>
      </div>
    </motion.div>
  );
}

const TEAL = '#0f766e';

function ComparisonChart({ scenarios }: { scenarios: Scenario[] }) {
  const data = useMemo(
    () => ({
      labels: scenarios.map((s) => s.name),
      datasets: [
        {
          label: '자립률',
          data: scenarios.map((s) => Number(s.result.selfSuff.toFixed(1))),
          backgroundColor: '#22c55e',
          borderRadius: 8,
          yAxisID: 'y',
        },
        {
          label: '시공비',
          data: scenarios.map((s) => Number(s.result.costTotal.toFixed(0))),
          backgroundColor: TEAL,
          borderRadius: 8,
          yAxisID: 'y1',
        },
      ],
    }),
    [scenarios],
  );

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index' as const, intersect: false },
      plugins: {
        legend: { position: 'bottom' as const },
        tooltip: {
          callbacks: {
            label(tooltipItem: TooltipItem<'bar'>) {
              const label = tooltipItem.dataset.label ?? '';
              const y = tooltipItem.parsed.y;
              if (y == null) return '';
              if (label === '자립률') return `${label}: ${y.toFixed(1)}%`;
              return `${label}: ${fmt(y)}`;
            },
          },
        },
      },
      scales: {
        x: { grid: { display: false } },
        y: {
          type: 'linear' as const,
          display: true,
          position: 'left' as const,
          beginAtZero: true,
          max: 100,
          title: { display: true, text: '자립률(%)' },
        },
        y1: {
          type: 'linear' as const,
          display: true,
          position: 'right' as const,
          beginAtZero: true,
          grid: { drawOnChartArea: false },
          title: { display: true, text: '시공비(만원)' },
          ticks: {
            callback: (value: string | number) => fmt(Number(value)),
          },
        },
      },
    }),
    [],
  );

  if (scenarios.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Layers className="h-4 w-4 text-teal-700" />
            자립률 및 시공비 (시나리오 비교)
          </div>
          <div className="mt-0.5 text-xs text-slate-500">비교할 시나리오가 아직 없습니다.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Layers className="h-4 w-4 text-teal-700" />
          자립률 및 시공비 (시나리오 비교)
        </div>
        <div className="mt-0.5 text-xs text-slate-500">
          각 시나리오의 자립률과 총 시공비를 동일 화면에서 병렬 비교합니다.
        </div>
      </div>
      <div className="p-4" style={{ height: 320 }}>
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}

function CostPositionChart({ scenarios }: { scenarios: Scenario[] }) {
  const data = useMemo(
    () => ({
      datasets: [
        {
          label: '시나리오',
          data: scenarios.map((s) => ({
            x: Number(s.result.costTotal.toFixed(0)),
            y: Number(s.result.selfSuff.toFixed(1)),
            label: s.name,
            id: s.id,
          })),
          backgroundColor: TEAL,
          pointRadius: 9,
          pointHoverRadius: 11,
        },
      ],
    }),
    [scenarios],
  );

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title(items: TooltipItem<'scatter'>[]) {
              const raw = items[0]?.raw as { label?: string; id?: string } | undefined;
              if (!raw?.label) return '';
              return `${raw.label} (${raw.id ?? ''})`;
            },
            label(tooltipItem: TooltipItem<'scatter'>) {
              const x = tooltipItem.parsed.x;
              const y = tooltipItem.parsed.y;
              if (x == null || y == null) return '';
              return [`시공비: ${fmt(x)}`, `자립률: ${fmtPct(y)}`];
            },
          },
        },
      },
      scales: {
        x: {
          type: 'linear' as const,
          position: 'bottom' as const,
          title: { display: true, text: '시공비(만원)' },
          ticks: {
            callback: (value: string | number) => fmt(Number(value)),
          },
        },
        y: {
          type: 'linear' as const,
          min: 0,
          max: 100,
          title: { display: true, text: '자립률(%)' },
        },
      },
    }),
    [],
  );

  if (scenarios.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-4">
          <div className="text-sm font-semibold text-slate-900">비용-자립률 위상</div>
          <div className="mt-0.5 text-xs text-slate-500">비교할 시나리오가 아직 없습니다.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-4">
        <div className="text-sm font-semibold text-slate-900">비용-자립률 위상</div>
        <div className="mt-0.5 text-xs text-slate-500">
          x축은 시공비, y축은 자립률로 각 시나리오의 위치를 비교합니다.
        </div>
      </div>
      <div className="p-4" style={{ height: 320 }}>
        <Scatter data={data} options={options} />
      </div>
    </div>
  );
}

function tradeoffGridCols(n: number) {
  return { gridTemplateColumns: `minmax(140px, 220px) repeat(${n}, minmax(0, 1fr))` } as const;
}

function TradeoffRow({ label, cells }: { label: string; cells: React.ReactNode[] }) {
  const n = cells.length;
  return (
    <div
      className="grid gap-2 rounded-2xl border border-slate-200 bg-white p-3 text-sm shadow-sm"
      style={tradeoffGridCols(n)}
    >
      <div className="font-medium text-slate-700">{label}</div>
      {cells.map((cell, i) => (
        <div key={i} className="text-center font-semibold text-slate-900">
          {cell ?? '-'}
        </div>
      ))}
    </div>
  );
}

type DetailRow = { key: string; label: string; unit?: string };

function DetailsTable({
  rows,
  scenarios,
  getValue,
}: {
  rows: DetailRow[];
  scenarios: Scenario[];
  getValue: (s: Scenario, k: string) => number;
}) {
  const n = scenarios.length;
  const cols = tradeoffGridCols(n);
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[min(100%,720px)] space-y-2">
        <div
          className="grid gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600"
          style={cols}
        >
          <div>항목</div>
          {scenarios.map((s) => (
            <div key={s.id} className="text-center">
              {s.name}
            </div>
          ))}
        </div>
        {rows.map((r) => (
          <div
            key={r.key}
            className="grid gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
            style={cols}
          >
            <div className="text-slate-700">
              {r.label}
              {r.unit && <span className="ml-1 text-[10px] text-slate-400">({r.unit})</span>}
            </div>
            {scenarios.map((s) => (
              <div key={s.id} className="text-center font-semibold text-slate-900">
                {getValue(s, r.key).toFixed(2)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function AccordionSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition"
      >
        {title}
        <span
          className="text-slate-400 transition-transform"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          ▾
        </span>
      </button>
      {open && <div className="border-t border-slate-100 p-4">{children}</div>}
    </div>
  );
}

// -------------------------------------------------------
// Main component
// -------------------------------------------------------
export default function ZEBAMultiScenario() {
  const [compareMode, setCompareMode] = useState(true);
  const [baseline, setBaseline] = useState<ScenarioId>('A');
  const [selected, setSelected] = useState<ScenarioId>('A');
  const [scenarios, setScenarios] = useState<Scenario[]>([makeScenario('A', true)]);

  const maxScenario = 3;

  const ordered = useMemo(() => {
    const order: ScenarioId[] = ['A', 'B', 'C'];
    return order
      .map((id) => scenarios.find((s) => s.id === id))
      .filter(Boolean) as Scenario[];
  }, [scenarios]);

  const addScenario = () => {
    const ids: ScenarioId[] = ['A', 'B', 'C'];
    const used = new Set(scenarios.map((s) => s.id));
    const next = ids.find((id) => !used.has(id));
    if (!next) return;
    setScenarios((prev) => [...prev, makeScenario(next, false)]);
  };

  const removeScenario = (id: ScenarioId) => {
    if (id === 'A') return;
    setScenarios((prev) => prev.filter((s) => s.id !== id));
    if (baseline === id) setBaseline('A');
    if (selected === id) setSelected('A');
  };

  const updateSpec = (id: ScenarioId, patch: Partial<Spec>) => {
    setScenarios((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const spec: Spec = {
          passive: { ...s.spec.passive, ...(patch.passive ?? {}) },
          active: { ...s.spec.active, ...(patch.active ?? {}) },
          renewable: { ...s.spec.renewable, ...(patch.renewable ?? {}) },
        };
        return { ...s, spec };
      }),
    );
  };

  const analyzeScenario = (id: ScenarioId) => {
    setScenarios((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        return { ...s, result: computeResultFromSpec(s.spec), updatedAt: nowStamp() };
      }),
    );
  };

  const analyzeAll = () => {
    setScenarios((prev) =>
      prev.map((s) => ({ ...s, result: computeResultFromSpec(s.spec), updatedAt: nowStamp() })),
    );
  };

  const baselineCost =
    scenarios.find((s) => s.id === baseline)?.result.costTotal ?? 0;

  const costSummary = useMemo(
    () =>
      ordered.map((s) => ({
        id: s.id,
        deltaPct:
          baselineCost > 0 ? ((s.result.costTotal - baselineCost) / baselineCost) * 100 : 0,
      })),
    [ordered, baselineCost],
  );

  const statusChip = useMemo(() => {
    const targetGrade = 4;
    const ok = ordered.every((s) => s.result.zebGrade <= targetGrade);
    return ok
      ? { icon: <CheckCircle2 className="h-3.5 w-3.5" />, text: `목표(${targetGrade}등급) 만족`, cls: 'bg-emerald-600' }
      : {
          icon: <AlertTriangle className="h-3.5 w-3.5" />,
          text: `목표(${targetGrade}등급) 미달 시나리오 존재`,
          cls: 'bg-rose-500',
        };
  }, [ordered]);

  return (
    <div className="mx-auto w-full max-w-[1480px] space-y-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="rounded-2xl bg-teal-50 p-2 text-teal-800">
                <SlidersHorizontal className="h-5 w-5" />
              </div>
              <h2 className="text-base font-bold text-slate-900">
                3단계 · 성능 조합 (다중 시나리오)
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              2단계 표준모델을 기준으로 최대 3개의 시나리오를 만들고, 결과를 병렬 비교합니다.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-white ${statusChip.cls}`}
            >
              {statusChip.icon}
              {statusChip.text}
            </span>
            <label className="flex cursor-pointer items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
              비교 모드
              <button
                role="switch"
                aria-checked={compareMode}
                onClick={() => setCompareMode((v) => !v)}
                className={`relative h-5 w-9 rounded-full transition-colors ${
                  compareMode ? 'bg-teal-700' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                    compareMode ? 'translate-x-4' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </label>
          </div>
        </div>

        <div className="my-4 border-t border-slate-100" />

        <div className="flex flex-wrap items-center justify-end gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={analyzeAll}
              className="flex h-9 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 transition hover:border-teal-400 hover:text-teal-700"
            >
              <Wand2 className="h-3.5 w-3.5" />
              전체 분석 업데이트
            </button>
            <button
              disabled={scenarios.length >= maxScenario}
              onClick={addScenario}
              className="flex h-9 items-center gap-2 rounded-2xl bg-teal-700 px-4 text-xs font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus className="h-3.5 w-3.5" />
              시나리오 추가 ({scenarios.length}/{maxScenario})
            </button>
          </div>
        </div>
      </motion.div>

      {/* 시나리오: 고정 3열 그리드 — 추가 시 왼쪽(A)→B→C 순으로 채움 */}
      <div className="grid w-full grid-cols-1 gap-4 *:min-w-0 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
        <AnimatePresence mode="popLayout">
          {ordered.map((s) => (
            <ScenarioCard
              key={s.id}
              s={s}
              onRemove={() => removeScenario(s.id)}
              onUpdate={(patch) => updateSpec(s.id, patch)}
              onAnalyze={() => analyzeScenario(s.id)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Comparison section */}
      <AnimatePresence>
        {compareMode && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="space-y-4"
          >
            {/* 차트: 자립률·시공비 막대 + 비용-자립률 산점 */}
            <div className="grid gap-4 lg:grid-cols-2">
              <ComparisonChart scenarios={ordered} />
              <CostPositionChart scenarios={ordered} />
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">비용 트레이드오프</div>
                    <div className="mt-0.5 text-xs text-slate-500">
                      기준 시나리오 대비 시공비와 자립률을 함께 비교합니다.
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-slate-500">기준 모델</span>
                    <select
                      value={baseline}
                      onChange={(e) => setBaseline(e.target.value as ScenarioId)}
                      className="h-9 min-w-[180px] rounded-full border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      {ordered.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.id})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="space-y-2 overflow-x-auto p-4">
                <div className="min-w-[min(100%,720px)] space-y-2">
                  <div
                    className="grid gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600"
                    style={tradeoffGridCols(ordered.length)}
                  >
                    <div>항목</div>
                    {ordered.map((s) => (
                      <div key={s.id} className="text-center">
                        {s.name}
                      </div>
                    ))}
                  </div>
                  <TradeoffRow
                    label="총 시공비(만원)"
                    cells={ordered.map((s) => fmt(s.result.costTotal))}
                  />
                  <TradeoffRow
                    label="기준 대비(%)"
                    cells={ordered.map((s) => {
                      const entry = costSummary.find((x) => x.id === s.id);
                      if (!entry) return '-';
                      return baseline === s.id ? '0.0%' : `${entry.deltaPct.toFixed(1)}%`;
                    })}
                  />
                  <TradeoffRow
                    label="자립률(%)"
                    cells={ordered.map((s) => fmtPct(s.result.selfSuff))}
                  />
                  <TradeoffRow
                    label="ZEB 등급"
                    cells={ordered.map((s) => `ZEB ${s.result.zebGrade}`)}
                  />
                </div>
              </div>
            </div>

            {/* Detail specs */}
            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 p-4">
                <div className="text-sm font-semibold text-slate-900">상세 비교</div>
                <div className="mt-0.5 text-xs text-slate-500">
                  패시브/액티브/신재생 스펙을 열(column)로 비교합니다.
                </div>
              </div>
              <div className="space-y-3 p-4">
                <AccordionSection title="패시브">
                  <DetailsTable
                    rows={[
                      { key: 'wallU', label: '외벽 열관류율', unit: 'W/m²K' },
                      { key: 'windowU', label: '창호 열관류율', unit: 'W/m²K' },
                      { key: 'roofU', label: '지붕 열관류율', unit: 'W/m²K' },
                      { key: 'floorU', label: '바닥 열관류율', unit: 'W/m²K' },
                    ]}
                    scenarios={ordered}
                    getValue={(s, k) => (s.spec.passive as Record<string, number>)[k]}
                  />
                </AccordionSection>
                <AccordionSection title="액티브">
                  <DetailsTable
                    rows={[
                      { key: 'ehpCOP', label: 'EHP COP' },
                      { key: 'ventilationEff', label: '전열교환 효율', unit: '%' },
                      { key: 'lightingLPD', label: '조명밀도 (LPD)', unit: 'W/m²' },
                      { key: 'boilerEff', label: '보일러 효율', unit: '%' },
                    ]}
                    scenarios={ordered}
                    getValue={(s, k) => (s.spec.active as Record<string, number>)[k]}
                  />
                </AccordionSection>
                <AccordionSection title="신재생">
                  <DetailsTable
                    rows={[
                      { key: 'pvArea', label: '태양광 면적', unit: 'm²' },
                      { key: 'pvEff', label: '태양광 효율', unit: '%' },
                      { key: 'fuelCellKW', label: '연료전지 용량', unit: 'kW' },
                    ]}
                    scenarios={ordered}
                    getValue={(s, k) => (s.spec.renewable as Record<string, number>)[k]}
                  />
                </AccordionSection>
              </div>
            </div>

            {/* Final selection */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <div>
                <div className="text-sm font-semibold text-slate-900">최종 시나리오 선택</div>
                <div className="mt-0.5 text-xs text-slate-500">
                  선택된 시나리오를 기준으로 다음 단계(컨설턴트/행정 실행)로 연결합니다.
                </div>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={selected}
                  onChange={(e) => setSelected(e.target.value as ScenarioId)}
                  className="h-10 rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {ordered.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.id})
                    </option>
                  ))}
                </select>
                <button className="h-10 rounded-2xl bg-teal-700 px-5 text-sm font-semibold text-white transition hover:bg-teal-800">
                  선택 시나리오로 진행
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center text-[10px] text-slate-400">
        * 본 화면은 UI 프리뷰용이며, 실제 ZEB 계산/비용 산정 로직과는 무관합니다.
      </div>
    </div>
  );
}
