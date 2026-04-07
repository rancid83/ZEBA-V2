'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { defaultRenewableHubData } from '@/constants/hubFileDefaults';
import { fetchHubData } from '@/services/hubPersistence';
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';
import { AlertCircle, Sun, Target, Zap } from 'lucide-react';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

type RenewableHubFile = typeof defaultRenewableHubData;

export type RenewableInstallProjectInfo = {
  location: string;
  usage: string;
  grossFloorArea: number;
  floors: number;
  name?: string;
};

const GeothermalIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M6 4v10c0 1.8 3 1.8 3 0V4" />
    <path d="M11 4v10c0 1.8 3 1.8 3 0V4" />
    <path d="M16 4v10c0 1.8 3 1.8 3 0V4" />
    <path d="M4 18h16" />
  </svg>
);

function clampNumber(value: unknown, min = 0, max = Number.POSITIVE_INFINITY): number {
  const raw = typeof value === 'number' ? value : parseFloat(String(value).replace(/,/g, ''));
  const n = raw;
  if (!Number.isFinite(n)) return min === 0 && max === Number.POSITIVE_INFINITY ? 0 : min;
  return Math.min(max, Math.max(min, n));
}

function fmt(n: number, digits = 1): string {
  if (!Number.isFinite(n)) return '-';
  return n.toLocaleString(undefined, { maximumFractionDigits: digits });
}

function pct(n: number, digits = 1): string {
  if (!Number.isFinite(n)) return '0%';
  return `${n.toLocaleString(undefined, { maximumFractionDigits: digits })}%`;
}

function PvModeSwitch({
  applyMaxPv,
  onChange,
}: {
  applyMaxPv: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="inline-flex items-center gap-3">
      <div className="rounded-full border border-slate-200 bg-slate-100 p-1 shadow-inner">
        <div className="relative grid w-[220px] grid-cols-2 items-center">
          <div
            className={`absolute top-0 h-9 w-[calc(50%-2px)] rounded-full bg-white shadow-sm ring-1 ring-slate-200 transition-transform duration-200 ${
              applyMaxPv ? 'translate-x-0' : 'translate-x-[calc(100%+4px)]'
            }`}
          />

          <button
            type="button"
            onClick={() => onChange(true)}
            className={`relative z-10 h-9 rounded-full px-4 text-sm font-medium transition-colors ${
              applyMaxPv ? 'text-teal-800' : 'text-slate-500'
            }`}
            aria-pressed={applyMaxPv}
          >
            최대 적용
          </button>

          <button
            type="button"
            onClick={() => onChange(false)}
            className={`relative z-10 h-9 rounded-full px-4 text-sm font-medium transition-colors ${
              !applyMaxPv ? 'text-teal-800' : 'text-slate-500'
            }`}
            aria-pressed={!applyMaxPv}
          >
            직접 입력
          </button>
        </div>
      </div>
    </div>
  );
}

function Panel({
  title,
  children,
  className = '',
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`.trim()}>
      {title ? (
        <div className="border-b border-slate-100 px-5 pb-3 pt-4">
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        </div>
      ) : null}
      <div className="p-5">{children}</div>
    </div>
  );
}

const inputClass =
  'h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-teal-300 focus:ring-2 focus:ring-teal-50';

export default function RenewableInstallRateReview({ project }: { project: RenewableInstallProjectInfo }) {
  const [renewConfig, setRenewConfig] = useState<RenewableHubFile | null>(null);
  useEffect(() => {
    fetchHubData('renewable')
      .then((d) => setRenewConfig(d as RenewableHubFile))
      .catch(() => setRenewConfig(defaultRenewableHubData));
  }, []);
  const cfg = renewConfig ?? defaultRenewableHubData;

  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());
  const [targetInstallRate, setTargetInstallRate] = useState<number>(12);
  const [geothermalKw, setGeothermalKw] = useState<number>(0);
  const [fuelCellKw, setFuelCellKw] = useState<number>(0);
  const [applyMaxPv, setApplyMaxPv] = useState<boolean>(true);
  const [pvManualKw, setPvManualKw] = useState<number>(0);

  const calc = useMemo(() => {
    const gfa = clampNumber(project.grossFloorArea, 0);
    const floors = Math.max(1, clampNumber(project.floors, 1));
    const regionMap = cfg.regionFactor as Record<string, number>;
    const energyMap = cfg.unitEnergyUse as Record<string, number>;
    const regionFactor = regionMap[project.location] ?? 1;
    const unitUse = energyMap[project.usage] ?? 120;

    const buildingArea = floors > 0 ? gfa / floors : 0;
    const x = Math.sqrt(Math.max(0, buildingArea));
    const y = 3.3 * floors;
    const roofInstallArea = buildingArea * 0.7;
    const facadeInstallArea = x * y * 0.7;
    const pvInstallableArea = roofInstallArea + facadeInstallArea;
    const pvMaxKw = pvInstallableArea * 0.22;
    const pvKw = applyMaxPv ? pvMaxKw : Math.min(clampNumber(pvManualKw, 0), pvMaxKw);

    const expectedAnnualUse = gfa * unitUse * regionFactor;
    const targetRatio = clampNumber(targetInstallRate, 0, 100) / 100;
    const targetProduction = expectedAnnualUse * targetRatio;

    const pvProduction = pvKw * cfg.unitProduction.태양광.unit * cfg.unitProduction.태양광.adj;
    const geothermalProduction =
      clampNumber(geothermalKw, 0) * cfg.unitProduction.지열히트펌프.unit * cfg.unitProduction.지열히트펌프.adj;
    const fuelCellProduction =
      clampNumber(fuelCellKw, 0) * cfg.unitProduction.연료전지.unit * cfg.unitProduction.연료전지.adj;

    const totalProduction = pvProduction + geothermalProduction + fuelCellProduction;
    const achievedRate = expectedAnnualUse > 0 ? (totalProduction / expectedAnnualUse) * 100 : 0;
    const targetGapKwh = Math.max(0, targetProduction - totalProduction);

    const geothermalBoreholes = Math.ceil(clampNumber(geothermalKw, 0) / 9);
    const geothermalEstimatedArea = geothermalBoreholes * 25;

    const geoUnit = cfg.unitProduction.지열히트펌프.unit * cfg.unitProduction.지열히트펌프.adj;
    const fcUnit = cfg.unitProduction.연료전지.unit * cfg.unitProduction.연료전지.adj;
    const additionalGeoKw = geoUnit > 0 ? targetGapKwh / geoUnit : 0;
    const additionalFuelCellKw = fcUnit > 0 ? targetGapKwh / fcUnit : 0;

    const donutDataRaw = [
      { name: '태양광', value: pvProduction },
      { name: '지열히트펌프', value: geothermalProduction },
      { name: '연료전지', value: fuelCellProduction },
    ].filter((d) => d.value > 0);

    const donutTotal = donutDataRaw.reduce((sum, item) => sum + item.value, 0);
    const donutData = donutDataRaw.map((item) => ({
      ...item,
      percent: donutTotal > 0 ? (item.value / donutTotal) * 100 : 0,
    }));

    const geothermalWarning =
      geothermalKw > 0
        ? `예상 천공 ${fmt(geothermalBoreholes, 0)}공 · 예상 설치면적 ${fmt(geothermalEstimatedArea, 0)}㎡ 기준으로 검토 필요`
        : null;

    const fuelCellWarning = fuelCellKw > 0 ? '폐열 온수 사용처와 설치 공간 검토가 필요합니다.' : null;

    return {
      regionFactor,
      unitUse,
      buildingArea,
      x,
      y,
      roofInstallArea,
      facadeInstallArea,
      pvInstallableArea,
      pvMaxKw,
      pvKw,
      expectedAnnualUse,
      targetProduction,
      pvProduction,
      geothermalProduction,
      fuelCellProduction,
      totalProduction,
      achievedRate,
      targetGapKwh,
      geothermalBoreholes,
      geothermalEstimatedArea,
      additionalGeoKw,
      additionalFuelCellKw,
      donutData,
      donutTotal,
      geothermalWarning,
      fuelCellWarning,
    };
  }, [
    applyMaxPv,
    fuelCellKw,
    geothermalKw,
    project.floors,
    project.grossFloorArea,
    project.location,
    project.usage,
    pvManualKw,
    targetInstallRate,
    cfg,
  ]);

  const status =
    calc.totalProduction >= calc.targetProduction && calc.targetProduction > 0 ? '충족' : '미충족';

  const doughnutChartData = useMemo(
    () => ({
      labels: calc.donutData.map((d) => d.name),
      datasets: [
        {
          data: calc.donutData.map((d) => d.value),
          backgroundColor: calc.donutData.map((_, i) => cfg.donutColors[i % cfg.donutColors.length]),
          borderWidth: 0,
          hoverOffset: 6,
        },
      ],
    }),
    [calc.donutData, cfg.donutColors],
  );

  const doughnutOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      cutout: '68%',
      plugins: {
        legend: {
          display: true,
          position: 'bottom' as const,
          labels: { boxWidth: 10, padding: 12, font: { size: 11 } },
        },
        tooltip: {
          callbacks: {
            label: (ctx: { label?: string; parsed: number }) => {
              const label = ctx.label ?? '';
              const v = ctx.parsed;
              const row = calc.donutData.find((d) => d.name === label);
              const p = row?.percent ?? 0;
              return `${fmt(v, 0)} kWh/yr · ${pct(p, 1)}`;
            },
          },
        },
      },
    }),
    [calc.donutData],
  );

  const bump = () => setLastUpdated(Date.now());

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 text-slate-900">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-xs text-slate-500">3.2.2.4</div>
          <div className="text-2xl font-semibold tracking-tight">신·재생에너지설비 의무설치비율 검토</div>
          {project.name ? <div className="mt-1 text-sm text-slate-500">{project.name}</div> : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400">자동 계산됨</span>
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold text-white ${
              status === '충족' ? 'bg-teal-700' : 'bg-rose-600'
            }`}
          >
            {status}
          </span>
          <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
            PV 우선 검토
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
        <div className="space-y-6">
          <Panel title="입력">
            <div className="space-y-5">
              <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
                <div className="text-xs font-medium text-slate-500">프로젝트 기본 정보 (자동 호출)</div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-slate-500">위치</div>
                    <div className="mt-1 font-medium">{project.location}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">용도</div>
                    <div className="mt-1 font-medium">{project.usage}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">연면적</div>
                    <div className="mt-1 font-medium">{fmt(project.grossFloorArea, 0)} ㎡</div>
                  </div>
                  <div>
                    <div className="text-slate-500">층 수</div>
                    <div className="mt-1 font-medium">{fmt(project.floors, 0)} 층</div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-sm font-medium text-slate-700">신재생에너지설비 목표 설치율 (%)</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={targetInstallRate}
                  onChange={(e) => {
                    setTargetInstallRate(clampNumber(e.target.value, 0, 100));
                    bump();
                  }}
                  className={inputClass}
                />
              </div>

              <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex flex-col gap-3">
                  <div>
                    <div className="text-sm font-medium">PV 반영 방식</div>
                    <div className="mt-1 text-xs text-slate-500">
                      실무 기본값은 최대 설치 가능 용량 자동 반영
                    </div>
                  </div>
                  <PvModeSwitch
                    applyMaxPv={applyMaxPv}
                    onChange={(value) => {
                      setApplyMaxPv(value);
                      bump();
                    }}
                  />
                </div>

                {!applyMaxPv ? (
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">PV 설치 용량 직접 입력 (kW)</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={pvManualKw}
                      onChange={(e) => {
                        setPvManualKw(clampNumber(e.target.value, 0));
                        bump();
                      }}
                      className={inputClass}
                    />
                    <div className="text-[11px] text-slate-500">최대 입력 가능: {fmt(calc.pvMaxKw)} kW</div>
                  </div>
                ) : null}
              </div>

              <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
                <div>
                  <div className="text-sm font-medium">부족분 보완 설비 입력</div>
                  <div className="mt-1 text-xs text-slate-500">PV만으로 목표 설치율이 부족할 때만 검토</div>
                </div>

                <div className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">지열히트펌프 설치 용량 (kW)</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={geothermalKw}
                    onChange={(e) => {
                      setGeothermalKw(clampNumber(e.target.value, 0));
                      bump();
                    }}
                    className={inputClass}
                  />
                  {calc.geothermalWarning ? (
                    <div className="flex items-center gap-2 text-[11px] text-amber-700">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      {calc.geothermalWarning}
                    </div>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">연료전지 설치 용량 (kW)</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={fuelCellKw}
                    onChange={(e) => {
                      setFuelCellKw(clampNumber(e.target.value, 0));
                      bump();
                    }}
                    className={inputClass}
                  />
                  {calc.fuelCellWarning ? (
                    <div className="flex items-center gap-2 text-[11px] text-amber-700">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      {calc.fuelCellWarning}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </Panel>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Panel>
              <div className="text-xs text-slate-500">건축면적</div>
              <div className="mt-2 text-2xl font-semibold">{fmt(calc.buildingArea)} ㎡</div>
              <div className="mt-2 text-[11px] text-slate-500">= 연면적 / 층 수</div>
            </Panel>
            <Panel>
              <div className="text-xs text-slate-500">최대 PV 설치 용량</div>
              <div className="mt-2 text-2xl font-semibold">{fmt(calc.pvMaxKw)} kW</div>
              <div className="mt-2 text-[11px] text-slate-500">설치 가능 면적 × 0.22kW</div>
            </Panel>
            <Panel>
              <div className="text-xs text-slate-500">목표 생산량</div>
              <div className="mt-2 text-2xl font-semibold">{fmt(calc.targetProduction, 0)} kWh</div>
              <div className="mt-2 text-[11px] text-slate-500">예상 사용량 × 목표 설치율</div>
            </Panel>
            <div className="rounded-2xl border border-teal-200 bg-linear-to-br from-teal-700 via-teal-600 to-emerald-600 p-5 text-white shadow-lg shadow-teal-100">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-medium text-teal-50/80">현재 달성률</div>
                  <div className="mt-2 text-4xl font-semibold tracking-tight">{pct(calc.achievedRate)}</div>
                  <div className="mt-2 text-[11px] text-teal-50/80">생산량 / 예상 사용량</div>
                </div>
                <div className="rounded-2xl bg-white/15 p-3 ring-1 ring-white/20">
                  <Target className="h-5 w-5" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
            <Panel title="표준 검토 결과">
              <div className="space-y-5">
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="text-sm font-semibold">목표 생산량 vs 현재 생산량</div>
                      <div className="mt-1 text-xs text-slate-500">
                        PV를 우선 반영하고 부족 시 보완 설비를 추가하는 구조
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400">
                        최근 계산: {new Date(lastUpdated).toLocaleTimeString()}
                      </div>
                      <div className="text-xs text-slate-500">현재 생산량</div>
                      <div className="mt-1 text-xl font-semibold">{fmt(calc.totalProduction, 0)} kWh</div>
                    </div>
                  </div>
                  <div className="mt-5 h-4 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${status === '충족' ? 'bg-teal-600' : 'bg-amber-500'}`}
                      style={{
                        width: `${Math.min(
                          100,
                          calc.targetProduction > 0 ? (calc.totalProduction / calc.targetProduction) * 100 : 0,
                        )}%`,
                      }}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                    <span>0</span>
                    <span>목표 {fmt(calc.targetProduction, 0)} kWh</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Sun className="h-4 w-4 text-teal-700" /> 태양광
                    </div>
                    <div className="mt-3 text-xl font-semibold">{fmt(calc.pvKw)} kW</div>
                    <div className="mt-1 text-xs text-slate-500">생산량 {fmt(calc.pvProduction, 0)} kWh/yr</div>
                    <div className="mt-3 border-t border-slate-100 pt-3 text-[11px] leading-5 text-slate-500">
                      옥상 + 입면 기준 최대 설치 가능 용량 반영
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <GeothermalIcon className="h-4 w-4 text-teal-700" /> 지열히트펌프
                    </div>
                    <div className="mt-3 text-xl font-semibold">{fmt(geothermalKw)} kW</div>
                    <div className="mt-1 text-xs text-slate-500">
                      생산량 {fmt(calc.geothermalProduction, 0)} kWh/yr
                    </div>
                    <div className="mt-3 border-t border-slate-100 pt-3 text-[11px] leading-5 text-slate-500">
                      예상 천공 {fmt(calc.geothermalBoreholes, 0)}공 · 설치면적 {fmt(calc.geothermalEstimatedArea, 0)}㎡
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Zap className="h-4 w-4 text-teal-700" /> 연료전지
                    </div>
                    <div className="mt-3 text-xl font-semibold">{fmt(fuelCellKw)} kW</div>
                    <div className="mt-1 text-xs text-slate-500">
                      생산량 {fmt(calc.fuelCellProduction, 0)} kWh/yr
                    </div>
                    <div className="mt-3 border-t border-slate-100 pt-3 text-[11px] leading-5 text-slate-500">
                      폐열 온수 사용처 및 설치 공간 검토 필요
                    </div>
                  </div>
                </div>
              </div>
            </Panel>

            <Panel title="에너지원별 생산량 구성">
              <div className="space-y-4">
                <div className="h-72 rounded-xl border border-slate-200 bg-white p-3">
                  {calc.donutData.length > 0 ? (
                    <Doughnut data={doughnutChartData} options={doughnutOptions} />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-slate-400">
                      생산량이 있으면 도넛 차트가 표시됩니다.
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  {[
                    {
                      name: '태양광',
                      value: calc.pvProduction,
                      desc: `최대 용량 ${fmt(calc.pvMaxKw)} kW`,
                    },
                    {
                      name: '지열히트펌프',
                      value: calc.geothermalProduction,
                      desc: `예상 천공 ${fmt(calc.geothermalBoreholes, 0)} 공`,
                    },
                    {
                      name: '연료전지',
                      value: calc.fuelCellProduction,
                      desc: '폐열 온수·설치 공간 검토',
                    },
                  ].map((item, index) => (
                    <div key={item.name} className="rounded-xl border border-slate-200 bg-white p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <span
                              className="inline-block h-2.5 w-2.5 rounded-full"
                              style={{
                                backgroundColor: cfg.donutColors[index % cfg.donutColors.length],
                              }}
                            />
                            {item.name}
                          </div>
                          <div className="mt-1 text-[11px] text-slate-500">{item.desc}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold">{fmt(item.value, 0)} kWh</div>
                          <div className="mt-1 text-[11px] text-slate-500">
                            {pct(calc.donutTotal > 0 ? (item.value / calc.donutTotal) * 100 : 0, 1)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Panel>
          </div>
        </div>
      </div>

      <p className="text-center text-[10px] text-slate-400">
        * 본 화면은 UI·간이 산정 프리뷰이며, 실제 의무설치비율·법규 판단과는 무관합니다.
      </p>
    </div>
  );
}
