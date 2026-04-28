import { NextResponse } from 'next/server';

/**
 * 테스트용 직접 호출 라우트.
 * Gateway/DB 캐시 폴링을 우회하고 Python 분석 엔진(/calculate, /calculate-5grade, /optimize, /calculate-custom)을
 * 직접 호출해서 알고리즘 결과만 클라이언트로 반환한다.
 *
 * - 어떤 호출이 실패해도 라우트 자체는 200 OK로 응답한다 (calls[].success 로 개별 상태 확인).
 * - building_type 분기 처리 검증이 1차 목적.
 */

const PYTHON_BASE = process.env.ANALYSIS_ENGINE_URL || 'http://localhost:8000';

type CallResult = {
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

async function callPython(
  endpoint: string,
  init: RequestInit,
  calculationType: string,
  method: 'POST' | 'GET',
): Promise<CallResult> {
  const start = Date.now();
  try {
    const res = await fetch(`${PYTHON_BASE}${endpoint}`, {
      ...init,
      cache: 'no-store',
    });
    const text = await res.text();
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }
    const durationMs = Date.now() - start;
    if (!res.ok) {
      const detail =
        typeof data === 'object' && data && 'detail' in data
          ? String((data as Record<string, unknown>).detail)
          : text.slice(0, 200);
      return {
        calculationType,
        endpoint,
        method,
        success: false,
        durationMs,
        status: res.status,
        error: `HTTP ${res.status}: ${detail}`,
        response: data,
      };
    }
    const fromCache =
      typeof data === 'object' && data && 'from_cache' in data
        ? Boolean((data as Record<string, unknown>).from_cache)
        : undefined;
    return {
      calculationType,
      endpoint,
      method,
      success: true,
      durationMs,
      status: res.status,
      response: data,
      fromCache,
    };
  } catch (e: unknown) {
    return {
      calculationType,
      endpoint,
      method,
      success: false,
      durationMs: Date.now() - start,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

function normalizeRegion(region: string): string {
  // "서울(서울)" → "서울"
  return String(region || '')
    .replace(/\([^)]*\)/g, '')
    .trim();
}

const ALLOWED_BUILDING_TYPES = ['초중고', '업무시설_개별식', '업무시설_중앙식'];

function safeBuildingType(value: unknown): string {
  if (typeof value !== 'string') return '초중고';
  return ALLOWED_BUILDING_TYPES.includes(value) ? value : '초중고';
}

export async function POST(request: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Invalid JSON body' },
      { status: 400 },
    );
  }

  const step = String(body.step || '');
  const buildingType = safeBuildingType(body.buildingType);
  const region = normalizeRegion(String(body.region || ''));
  const totalArea = Number(body.totalArea) || 0;
  const floorCount = Number(body.floorCount) || 0;
  const targetGrade = body.targetGrade != null ? Number(body.targetGrade) : null;
  const performanceParams =
    typeof body.performanceParams === 'object' && body.performanceParams !== null
      ? (body.performanceParams as Record<string, unknown>)
      : {};

  const userInput = {
    세부지역: region,
    연면적: totalArea,
    지상층수: floorCount,
  };

  const jsonHeader = { 'Content-Type': 'application/json' };
  const calls: CallResult[] = [];

  if (step === 'step1') {
    // 1단계: 최소수준 + 예상5등급 병렬 호출
    const [r1, r2] = await Promise.all([
      callPython(
        '/calculate',
        {
          method: 'POST',
          headers: jsonHeader,
          body: JSON.stringify({ building_type: buildingType, user_input: userInput }),
        },
        '최소수준',
        'POST',
      ),
      callPython(
        '/calculate-5grade',
        {
          method: 'POST',
          headers: jsonHeader,
          body: JSON.stringify({ building_type: buildingType, user_input: userInput }),
        },
        '예상5등급',
        'POST',
      ),
    ]);
    calls.push(r1, r2);
  } else if (step === 'step2') {
    // 2단계: 1단계 + 최적화
    if (targetGrade == null) {
      return NextResponse.json(
        { ok: false, error: 'step2 requires targetGrade' },
        { status: 400 },
      );
    }
    const [r1, r2, r3] = await Promise.all([
      callPython(
        '/calculate',
        {
          method: 'POST',
          headers: jsonHeader,
          body: JSON.stringify({ building_type: buildingType, user_input: userInput }),
        },
        '최소수준',
        'POST',
      ),
      callPython(
        '/calculate-5grade',
        {
          method: 'POST',
          headers: jsonHeader,
          body: JSON.stringify({ building_type: buildingType, user_input: userInput }),
        },
        '예상5등급',
        'POST',
      ),
      callPython(
        '/optimize',
        {
          method: 'POST',
          headers: jsonHeader,
          body: JSON.stringify({
            building_type: buildingType,
            user_input: userInput,
            target_grade: `${targetGrade}등급`,
          }),
        },
        '최적화',
        'POST',
      ),
    ]);
    calls.push(r1, r2, r3);
  } else if (step === 'step3') {
    // 3단계: 성능조합 (GET /calculate-custom)
    if (targetGrade == null) {
      return NextResponse.json(
        { ok: false, error: 'step3 requires targetGrade' },
        { status: 400 },
      );
    }
    const params = new URLSearchParams({
      step: 'step3',
      buildingType,
      region,
      totalArea: String(totalArea),
      floorCount: String(floorCount),
      targetGrade: String(targetGrade),
    });
    Object.entries(performanceParams).forEach(([k, v]) => {
      if (v !== null && v !== undefined && v !== '') {
        params.set(k, String(v));
      }
    });
    const r = await callPython(
      `/calculate-custom?${params.toString()}`,
      { method: 'GET' },
      '성능조합',
      'GET',
    );
    calls.push(r);
  } else {
    return NextResponse.json(
      { ok: false, error: `Unknown step: ${step}` },
      { status: 400 },
    );
  }

  return NextResponse.json({
    ok: true,
    step,
    buildingType,
    region,
    totalArea,
    floorCount,
    targetGrade,
    pythonBase: PYTHON_BASE,
    calls,
    summary: {
      total: calls.length,
      success: calls.filter((c) => c.success).length,
      failed: calls.filter((c) => !c.success).length,
      totalDurationMs: calls.reduce((sum, c) => sum + c.durationMs, 0),
    },
  });
}
