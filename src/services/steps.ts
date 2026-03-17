import apiInstance from '@/services/api';
import type { ZebStep1Response } from '@/types/zebStep1';

const ZEB_API_BASE = '/admin/api/zeb';

/**
 * 백엔드 Swagger 스펙에 맞춘 ZEB 단계별 API
 * - step1: GET /admin/api/zeb/step1 (region, totalArea, floorCount)
 * - step2: GET /admin/api/zeb/step2 (+ targetGrade)
 * - step3: GET /admin/api/zeb/step3 (+ 성능 조합 선택 파라미터)
 */
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

  // step3: 필수 + 선택(성능 조합) 파라미터만 전달 (undefined/null 제외)
  const filtered: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(rest)) {
    if (value !== undefined && value !== null) {
      filtered[key] = value;
    }
  }
  return filtered;
}

/** 백엔드가 등급·성능 데이터만 반환할 경우 { status, data } 형태로 정규화 */
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
      const path = `${ZEB_API_BASE}/${step}`;
      const queryParams = buildStepParams(params ?? {}, step);

      const response = await apiInstance.get(path, { params: queryParams });
      return normalizeResponse(response);
    } catch (error) {
      console.error('ZEB Step API 호출 에러:', error);
      throw error;
    }
  },
};
