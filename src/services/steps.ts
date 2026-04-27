import type { ZebStep1Response } from '@/types/zebStep1';

const ZEB_PROXY_BASE = '/api/zeb';

function buildStepParams(params: Record<string, unknown>, step: string): Record<string, unknown> {
  const { step: _step, ...rest } = params;

  if (step === 'step1') {
    return {
      region: rest.region,
      totalArea: rest.totalArea,
      floorCount: rest.floorCount,
    };
  }

  if (step === 'step2') {
    return {
      region: rest.region,
      totalArea: rest.totalArea,
      floorCount: rest.floorCount,
      targetGrade: rest.targetGrade,
    };
  }

  const filtered: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(rest)) {
    if (value !== undefined && value !== null) {
      filtered[key] = value;
    }
  }
  return filtered;
}

function normalizeResponse(raw: unknown): ZebStep1Response {
  if (raw && typeof raw === 'object' && 'status' in raw && 'data' in raw) {
    return raw as ZebStep1Response;
  }
  return {
    status: true,
    data: raw as ZebStep1Response['data'],
    timestamp: new Date().toISOString(),
  };
}

export const analyzeStep1 = {
  get: async (params?: Record<string, unknown>): Promise<ZebStep1Response> => {
    try {
      const step = (params?.step as string) || 'step1';
      const queryParams = buildStepParams(params ?? {}, step);

      const searchParams = new URLSearchParams({ step });
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.set(key, String(value));
        }
      });

      const response = await fetch(`${ZEB_PROXY_BASE}?${searchParams.toString()}`, {
        cache: 'no-store',
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error((errorBody as any)?.error || '분석 요청에 실패했습니다.');
      }

      const result = await response.json();
      return normalizeResponse(result);
    } catch (error) {
      console.error('ZEB Step API 호출 에러:', error);
      throw error;
    }
  },
};
