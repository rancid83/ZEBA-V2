'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Layers,
  Pencil,
  Plus,
  SlidersHorizontal,
  Trash2,
  Wand2,
  X,
} from 'lucide-react';
import { Bar, Scatter } from 'react-chartjs-2';
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  PointElement,
  ScatterController,
  Title,
  Tooltip,
} from 'chart.js';
import type { TooltipItem } from 'chart.js';
import { Collapse } from 'antd';

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

type ScenarioId = 'A' | 'B' | 'C';
type ScenarioStatus = 'draft' | 'saved' | 'final';

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
  status: ScenarioStatus;
  note: string;
  savedAt?: string;
  spec: Spec;
  result: Result;
  updatedAt: string;
  analyzed: boolean;
};

type SavedScenarioRecord = {
  recordId: string;
  sourceId: ScenarioId;
  name: string;
  status: ScenarioStatus;
  savedAt: string;
  note: string;
  snapshot: Scenario;
};

type SliderProps = {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  unit?: string;
  onChange: (v: number) => void;
};

type SpecPatch = {
  passive?: Partial<Spec['passive']>;
  active?: Partial<Spec['active']>;
  renewable?: Partial<Spec['renewable']>;
};

type ScenarioCardProps = {
  scenario: Scenario;
  isRenaming: boolean;
  renameValue: string;
  onStartRename: (id: ScenarioId) => void;
  onRenameChange: (value: string) => void;
  onRenameSubmit: (id: ScenarioId) => void;
  onRenameCancel: () => void;
  onRemove: (id: ScenarioId) => void;
  onUpdateSpec: (id: ScenarioId, patch: SpecPatch) => void;
  onAnalyze: (id: ScenarioId) => void;
  onSave: (id: ScenarioId) => void;
  onSetFinal: (id: ScenarioId) => void;
};

const ORDER: ScenarioId[] = ['A', 'B', 'C'];
const TEAL = '#0f766e';

function fmt(num: number): string {
  return new Intl.NumberFormat('ko-KR').format(Math.round(num));
}

function fmtPct(num: number, digits = 1): string {
  return `${num.toFixed(digits)}%`;
}

function nowStamp(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${day} ${h}:${min}`;
}

function defaultScenarioName(id: ScenarioId, isStandard = false): string {
  if (isStandard) return '표준 모델';
  if (id === 'B') return '대안 1';
  return '대안 2';
}

function gradeBadge(grade: number): { label: string; className: string } {
  const map: Record<number, { label: string; className: string }> = {
    1: { label: '1등급', className: 'bg-emerald-600' },
    2: { label: '2등급', className: 'bg-teal-600' },
    3: { label: '3등급', className: 'bg-sky-600' },
    4: { label: '4등급', className: 'bg-amber-600' },
    5: { label: '5등급', className: 'bg-rose-600' },
  };
  return map[grade] || { label: `${grade}등급`, className: 'bg-slate-600' };
}

function computeResult(spec: Spec): Result {
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

  const passive =
    250000 +
    (0.25 / spec.passive.wallU) * 45000 +
    (0.25 / spec.passive.windowU) * 35000 +
    (0.25 / spec.passive.roofU) * 15000 +
    (0.25 / spec.passive.floorU) * 15000;
  const active =
    120000 +
    (spec.active.ehpCOP - 3.0) * 25000 +
    (spec.active.ventilationEff - 50) * 1200 +
    (6.3 - spec.active.lightingLPD) * 15000 +
    (spec.active.boilerEff - 88) * 1200;
  const renewable = spec.renewable.pvArea * 750 + spec.renewable.fuelCellKW * 3200;

  return {
    zebGrade,
    selfSuff,
    prod,
    demand,
    costTotal: Math.max(0, passive + active + renewable),
    costBreakdown: { passive, active, renewable },
  };
}

function createScenario(id: ScenarioId, isStandard = false): Scenario {
  const spec: Spec = {
    passive: { wallU: 0.24, windowU: 0.24, roofU: 0.24, floorU: 0.24 },
    active: { ehpCOP: 3.6, ventilationEff: 70, lightingLPD: 5, boilerEff: 88 },
    renewable: { pvArea: 160, pvEff: 18, fuelCellKW: 0 },
  };

  return {
    id,
    name: defaultScenarioName(id, isStandard),
    isStandard,
    status: isStandard ? 'saved' : 'draft',
    note: '',
    savedAt: isStandard ? nowStamp() : undefined,
    spec,
    result: computeResult(spec),
    updatedAt: nowStamp(),
    analyzed: isStandard,
  };
}

function buildRecord(scenario: Scenario, name: string, status: ScenarioStatus): SavedScenarioRecord {
  return {
    recordId: `${status}-${scenario.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    sourceId: scenario.id,
    name,
    status,
    savedAt: scenario.savedAt || nowStamp(),
    note: scenario.note,
    snapshot: scenario,
  };
}

function StatusPill({ status }: { status: ScenarioStatus }) {
  const cls: Record<ScenarioStatus, string> = {
    draft: 'border-slate-200 bg-slate-100 text-slate-600',
    saved: 'border-teal-100 bg-teal-50 text-teal-700',
    final: 'border-slate-950 bg-slate-950 text-white',
  };
  const label: Record<ScenarioStatus, string> = {
    draft: '편집 중',
    saved: '저장됨',
    final: '최종안',
  };

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${cls[status]}`}>
      {label[status]}
    </span>
  );
}

function MiniSlider({ label, min, max, step, value, unit, onChange }: SliderProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-medium text-slate-800">{label}</div>
        <div className="text-sm font-semibold text-slate-900">
          {value}
          {unit}
        </div>
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
      <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
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
              const lab = tooltipItem.dataset.label ?? '';
              const y = tooltipItem.parsed.y;
              if (y == null) return '';
              if (lab === '자립률') return `${lab}: ${y.toFixed(1)}%`;
              return `${lab}: ${fmt(y)}`;
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
      <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="p-6">
          <div className="flex items-center gap-2 text-base font-semibold text-slate-900">
            <Layers className="h-4 w-4 text-teal-700" />
            자립률 및 시공비 (시나리오 비교)
          </div>
          <p className="mt-1 text-xs text-slate-500">분석 업데이트된 시나리오가 아직 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div className="p-6 pb-2">
        <div className="flex items-center gap-2 text-base font-semibold text-slate-900">
          <Layers className="h-4 w-4 text-teal-700" />
          자립률 및 시공비 (시나리오 비교)
        </div>
        <p className="text-xs text-slate-500">
          각 시나리오의 자립률과 총 시공비를 동일 화면에서 병렬 비교합니다.
        </p>
      </div>
      <div className="px-6 pb-6" style={{ height: 320 }}>
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
          title: { display: true, text: '시공비' },
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
      <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="p-6">
          <div className="text-base font-semibold text-slate-900">비용-자립률 위상</div>
          <p className="mt-1 text-xs text-slate-500">분석 업데이트된 시나리오가 아직 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div className="p-6 pb-2">
        <div className="text-base font-semibold text-slate-900">비용-자립률 위상</div>
        <p className="text-xs text-slate-500">
          x축은 시공비, y축은 자립률로 각 시나리오의 위치를 비교합니다.
        </p>
      </div>
      <div className="px-6 pb-6" style={{ height: 320 }}>
        <Scatter data={data} options={options} />
      </div>
    </div>
  );
}

function DetailsTable(props: {
  title: string;
  rows: { key: string; label: string; unit?: string }[];
  scenarios: Scenario[];
  getValue: (s: Scenario, key: string) => number;
}) {
  const { title, rows, scenarios, getValue } = props;

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div className="space-y-1 p-6 pb-2">
        <div className="text-base font-semibold text-slate-900">{title}</div>
        <p className="text-xs text-slate-500">열(column) 기준으로 시나리오를 비교합니다.</p>
      </div>
      <div className="overflow-auto px-6 pb-6">
        <div className="min-w-[720px]">
          <div
            className="grid gap-2 rounded-2xl bg-slate-50 p-2 text-xs font-semibold text-slate-700"
            style={{ gridTemplateColumns: `220px repeat(${scenarios.length}, minmax(0, 1fr))` }}
          >
            <div>항목</div>
            {scenarios.map((scenario) => (
              <div key={scenario.id} className="text-center">
                {scenario.name}
              </div>
            ))}
          </div>
          <div className="mt-2 space-y-2">
            {rows.map((row) => (
              <div
                key={row.key}
                className="grid gap-2 rounded-2xl border border-slate-200 bg-white p-3 text-sm"
                style={{ gridTemplateColumns: `220px repeat(${scenarios.length}, minmax(0, 1fr))` }}
              >
                <div className="text-slate-700">
                  {row.label}
                  {row.unit ? <span className="ml-1 text-xs text-slate-500">({row.unit})</span> : null}
                </div>
                {scenarios.map((scenario) => (
                  <div key={scenario.id} className="text-center font-semibold text-slate-900">
                    {getValue(scenario, row.key).toFixed(2)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TradeoffTable({
  scenarios,
  baselineId,
  onBaselineChange,
  getDelta,
}: {
  scenarios: Scenario[];
  baselineId: ScenarioId;
  onBaselineChange: (id: ScenarioId) => void;
  getDelta: (id: ScenarioId) => string;
}) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div className="space-y-1 p-6 pb-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-base font-semibold text-slate-900">비용 트레이드오프</div>
            <p className="text-xs text-slate-500">기준 시나리오 대비 시공비와 자립률을 함께 비교합니다.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">기준 모델</span>
            <select
              value={baselineId}
              onChange={(e) => onBaselineChange(e.target.value as ScenarioId)}
              className="h-9 w-[180px] rounded-full border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
            >
              {scenarios.map((scenario) => (
                <option key={scenario.id} value={scenario.id}>
                  {scenario.name} ({scenario.id})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="space-y-2 overflow-auto px-6 pb-6">
        <div className="min-w-[720px]">
          <div
            className="grid gap-2 rounded-2xl bg-slate-50 p-2 text-xs font-semibold text-slate-700"
            style={{ gridTemplateColumns: `220px repeat(${scenarios.length}, minmax(0, 1fr))` }}
          >
            <div>항목</div>
            {scenarios.map((scenario) => (
              <div key={scenario.id} className="text-center">
                {scenario.name}
              </div>
            ))}
          </div>
          <div className="mt-2 space-y-2">
            <div
              className="grid gap-2 rounded-2xl border border-slate-200 bg-white p-3 text-sm shadow-sm"
              style={{ gridTemplateColumns: `220px repeat(${scenarios.length}, minmax(0, 1fr))` }}
            >
              <div className="font-medium text-slate-700">총 시공비(만원)</div>
              {scenarios.map((scenario) => (
                <div key={scenario.id} className="text-center font-semibold text-slate-900">
                  {fmt(scenario.result.costTotal)}
                </div>
              ))}
            </div>
            <div
              className="grid gap-2 rounded-2xl border border-slate-200 bg-white p-3 text-sm shadow-sm"
              style={{ gridTemplateColumns: `220px repeat(${scenarios.length}, minmax(0, 1fr))` }}
            >
              <div className="font-medium text-slate-700">기준 대비(%)</div>
              {scenarios.map((scenario) => (
                <div key={scenario.id} className="text-center font-semibold text-slate-900">
                  {getDelta(scenario.id)}
                </div>
              ))}
            </div>
            <div
              className="grid gap-2 rounded-2xl border border-slate-200 bg-white p-3 text-sm shadow-sm"
              style={{ gridTemplateColumns: `220px repeat(${scenarios.length}, minmax(0, 1fr))` }}
            >
              <div className="font-medium text-slate-700">자립률(%)</div>
              {scenarios.map((scenario) => (
                <div key={scenario.id} className="text-center font-semibold text-slate-900">
                  {fmtPct(scenario.result.selfSuff)}
                </div>
              ))}
            </div>
            <div
              className="grid gap-2 rounded-2xl border border-slate-200 bg-white p-3 text-sm shadow-sm"
              style={{ gridTemplateColumns: `220px repeat(${scenarios.length}, minmax(0, 1fr))` }}
            >
              <div className="font-medium text-slate-700">ZEB 등급</div>
              {scenarios.map((scenario) => (
                <div key={scenario.id} className="text-center font-semibold text-slate-900">
                  ZEB {scenario.result.zebGrade}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScenarioCard({
  scenario,
  isRenaming,
  renameValue,
  onStartRename,
  onRenameChange,
  onRenameSubmit,
  onRenameCancel,
  onRemove,
  onUpdateSpec,
  onAnalyze,
  onSave,
  onSetFinal,
}: ScenarioCardProps) {
  const [tab, setTab] = useState<'passive' | 'active' | 'renew'>('passive');

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="space-y-3"
    >
      <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="space-y-1 p-6 pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                {isRenaming ? (
                  <div className="flex w-full items-center gap-2 sm:max-w-[320px]">
                    <input
                      value={renameValue}
                      onChange={(e) => onRenameChange(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') onRenameSubmit(scenario.id);
                        if (e.key === 'Escape') onRenameCancel();
                      }}
                      className="h-9 w-full min-w-0 flex-1 rounded-full border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                      placeholder="시나리오 이름 입력"
                      autoFocus
                    />
                    <button
                      type="button"
                      className="inline-flex h-9 shrink-0 items-center justify-center rounded-full bg-slate-950 px-3 text-white hover:bg-slate-900"
                      onClick={() => onRenameSubmit(scenario.id)}
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="inline-flex h-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white px-3 hover:bg-slate-50"
                      onClick={onRenameCancel}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="truncate text-base font-semibold text-slate-900">{scenario.name}</div>
                    {!scenario.isStandard ? (
                      <button
                        type="button"
                        className="inline-flex h-7 items-center rounded-full px-2 text-xs text-slate-600 hover:bg-slate-100"
                        onClick={() => onStartRename(scenario.id)}
                      >
                        <Pencil className="mr-1 h-3.5 w-3.5" />
                        수정
                      </button>
                    ) : null}
                  </>
                )}
              </div>
              <p className="text-xs text-slate-500">표준모델 기반 편집 · {scenario.id}</p>
            </div>
            <div className="flex items-center gap-2">
              <StatusPill status={scenario.status} />
              {!scenario.isStandard ? (
                <button
                  type="button"
                  className="inline-flex h-8 items-center justify-center rounded-full border border-slate-200 px-2 hover:bg-slate-50"
                  onClick={() => onRemove(scenario.id)}
                >
                  <Trash2 className="h-4 w-4 text-slate-600" />
                </button>
              ) : null}
            </div>
          </div>
        </div>
        <div className="space-y-4 px-6 pb-6">
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
            <span>저장 시각</span>
            <span className="font-medium text-slate-800">{scenario.savedAt || '미저장'}</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <div className="text-xs text-slate-600">ZEB 등급</div>
              <div className="mt-1 flex items-center justify-between gap-2">
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold text-white ${gradeBadge(scenario.result.zebGrade).className}`}
                >
                  ZEB {gradeBadge(scenario.result.zebGrade).label}
                </span>
                <div className="text-sm font-semibold text-slate-900">{fmtPct(scenario.result.selfSuff)}</div>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <div className="text-xs text-slate-600">총 시공비</div>
              <div className="mt-1 text-lg font-bold text-slate-900">{fmt(scenario.result.costTotal)}</div>
              <div className="text-xs text-slate-500">만원</div>
            </div>
          </div>

          <div className="w-full">
            <div className="grid w-full grid-cols-3 gap-1 rounded-2xl bg-slate-100 p-1">
              {(
                [
                  { id: 'passive' as const, label: '패시브' },
                  { id: 'active' as const, label: '액티브' },
                  { id: 'renew' as const, label: '신재생' },
                ] as const
              ).map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={`rounded-xl py-2 text-sm font-medium transition ${
                    tab === id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {tab === 'passive' ? (
              <div className="mt-3 space-y-2">
                <MiniSlider
                  label="외벽 열관류율(U)"
                  min={0.12}
                  max={0.35}
                  step={0.01}
                  value={scenario.spec.passive.wallU}
                  onChange={(v) => onUpdateSpec(scenario.id, { passive: { wallU: v } })}
                />
                <MiniSlider
                  label="창호 열관류율(U)"
                  min={0.12}
                  max={0.35}
                  step={0.01}
                  value={scenario.spec.passive.windowU}
                  onChange={(v) => onUpdateSpec(scenario.id, { passive: { windowU: v } })}
                />
                <MiniSlider
                  label="지붕 열관류율(U)"
                  min={0.1}
                  max={0.3}
                  step={0.01}
                  value={scenario.spec.passive.roofU}
                  onChange={(v) => onUpdateSpec(scenario.id, { passive: { roofU: v } })}
                />
                <MiniSlider
                  label="바닥 열관류율(U)"
                  min={0.1}
                  max={0.3}
                  step={0.01}
                  value={scenario.spec.passive.floorU}
                  onChange={(v) => onUpdateSpec(scenario.id, { passive: { floorU: v } })}
                />
              </div>
            ) : null}

            {tab === 'active' ? (
              <div className="mt-3 space-y-2">
                <MiniSlider
                  label="EHP COP"
                  min={2.8}
                  max={5.0}
                  step={0.1}
                  value={scenario.spec.active.ehpCOP}
                  onChange={(v) => onUpdateSpec(scenario.id, { active: { ehpCOP: v } })}
                />
                <MiniSlider
                  label="전열교환 효율"
                  min={40}
                  max={85}
                  step={1}
                  value={scenario.spec.active.ventilationEff}
                  unit="%"
                  onChange={(v) => onUpdateSpec(scenario.id, { active: { ventilationEff: v } })}
                />
                <MiniSlider
                  label="조명밀도(LPD)"
                  min={3.0}
                  max={8.0}
                  step={0.1}
                  value={scenario.spec.active.lightingLPD}
                  onChange={(v) => onUpdateSpec(scenario.id, { active: { lightingLPD: v } })}
                />
                <MiniSlider
                  label="보일러 효율"
                  min={80}
                  max={98}
                  step={1}
                  value={scenario.spec.active.boilerEff}
                  unit="%"
                  onChange={(v) => onUpdateSpec(scenario.id, { active: { boilerEff: v } })}
                />
              </div>
            ) : null}

            {tab === 'renew' ? (
              <div className="mt-3 space-y-2">
                <MiniSlider
                  label="태양광 면적"
                  min={0}
                  max={500}
                  step={10}
                  value={scenario.spec.renewable.pvArea}
                  unit="m²"
                  onChange={(v) => onUpdateSpec(scenario.id, { renewable: { pvArea: v } })}
                />
                <MiniSlider
                  label="태양광 효율"
                  min={12}
                  max={24}
                  step={1}
                  value={scenario.spec.renewable.pvEff}
                  unit="%"
                  onChange={(v) => onUpdateSpec(scenario.id, { renewable: { pvEff: v } })}
                />
                <MiniSlider
                  label="연료전지 용량"
                  min={0}
                  max={150}
                  step={10}
                  value={scenario.spec.renewable.fuelCellKW}
                  unit="kW"
                  onChange={(v) => onUpdateSpec(scenario.id, { renewable: { fuelCellKW: v } })}
                />
              </div>
            ) : null}
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              className="inline-flex h-10 items-center justify-center rounded-full bg-slate-950 text-sm font-medium text-white hover:bg-slate-900"
              onClick={() => onAnalyze(scenario.id)}
            >
              <Wand2 className="mr-2 h-4 w-4" />
              분석 업데이트
            </button>
            <button
              type="button"
              className="inline-flex h-10 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-medium text-slate-900 hover:bg-slate-50"
              onClick={() => onSave(scenario.id)}
            >
              저장
            </button>
          </div>

          <button
            type="button"
            className={`h-10 w-full rounded-full text-sm font-medium ${
              scenario.status === 'final'
                ? 'bg-slate-950 text-white hover:bg-slate-900'
                : 'border border-slate-200 bg-white hover:bg-slate-50'
            }`}
            onClick={() => onSetFinal(scenario.id)}
          >
            {scenario.status === 'final' ? '최종안으로 선택됨' : '최종안으로 선택'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function ZEBAMultiScenario() {
  const [compareMode, setCompareMode] = useState(true);
  const [baseline, setBaseline] = useState<ScenarioId>('A');
  const [selected, setSelected] = useState<ScenarioId>('A');
  const [managerNote, setManagerNote] = useState('');
  const [scenarios, setScenarios] = useState<Scenario[]>([createScenario('A', true)]);
  const [savedLibrary, setSavedLibrary] = useState<SavedScenarioRecord[]>([]);
  const [selectedSavedRecordId, setSelectedSavedRecordId] = useState('');
  const [editingScenarioId, setEditingScenarioId] = useState<ScenarioId | null>(null);
  const [renameDraft, setRenameDraft] = useState('');

  const ordered = useMemo(
    () => ORDER.map((id) => scenarios.find((s) => s.id === id)).filter(Boolean) as Scenario[],
    [scenarios],
  );
  const analyzedScenarios = useMemo(() => ordered.filter((s) => s.analyzed), [ordered]);

  const safeBaseline = useMemo<ScenarioId>(() => {
    if (analyzedScenarios.some((s) => s.id === baseline)) return baseline;
    if (analyzedScenarios.length > 0) return analyzedScenarios[0].id;
    return 'A';
  }, [analyzedScenarios, baseline]);

  const baselineScenario = useMemo(
    () => analyzedScenarios.find((s) => s.id === safeBaseline) || ordered[0],
    [analyzedScenarios, ordered, safeBaseline],
  );
  const selectedScenario = useMemo(() => ordered.find((s) => s.id === selected) || ordered[0], [ordered, selected]);
  const finalScenario = useMemo(() => ordered.find((s) => s.status === 'final'), [ordered]);
  const selectedSavedRecord = useMemo(
    () => savedLibrary.find((r) => r.recordId === selectedSavedRecordId),
    [savedLibrary, selectedSavedRecordId],
  );

  useEffect(() => {
    if (baseline !== safeBaseline) setBaseline(safeBaseline);
  }, [baseline, safeBaseline]);

  useEffect(() => {
    if (ordered.length === 0) return;
    if (!ordered.some((s) => s.id === selected)) setSelected(ordered[0].id);
  }, [ordered, selected]);

  const costSummary = useMemo(() => {
    const base = baselineScenario ? baselineScenario.result.costTotal : 0;
    return analyzedScenarios.map((scenario) => ({
      id: scenario.id,
      deltaPct: base > 0 ? ((scenario.result.costTotal - base) / base) * 100 : 0,
    }));
  }, [analyzedScenarios, baselineScenario]);

  const statusChip = useMemo(() => {
    const targetGrade = 4;
    const ok =
      analyzedScenarios.length > 0 && analyzedScenarios.every((s) => s.result.zebGrade <= targetGrade);
    if (ok) {
      return {
        icon: <CheckCircle2 className="h-4 w-4" />,
        text: `목표(${targetGrade}등급) 만족`,
        cls: 'bg-emerald-600',
      };
    }
    return {
      icon: <AlertTriangle className="h-4 w-4" />,
      text:
        analyzedScenarios.length === 0
          ? '분석 대기 중'
          : `목표(${targetGrade}등급) 미달 시나리오 존재`,
      cls: analyzedScenarios.length === 0 ? 'bg-slate-500' : 'bg-rose-600',
    };
  }, [analyzedScenarios]);

  const startRenameScenario = (id: ScenarioId) => {
    const target = scenarios.find((s) => s.id === id);
    if (!target || target.isStandard) return;
    setEditingScenarioId(id);
    setRenameDraft(target.name);
  };

  const cancelRenameScenario = () => {
    setEditingScenarioId(null);
    setRenameDraft('');
  };

  const submitRenameScenario = (id: ScenarioId) => {
    const trimmed = renameDraft.trim();
    if (!trimmed) return;
    setScenarios((prev) => prev.map((s) => (s.id === id ? { ...s, name: trimmed, updatedAt: nowStamp() } : s)));
    cancelRenameScenario();
  };

  const removeScenario = (id: ScenarioId) => {
    if (id === 'A') return;
    if (editingScenarioId === id) cancelRenameScenario();
    setScenarios((prev) => prev.filter((s) => s.id !== id));
  };

  const addScenario = () => {
    const used = new Set(scenarios.map((s) => s.id));
    const next = ORDER.find((id) => !used.has(id));
    if (!next) return;
    setScenarios((prev) => [...prev, createScenario(next)]);
  };

  const updateSpec = (id: ScenarioId, patch: SpecPatch) => {
    setScenarios((prev) =>
      prev.map((scenario) => {
        if (scenario.id !== id) return scenario;
        return {
          ...scenario,
          spec: {
            passive: { ...scenario.spec.passive, ...patch.passive },
            active: { ...scenario.spec.active, ...patch.active },
            renewable: { ...scenario.spec.renewable, ...patch.renewable },
          },
        };
      }),
    );
  };

  const analyzeScenario = (id: ScenarioId) => {
    setScenarios((prev) =>
      prev.map((scenario) => {
        if (scenario.id !== id) return scenario;
        return {
          ...scenario,
          result: computeResult(scenario.spec),
          updatedAt: nowStamp(),
          analyzed: true,
        };
      }),
    );
  };

  const analyzeAll = () => {
    setScenarios((prev) =>
      prev.map((scenario) => ({
        ...scenario,
        result: computeResult(scenario.spec),
        updatedAt: nowStamp(),
        analyzed: true,
      })),
    );
  };

  const saveScenario = (id: ScenarioId) => {
    const target = scenarios.find((s) => s.id === id);
    if (!target) return;
    const updated: Scenario = {
      ...target,
      status: target.status === 'final' ? 'final' : 'saved',
      savedAt: nowStamp(),
      note: managerNote || target.note,
    };
    setScenarios((prev) => prev.map((s) => (s.id === id ? updated : s)));
    const record = buildRecord(updated, `${updated.name} 저장안`, updated.status);
    setSavedLibrary((prev) => [...prev, record]);
    setSelectedSavedRecordId(record.recordId);
  };

  const setFinalScenario = (id: ScenarioId) => {
    const target = scenarios.find((s) => s.id === id);
    if (!target) return;
    const updated: Scenario = {
      ...target,
      status: 'final',
      savedAt: nowStamp(),
      note: managerNote || target.note,
    };
    setSelected(id);
    setScenarios((prev) =>
      prev.map((s) => {
        if (s.id === id) return updated;
        if (s.status === 'final') return { ...s, status: 'saved' };
        return s;
      }),
    );
    const record = buildRecord(updated, `${updated.name} 최종안`, 'final');
    setSavedLibrary((prev) => [...prev, record]);
    setSelectedSavedRecordId(record.recordId);
  };

  const loadScenario = (recordId: string) => {
    const target = savedLibrary.find((r) => r.recordId === recordId);
    if (!target) return;
    setSelected(target.sourceId);
    setManagerNote(target.note);
    setSelectedSavedRecordId(target.recordId);
    setScenarios((prev) =>
      prev.map((s) => (s.id === target.sourceId ? { ...target.snapshot, updatedAt: nowStamp() } : s)),
    );
  };

  const tradeoffDelta = (id: ScenarioId): string => {
    if (id === safeBaseline) return '0.0%';
    const hit = costSummary.find((x) => x.id === id);
    return hit ? `${hit.deltaPct.toFixed(1)}%` : '-';
  };

  const collapseItems = useMemo(
    () => [
      {
        key: 'passive',
        label: '패시브',
        children: (
          <DetailsTable
            title="패시브 성능 내역"
            scenarios={ordered}
            rows={[
              { key: 'wallU', label: '외벽 열관류율', unit: 'W/m²K' },
              { key: 'windowU', label: '창호 열관류율', unit: 'W/m²K' },
              { key: 'roofU', label: '지붕 열관류율', unit: 'W/m²K' },
              { key: 'floorU', label: '바닥 열관류율', unit: 'W/m²K' },
            ]}
            getValue={(scenario, key) => (scenario.spec.passive as Record<string, number>)[key]}
          />
        ),
      },
      {
        key: 'active',
        label: '액티브',
        children: (
          <DetailsTable
            title="액티브 성능 내역"
            scenarios={ordered}
            rows={[
              { key: 'ehpCOP', label: 'EHP COP' },
              { key: 'ventilationEff', label: '전열교환 효율', unit: '%' },
              { key: 'lightingLPD', label: '조명밀도(LPD)', unit: 'W/m²' },
              { key: 'boilerEff', label: '보일러 효율', unit: '%' },
            ]}
            getValue={(scenario, key) => (scenario.spec.active as Record<string, number>)[key]}
          />
        ),
      },
      {
        key: 'renewable',
        label: '신재생',
        children: (
          <DetailsTable
            title="신재생 성능 내역"
            scenarios={ordered}
            rows={[
              { key: 'pvArea', label: '태양광 면적', unit: 'm²' },
              { key: 'pvEff', label: '태양광 효율', unit: '%' },
              { key: 'fuelCellKW', label: '연료전지 용량', unit: 'kW' },
            ]}
            getValue={(scenario, key) => (scenario.spec.renewable as Record<string, number>)[key]}
          />
        ),
      },
    ],
    [ordered],
  );

  return (
    <div className="mx-auto w-full max-w-[1480px] space-y-6 text-slate-900">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-3 rounded-[28px] border border-slate-200 bg-white px-6 py-4 shadow-sm"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="rounded-2xl bg-teal-50 p-2 text-teal-800">
                <SlidersHorizontal className="h-5 w-5" />
              </div>
              <h1 className="text-[26px] font-semibold tracking-[-0.03em] text-slate-900">
                3단계 · 성능 조합(다중 시나리오)
              </h1>
            </div>
            <p className="mt-1 text-[15px] leading-7 text-slate-600">
              2단계 표준모델을 기준으로 최대 3개의 시나리오를 만들고, 결과를 병렬 비교합니다.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold text-white ${statusChip.cls}`}>
              {statusChip.icon}
              {statusChip.text}
            </span>
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
              <span className="text-xs text-slate-600">비교 모드</span>
              <button
                type="button"
                role="switch"
                aria-checked={compareMode}
                onClick={() => setCompareMode((v) => !v)}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors ${
                  compareMode ? 'bg-teal-700' : 'bg-slate-300'
                }`}
              >
                <span
                  aria-hidden
                  className={`pointer-events-none h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
                    compareMode ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
        <div className="h-px w-full bg-slate-200" />
        <div className="flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            className="inline-flex h-9 items-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
            onClick={analyzeAll}
          >
            <Wand2 className="mr-2 h-4 w-4" />
            전체 분석 업데이트
          </button>
          <button
            type="button"
            disabled={scenarios.length >= 3}
            className="inline-flex h-9 items-center rounded-2xl bg-teal-700 px-4 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-50"
            onClick={addScenario}
          >
            <Plus className="mr-2 h-4 w-4" />
            시나리오 추가 ({scenarios.length}/3)
          </button>
        </div>
      </motion.div>

      <div className="grid gap-5 lg:grid-cols-3">
        <AnimatePresence>
          {ordered.map((scenario) => (
            <ScenarioCard
              key={scenario.id}
              scenario={scenario}
              isRenaming={editingScenarioId === scenario.id}
              renameValue={editingScenarioId === scenario.id ? renameDraft : scenario.name}
              onStartRename={startRenameScenario}
              onRenameChange={setRenameDraft}
              onRenameSubmit={submitRenameScenario}
              onRenameCancel={cancelRenameScenario}
              onRemove={removeScenario}
              onUpdateSpec={updateSpec}
              onAnalyze={analyzeScenario}
              onSave={saveScenario}
              onSetFinal={setFinalScenario}
            />
          ))}
        </AnimatePresence>
      </div>

      {compareMode ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <ComparisonChart scenarios={analyzedScenarios} />
            <CostPositionChart scenarios={analyzedScenarios} />
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
            <div className="p-6 pb-2">
              <div className="text-base font-semibold text-slate-900">상세 비교</div>
              <p className="text-xs text-slate-500">
                비용 트레이드오프와 패시브/액티브/신재생 스펙을 함께 비교합니다.
              </p>
            </div>
            <div className="space-y-4 px-6 pb-6">
              <TradeoffTable
                scenarios={analyzedScenarios}
                baselineId={safeBaseline}
                onBaselineChange={setBaseline}
                getDelta={tradeoffDelta}
              />

              <Collapse
                bordered={false}
                expandIconPosition="end"
                className="project-hub-zeb-collapse bg-transparent [&_.ant-collapse-item]:mb-2 [&_.ant-collapse-item]:overflow-hidden [&_.ant-collapse-item]:rounded-2xl [&_.ant-collapse-item]:border [&_.ant-collapse-item]:border-slate-200 [&_.ant-collapse-header]:!px-4 [&_.ant-collapse-header]:!py-3 [&_.ant-collapse-header]:text-sm [&_.ant-collapse-header]:font-semibold [&_.ant-collapse-content-box]:!p-0 [&_.ant-collapse-content-box]:!pt-0"
                items={collapseItems}
              />
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-5 shadow-sm">
              <div className="text-sm font-semibold text-slate-900">시나리오 관리</div>
              <div className="mt-1 text-xs text-slate-600">
                비교 결과를 저장하고, 최종안을 지정해 다음 단계로 넘깁니다.
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="text-xs text-slate-500">전체 시나리오</div>
                  <div className="mt-1 text-2xl font-semibold text-slate-900">{ordered.length}</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="text-xs text-slate-500">저장된 안</div>
                  <div className="mt-1 text-2xl font-semibold text-slate-900">{savedLibrary.length}</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="text-xs text-slate-500">최종안</div>
                  <div className="mt-1 text-base font-semibold text-slate-900">
                    {finalScenario ? `${finalScenario.name} (${finalScenario.id})` : '미선택'}
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 text-xs font-semibold tracking-[0.18em] text-slate-500">저장된 시나리오</div>
                <div className="mb-4 max-h-[280px] space-y-2 overflow-auto pr-1">
                  {savedLibrary.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-white px-3 py-5 text-center text-xs text-slate-400">
                      저장된 시나리오 없음
                    </div>
                  ) : (
                    savedLibrary.map((record, index) => (
                      <button
                        key={record.recordId}
                        type="button"
                        onClick={() => setSelectedSavedRecordId(record.recordId)}
                        className={`w-full rounded-xl border px-3 py-3 text-left transition ${
                          selectedSavedRecordId === record.recordId
                            ? 'border-teal-200 bg-teal-50'
                            : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="text-sm font-medium text-slate-800">
                              저장안 {index + 1} · {record.snapshot.name} ({record.sourceId})
                            </div>
                            <div className="mt-1 text-xs text-slate-500">{record.savedAt}</div>
                          </div>
                          <StatusPill status={record.status} />
                        </div>
                      </button>
                    ))
                  )}
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-semibold tracking-[0.16em] text-slate-500">선택한 저장안</div>
                      <div className="mt-1 text-sm font-semibold text-slate-900">
                        {selectedSavedRecord
                          ? `저장안 · ${selectedSavedRecord.snapshot.name} (${selectedSavedRecord.sourceId})`
                          : '선택된 저장안 없음'}
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={!selectedSavedRecord}
                      className="inline-flex h-8 items-center rounded-full border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={() => selectedSavedRecord && loadScenario(selectedSavedRecord.recordId)}
                    >
                      불러오기
                    </button>
                  </div>
                  <div className="mt-2 text-xs text-slate-500">
                    {selectedSavedRecord
                      ? '선택한 저장안을 현재 작업 시나리오 슬롯으로 다시 불러옵니다.'
                      : '좌측 목록에서 저장안을 선택하면 여기서 다시 불러올 수 있습니다.'}
                  </div>
                </div>

                <div className="mt-4 text-xs font-semibold tracking-[0.18em] text-slate-500">저장 메모</div>
                <textarea
                  value={managerNote}
                  onChange={(e) => setManagerNote(e.target.value)}
                  placeholder="예: 사업비는 증가하지만 목표 등급 안정성이 높아 우선 검토안으로 저장"
                  className="mt-3 min-h-[96px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                />
                <div className="mt-3 text-xs text-slate-500">
                  메모는 저장 또는 최종안 선택 시 해당 시나리오에 함께 기록됩니다.
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-5 shadow-sm">
              <div className="text-sm font-semibold text-slate-900">최종 시나리오 선택</div>
              <div className="mt-1 text-xs text-slate-600">
                최종안은 1개만 유지되며, 실행 단계의 기준안으로 전달됩니다.
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <select
                  value={selected}
                  onChange={(e) => setSelected(e.target.value as ScenarioId)}
                  className="h-10 w-[180px] rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                >
                  {ordered.map((scenario) => (
                    <option key={scenario.id} value={scenario.id}>
                      {scenario.name} ({scenario.id})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="inline-flex h-10 items-center rounded-full bg-slate-950 px-4 text-sm font-medium text-white hover:bg-slate-900"
                  onClick={() => setFinalScenario(selected)}
                >
                  최종안 확정
                </button>
              </div>

              <div className="mt-4 space-y-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="text-xs text-slate-500">현재 선택안</div>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <div className="text-base font-semibold text-slate-900">
                      {selectedScenario ? `${selectedScenario.name} (${selectedScenario.id})` : '-'}
                    </div>
                    {selectedScenario ? <StatusPill status={selectedScenario.status} /> : null}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  {selectedSavedRecord && selectedSavedRecord.note ? (
                    <>
                      <div className="text-xs font-semibold tracking-[0.16em] text-slate-500">저장 메모</div>
                      <div className="mt-2 leading-6 text-slate-700">{selectedSavedRecord.note}</div>
                    </>
                  ) : selectedScenario && selectedScenario.note ? (
                    <>
                      <div className="text-xs font-semibold tracking-[0.16em] text-slate-500">현재 작업 메모</div>
                      <div className="mt-2 leading-6 text-slate-700">{selectedScenario.note}</div>
                    </>
                  ) : (
                    <div>아직 기록된 메모가 없습니다.</div>
                  )}
                </div>

                <button
                  type="button"
                  className="h-10 w-full rounded-full bg-teal-700 text-sm font-medium text-white hover:bg-teal-800"
                >
                  선택 시나리오로 진행
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}

      <div className="text-center text-xs text-slate-500">
        * 본 화면은 UI 프리뷰용이며, 실제 ZEB 계산/비용 산정 로직과는 무관합니다.
      </div>
    </div>
  );
}
