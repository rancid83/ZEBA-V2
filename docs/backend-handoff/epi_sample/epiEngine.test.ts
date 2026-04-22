/**
 * epiEngine.test.ts
 *
 * 엔진 로직 단위 테스트 (Jest / Vitest 모두 호환)
 * 실행: npx vitest  or  npx jest
 */

import { describe, expect, it } from 'vitest';
import {
  buildEmptyInputs,
  buildStandardInputs,
  calcAchievementRate,
  calcItemScore,
  calculateEpi,
  classifyBuildingSize,
  getBenchmarkScore,
  getBaseScore,
  getStandardScore,
} from '../engine/epiEngine';
import type { BuildingInfo, EpiItem } from '../types/epi.types';

// ─────────────────────────────────────────────
// 1. 건물 규모 분류
// ─────────────────────────────────────────────

describe('classifyBuildingSize', () => {
  it('3000 이상 → large', () => {
    expect(classifyBuildingSize(3000)).toBe('large');
    expect(classifyBuildingSize(5000)).toBe('large');
  });
  it('3000 미만 → small', () => {
    expect(classifyBuildingSize(2999)).toBe('small');
    expect(classifyBuildingSize(500)).toBe('small');
  });
});

// ─────────────────────────────────────────────
// 2. 기본배점 조회
// ─────────────────────────────────────────────

describe('getBaseScore', () => {
  const item: EpiItem = {
    no: 1,
    name: '테스트',
    scoreType: 'graded',
    baseScore: { large: 21, small: 34, house1: 31, house2: 28 },
    standardScore: { largeCentral: 16.8, largeIndividual: 16.8, largeRatio: 0.8, smallCentral: 27.2, smallIndividual: 27.2, smallRatio: 0.8 },
  };

  it('비주거 + 대형 → large 배점', () =>
    expect(getBaseScore(item, 'nonResidential', 'large')).toBe(21));
  it('비주거 + 소형 → small 배점', () =>
    expect(getBaseScore(item, 'nonResidential', 'small')).toBe(34));
  it('house1 → house1 배점', () =>
    expect(getBaseScore(item, 'house1', 'large')).toBe(31));
  it('house2 → house2 배점', () =>
    expect(getBaseScore(item, 'house2', 'small')).toBe(28));
});

// ─────────────────────────────────────────────
// 3. 항목별 점수 계산
// ─────────────────────────────────────────────

describe('calcItemScore', () => {
  const gradedItem: EpiItem = {
    no: 1,
    name: '외벽의 평균 열관류율',
    scoreType: 'graded',
    baseScore: { large: 21, small: 34, house1: 31, house2: 28 },
    standardScore: { largeCentral: 16.8, largeIndividual: 16.8, largeRatio: 0.8, smallCentral: 27.2, smallIndividual: 27.2, smallRatio: 0.8 },
  };
  const boolItem: EpiItem = {
    no: 7,
    name: '덕트 및 배관 단열 적용',
    scoreType: 'boolean',
    baseScore: { large: 2, small: 1, house1: 2, house2: 2 },
    standardScore: { largeCentral: 2, largeIndividual: 2, largeRatio: 1.0, smallCentral: 1, smallIndividual: 1, smallRatio: 1.0 },
  };

  it('graded: 21 × 0.8 = 16.8', () =>
    expect(calcItemScore(21, gradedItem, { value: 0.8 })).toBe(16.8));
  it('graded: 21 × 1.0 = 21', () =>
    expect(calcItemScore(21, gradedItem, { value: 1 })).toBe(21));
  it('graded: 미입력 → 0', () =>
    expect(calcItemScore(21, gradedItem, { value: null })).toBe(0));
  it('boolean: 적용 → 기본배점 전액', () =>
    expect(calcItemScore(2, boolItem, { value: true })).toBe(2));
  it('boolean: 미적용 → 0', () =>
    expect(calcItemScore(2, boolItem, { value: false })).toBe(0));
});

// ─────────────────────────────────────────────
// 4. 표준모델 기준점수 검증
// ─────────────────────────────────────────────

describe('getBenchmarkScore', () => {
  it('대형 중앙식 → 65.4', () =>
    expect(getBenchmarkScore('large', 'central')).toBe(65.4));
  it('대형 개별식 → 65.8', () =>
    expect(getBenchmarkScore('large', 'individual')).toBe(65.8));
  it('소형 중앙식 → 71.6', () =>
    expect(getBenchmarkScore('small', 'central')).toBe(71.6));
  it('소형 개별식 → 71.0', () =>
    expect(getBenchmarkScore('small', 'individual')).toBe(71.0));
});

// ─────────────────────────────────────────────
// 5. 표준모델 inputs 빌드 후 계산 결과 검증
// ─────────────────────────────────────────────

describe('표준모델 기본값 계산 검증', () => {
  const testCases: Array<{
    label: string;
    info: BuildingInfo;
    expected: number;
    tolerance: number;
  }> = [
    {
      label: '대형 중앙식',
      info: { area: 5000, buildingUse: 'nonResidential', hvacType: 'central' },
      expected: 65.4,
      tolerance: 2,
    },
    {
      label: '대형 개별식',
      info: { area: 5000, buildingUse: 'nonResidential', hvacType: 'individual' },
      expected: 65.8,
      tolerance: 2,
    },
    {
      label: '소형 중앙식',
      info: { area: 1000, buildingUse: 'nonResidential', hvacType: 'central' },
      expected: 71.6,
      tolerance: 2,
    },
    {
      label: '소형 개별식',
      info: { area: 1000, buildingUse: 'nonResidential', hvacType: 'individual' },
      expected: 71.0,
      tolerance: 2,
    },
  ];

  testCases.forEach(({ label, info, expected, tolerance }) => {
    it(`${label}: 표준모델 점수 ≈ ${expected}점 (±${tolerance})`, () => {
      const sizeType = classifyBuildingSize(info.area);
      const stdInputs = buildStandardInputs(sizeType, info.hvacType);
      const result = calculateEpi(info, stdInputs);
      expect(Math.abs(result.totalEarned - expected)).toBeLessThanOrEqual(tolerance);
    });
  });
});

// ─────────────────────────────────────────────
// 6. 달성률 계산
// ─────────────────────────────────────────────

describe('calcAchievementRate', () => {
  it('65.4 / 65.4 = 100%', () =>
    expect(calcAchievementRate(65.4, 65.4)).toBe(100));
  it('32.7 / 65.4 ≈ 50%', () =>
    expect(calcAchievementRate(32.7, 65.4)).toBe(50));
  it('기준점수 0 → 0%', () =>
    expect(calcAchievementRate(10, 0)).toBe(0));
});

// ─────────────────────────────────────────────
// 7. 빈 inputs 초기화
// ─────────────────────────────────────────────

describe('buildEmptyInputs', () => {
  it('모든 항목 value === null', () => {
    const inputs = buildEmptyInputs();
    for (const section of Object.values(inputs)) {
      for (const item of Object.values(section)) {
        expect(item.value).toBeNull();
      }
    }
  });
  it('전체 취득점수 = 0', () => {
    const info: BuildingInfo = {
      area: 3000,
      buildingUse: 'nonResidential',
      hvacType: 'central',
    };
    const result = calculateEpi(info, buildEmptyInputs());
    expect(result.totalEarned).toBe(0);
  });
});
