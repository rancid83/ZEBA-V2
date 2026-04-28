'use client';

import { useState } from 'react';
import { analyzeStep1 } from '@/services/steps';
import { resolveBuildingType, BUILDING_TYPES, type BuildingType } from '@/utils/buildingType';

type StepKey = 'step1' | 'step2' | 'step3';
type Mode = 'direct' | 'gateway';

type DirectCall = {
  calculationType: string;
  endpoint: string;
  method: 'POST' | 'GET';
  success: boolean;
  durationMs: number;
  status?: number;
  response?: unknown;
  error?: string;
  fromCache?: boolean;
};

type DirectResponse = {
  ok: boolean;
  step?: StepKey;
  buildingType?: BuildingType;
  calls?: DirectCall[];
  summary?: { total: number; success: number; failed: number; totalDurationMs: number };
  error?: string;
};

type CallLog = {
  id: number;
  mode: Mode;
  step: StepKey;
  buildingType: BuildingType;
  request: Record<string, unknown>;
  response: unknown;
  error: string | null;
  durationMs: number;
  timestamp: string;
  // direct 모드일 때 개별 알고리즘 호출 결과
  directCalls?: DirectCall[];
};

const REGION_PRESETS = [
  '서울(서울)',
  '광주(광주)',
  '인천(인천)',
  '대전(대전)',
  '부산(부산)',
];

const STEP3_PERFORMANCE_DEFAULTS = {
  windowUValue: 1.5,
  wallUValue: 0.24,
  roofUValue: 0.15,
  floorUValue: 0.22,
  ehpCooling: 4.5,
  ehpHeating: 3.8,
  lightingDensity: 8,
  installationCapacity: 30,
  generationEfficiency: 18,
};

const PRESETS: Array<{
  label: string;
  buildingType: BuildingType;
  usage: string;
  officeSystem: 'individual' | 'central';
  region: string;
  totalArea: number;
  floorCount: number;
  targetGrade: number;
}> = [
  {
    label: '초중고 · 서울 · 5,000㎡ · 3층',
    buildingType: '초중고',
    usage: '교육연구시설',
    officeSystem: 'individual',
    region: '서울(서울)',
    totalArea: 5000,
    floorCount: 3,
    targetGrade: 4,
  },
  {
    label: '업무시설(개별식) · 광주 · 12,000㎡ · 10층',
    buildingType: '업무시설_개별식',
    usage: '업무시설(공공용)',
    officeSystem: 'individual',
    region: '광주(광주)',
    totalArea: 12000,
    floorCount: 10,
    targetGrade: 4,
  },
  {
    label: '업무시설(중앙식) · 부산 · 20,000㎡ · 15층',
    buildingType: '업무시설_중앙식',
    usage: '업무시설(사업용)',
    officeSystem: 'central',
    region: '부산(부산)',
    totalArea: 20000,
    floorCount: 15,
    targetGrade: 3,
  },
];

const BUILDING_TYPE_COLOR: Record<BuildingType, string> = {
  초중고: 'bg-sky-100 text-sky-800 border-sky-200',
  업무시설_개별식: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  업무시설_중앙식: 'bg-violet-100 text-violet-800 border-violet-200',
};

const STEP_COLOR: Record<StepKey, string> = {
  step1: 'bg-slate-700 hover:bg-slate-800',
  step2: 'bg-teal-700 hover:bg-teal-800',
  step3: 'bg-amber-700 hover:bg-amber-800',
};

export default function TestZebStepPage() {
  const [mode, setMode] = useState<Mode>('direct');
  const [region, setRegion] = useState<string>('서울(서울)');
  const [totalArea, setTotalArea] = useState<number>(5000);
  const [floorCount, setFloorCount] = useState<number>(3);
  const [buildingType, setBuildingType] = useState<BuildingType>('초중고');
  const [targetGrade, setTargetGrade] = useState<number>(4);
  const [usage, setUsage] = useState<string>('교육연구시설');
  const [officeSystem, setOfficeSystem] = useState<'individual' | 'central'>('individual');
  const [logs, setLogs] = useState<CallLog[]>([]);
  const [pending, setPending] = useState<StepKey | null>(null);

  const resolvedFromUiInputs = resolveBuildingType(usage, officeSystem);

  const applyPreset = (preset: (typeof PRESETS)[number]) => {
    setBuildingType(preset.buildingType);
    setUsage(preset.usage);
    setOfficeSystem(preset.officeSystem);
    setRegion(preset.region);
    setTotalArea(preset.totalArea);
    setFloorCount(preset.floorCount);
    setTargetGrade(preset.targetGrade);
  };

  const callStep = async (step: StepKey) => {
    setPending(step);
    const start = Date.now();
    const baseRequest: Record<string, unknown> = {
      step,
      region,
      totalArea,
      floorCount,
      buildingType,
    };
    if (step === 'step2' || step === 'step3') {
      baseRequest.targetGrade = targetGrade;
    }
    if (step === 'step3') {
      baseRequest.performanceParams = STEP3_PERFORMANCE_DEFAULTS;
    }

    let response: unknown = null;
    let error: string | null = null;
    let directCalls: DirectCall[] | undefined;

    try {
      if (mode === 'direct') {
        const res = await fetch('/api/zeb-direct', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(baseRequest),
        });
        const data: DirectResponse = await res.json();
        response = data;
        directCalls = data.calls;
        if (!data.ok && data.error) error = data.error;
      } else {
        // gateway 경유 (성능조합 파라미터는 step3에서 펼쳐서 보냄)
        const gwRequest: Record<string, unknown> = { ...baseRequest };
        if (step === 'step3') {
          delete gwRequest.performanceParams;
          Object.assign(gwRequest, STEP3_PERFORMANCE_DEFAULTS);
        }
        response = await analyzeStep1.get(gwRequest);
      }
    } catch (err: unknown) {
      error = err instanceof Error ? err.message : String(err);
    }

    setLogs((prev) => [
      {
        id: Date.now(),
        mode,
        step,
        buildingType,
        request: baseRequest,
        response,
        error,
        directCalls,
        durationMs: Date.now() - start,
        timestamp: new Date().toLocaleTimeString('ko-KR'),
      },
      ...prev,
    ]);
    setPending(null);
  };

  const clearLogs = () => setLogs([]);

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="mx-auto w-full max-w-[1280px] space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">
            ZEB Step API 분기 테스트
          </h1>
          <p className="text-sm text-slate-600">
            buildingType별 알고리즘 분기 처리가 전체 레이어에 걸쳐 동작하는지 단계별로
            호출하며 확인하는 페이지입니다. 어떤 호출이 실패해도 결과는 계속 표시됩니다.
          </p>
        </header>

        {/* 모드 선택 */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-bold text-slate-900">호출 모드</h2>
          <div className="grid gap-2 md:grid-cols-2">
            <button
              type="button"
              onClick={() => setMode('direct')}
              className={`rounded-xl border p-4 text-left transition ${
                mode === 'direct'
                  ? 'border-teal-400 bg-teal-50 shadow-sm ring-2 ring-teal-100'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={mode === 'direct'}
                  readOnly
                  className="accent-teal-600"
                />
                <span className="text-sm font-bold text-slate-900">
                  Python 직접 호출 (권장)
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-600">
                <code>/api/zeb-direct</code> → Python <code>:8000</code> 직결. Gateway/DB
                폴링을 우회하므로 알고리즘 결과만 빠르게 확인 가능. 부분 실패도 결과 표시.
              </p>
            </button>
            <button
              type="button"
              onClick={() => setMode('gateway')}
              className={`rounded-xl border p-4 text-left transition ${
                mode === 'gateway'
                  ? 'border-amber-400 bg-amber-50 shadow-sm ring-2 ring-amber-100'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={mode === 'gateway'}
                  readOnly
                  className="accent-amber-600"
                />
                <span className="text-sm font-bold text-slate-900">
                  Gateway 경유
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-600">
                <code>/api/zeb</code> → Gateway → Python. DB 캐시/폴링 포함. 운영 경로
                검증용. DB 이슈 시 실패 가능.
              </p>
            </button>
          </div>
        </section>

        {/* 프리셋 */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-bold text-slate-900">프리셋</h2>
          <div className="grid gap-2 md:grid-cols-3">
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => applyPreset(preset)}
                className={`rounded-xl border p-3 text-left text-sm transition hover:shadow ${BUILDING_TYPE_COLOR[preset.buildingType]}`}
              >
                <div className="text-[11px] font-bold opacity-80">{preset.buildingType}</div>
                <div className="mt-1 font-semibold">{preset.label}</div>
              </button>
            ))}
          </div>
        </section>

        {/* 입력 영역 */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-bold text-slate-900">입력 파라미터</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Field label="buildingType (직접 지정)">
              <select
                value={buildingType}
                onChange={(e) => setBuildingType(e.target.value as BuildingType)}
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
              >
                {BUILDING_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="region (세부지역)">
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
              >
                {REGION_PRESETS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="totalArea (연면적 ㎡)">
              <input
                type="number"
                value={totalArea}
                onChange={(e) => setTotalArea(Number(e.target.value) || 0)}
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
              />
            </Field>
            <Field label="floorCount (지상층수)">
              <input
                type="number"
                value={floorCount}
                onChange={(e) => setFloorCount(Number(e.target.value) || 0)}
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
              />
            </Field>
            <Field label="targetGrade (목표등급, step2/3)">
              <select
                value={targetGrade}
                onChange={(e) => setTargetGrade(Number(e.target.value))}
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
              >
                <option value={3}>3등급</option>
                <option value={4}>4등급</option>
                <option value={5}>5등급</option>
              </select>
            </Field>
            <Field label="usage (UI 입력 시뮬레이션)">
              <select
                value={usage}
                onChange={(e) => setUsage(e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
              >
                <option value="교육연구시설">교육연구시설</option>
                <option value="업무시설(공공용)">업무시설(공공용)</option>
                <option value="업무시설(사업용)">업무시설(사업용)</option>
              </select>
            </Field>
            <Field label="officeSystem (UI 입력 시뮬레이션)">
              <select
                value={officeSystem}
                onChange={(e) =>
                  setOfficeSystem(e.target.value as 'individual' | 'central')
                }
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
              >
                <option value="individual">개별식</option>
                <option value="central">중앙식</option>
              </select>
            </Field>
            <Field label="resolveBuildingType() 결과">
              <div className="flex h-10 items-center gap-2">
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-bold ${BUILDING_TYPE_COLOR[resolvedFromUiInputs]}`}
                >
                  {resolvedFromUiInputs}
                </span>
                <button
                  type="button"
                  onClick={() => setBuildingType(resolvedFromUiInputs)}
                  disabled={buildingType === resolvedFromUiInputs}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
                >
                  적용
                </button>
              </div>
            </Field>
          </div>
        </section>

        {/* 액션 버튼 */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Step API 호출</h2>
            <span className="text-xs text-slate-500">
              현재 모드:{' '}
              <span className={`font-bold ${mode === 'direct' ? 'text-teal-700' : 'text-amber-700'}`}>
                {mode === 'direct' ? 'Python 직접' : 'Gateway 경유'}
              </span>
            </span>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <StepButton
              step="step1"
              label="Step 1 — 사전 진단"
              hint="최소수준 + 예상5등급 병렬 호출"
              pending={pending === 'step1'}
              disabled={pending !== null}
              onClick={() => callStep('step1')}
            />
            <StepButton
              step="step2"
              label="Step 2 — 목표 설정"
              hint="최소수준 + 예상5등급 + 최적화"
              pending={pending === 'step2'}
              disabled={pending !== null}
              onClick={() => callStep('step2')}
            />
            <StepButton
              step="step3"
              label="Step 3 — 성능 편집"
              hint="성능조합 (default 파라미터)"
              pending={pending === 'step3'}
              disabled={pending !== null}
              onClick={() => callStep('step3')}
            />
          </div>
          {pending ? (
            <p className="mt-3 text-xs text-slate-500">
              ⏳ {pending} 호출 중… (분석 엔진 미스 시 최대 ~2분)
            </p>
          ) : null}
        </section>

        {/* 호출 로그 */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              호출 로그 ({logs.length})
            </h2>
            <button
              type="button"
              onClick={clearLogs}
              disabled={logs.length === 0}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
            >
              로그 초기화
            </button>
          </div>
          {logs.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-400">
              호출 로그가 없습니다. 위 버튼을 눌러 Step API를 호출해보세요.
            </p>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <LogCard key={log.id} log={log} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-slate-600">{label}</label>
      {children}
    </div>
  );
}

function StepButton({
  step,
  label,
  hint,
  pending,
  disabled,
  onClick,
}: {
  step: StepKey;
  label: string;
  hint: string;
  pending: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex flex-col items-start gap-1 rounded-xl px-4 py-3 text-left text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${STEP_COLOR[step]}`}
    >
      <div className="text-sm font-bold">
        {pending ? `⏳ ${step} 호출 중…` : label}
      </div>
      <div className="text-[11px] opacity-80">{hint}</div>
    </button>
  );
}

function LogCard({ log }: { log: CallLog }) {
  const [expanded, setExpanded] = useState(false);

  // direct 모드: directCalls 기준 성공 여부
  // gateway 모드: error 유무로 판단
  const allSuccess =
    log.mode === 'direct'
      ? !!log.directCalls && log.directCalls.every((c) => c.success) && !log.error
      : !log.error;
  const partialFailure =
    log.mode === 'direct' &&
    !!log.directCalls &&
    log.directCalls.some((c) => c.success) &&
    log.directCalls.some((c) => !c.success);

  const tone = allSuccess
    ? 'border-emerald-200 bg-emerald-50/40'
    : partialFailure
      ? 'border-amber-300 bg-amber-50/40'
      : 'border-rose-200 bg-rose-50/40';

  return (
    <div className={`rounded-xl border p-4 ${tone}`}>
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
            log.mode === 'direct' ? 'bg-teal-200 text-teal-900' : 'bg-amber-200 text-amber-900'
          }`}
        >
          {log.mode === 'direct' ? 'DIRECT' : 'GATEWAY'}
        </span>
        <span
          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
            log.step === 'step1'
              ? 'bg-slate-200 text-slate-800'
              : log.step === 'step2'
                ? 'bg-teal-200 text-teal-800'
                : 'bg-amber-200 text-amber-800'
          }`}
        >
          {log.step.toUpperCase()}
        </span>
        <span
          className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${BUILDING_TYPE_COLOR[log.buildingType]}`}
        >
          {log.buildingType}
        </span>
        <span className="text-xs text-slate-500">{log.timestamp}</span>
        <span className="text-xs font-semibold text-slate-700">{log.durationMs}ms</span>
        <span
          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
            allSuccess
              ? 'bg-emerald-200 text-emerald-800'
              : partialFailure
                ? 'bg-amber-300 text-amber-900'
                : 'bg-rose-200 text-rose-800'
          }`}
        >
          {allSuccess ? 'SUCCESS' : partialFailure ? 'PARTIAL' : 'ERROR'}
        </span>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="ml-auto rounded-lg border border-slate-200 bg-white px-2.5 py-0.5 text-[10px] text-slate-600 hover:bg-slate-50"
        >
          {expanded ? '접기' : '펼치기'}
        </button>
      </div>
      {log.error ? (
        <p className="mt-2 text-xs font-semibold text-rose-700">{log.error}</p>
      ) : null}

      {/* direct 모드: 개별 호출 결과 인라인 표시 */}
      {log.directCalls && log.directCalls.length > 0 ? (
        <div className="mt-3 space-y-2">
          {log.directCalls.map((c, i) => (
            <DirectCallRow key={`${log.id}-${i}`} call={c} expanded={expanded} />
          ))}
        </div>
      ) : null}

      {/* gateway 모드: REQUEST/RESPONSE 펼치기 */}
      {expanded && !log.directCalls ? (
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <pre className="max-h-[300px] overflow-auto rounded-lg bg-slate-900 p-3 text-[10px] leading-4 text-slate-100">
            <div className="mb-1 font-bold text-slate-400">REQUEST</div>
            {JSON.stringify(log.request, null, 2)}
          </pre>
          <pre className="max-h-[300px] overflow-auto rounded-lg bg-slate-900 p-3 text-[10px] leading-4 text-slate-100">
            <div className="mb-1 font-bold text-slate-400">RESPONSE</div>
            {JSON.stringify(log.response, null, 2)}
          </pre>
        </div>
      ) : null}
    </div>
  );
}

function DirectCallRow({ call, expanded }: { call: DirectCall; expanded: boolean }) {
  const result =
    typeof call.response === 'object' && call.response !== null && 'result' in call.response
      ? (call.response as { result: Record<string, unknown> }).result
      : null;

  return (
    <div
      className={`rounded-lg border bg-white p-3 ${
        call.success ? 'border-emerald-100' : 'border-rose-200'
      }`}
    >
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
            call.success ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
          }`}
        >
          {call.success ? '✓' : '✗'}
        </span>
        <span className="font-bold text-slate-900">{call.calculationType}</span>
        <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-700">
          {call.method} {call.endpoint.split('?')[0]}
        </span>
        <span className="text-slate-500">{call.durationMs}ms</span>
        {call.fromCache ? (
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">
            CACHED
          </span>
        ) : null}
        {call.status ? (
          <span className="text-slate-500">HTTP {call.status}</span>
        ) : null}
      </div>
      {call.error ? (
        <p className="mt-2 text-xs font-semibold text-rose-700">{call.error}</p>
      ) : null}
      {result ? (
        <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-4">
          {Object.entries(result).map(([k, v]) => (
            <div key={k} className="rounded bg-slate-50 px-2 py-1">
              <div className="text-[10px] font-bold text-slate-500">{k}</div>
              <div className="text-xs font-bold text-slate-900">
                {typeof v === 'number' ? v.toFixed(3) : String(v)}
              </div>
            </div>
          ))}
        </div>
      ) : null}
      {expanded ? (
        <pre className="mt-2 max-h-[240px] overflow-auto rounded bg-slate-900 p-2 text-[10px] leading-4 text-slate-100">
          {JSON.stringify(call.response, null, 2)}
        </pre>
      ) : null}
    </div>
  );
}
