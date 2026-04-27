/**
 * EPI 배점 계산 엔진
 *
 * 주요 책임:
 *  1. 면적 → 건물 규모 분류 (대형/소형)
 *  2. 건물 유형 + 냉난방 방식 → 기본배점(a) 선택
 *  3. 항목별 취득점수 계산 (graded / boolean)
 *  4. 부문별 / 전체 합산
 *  5. 표준모델 점수 참조 및 비교
 */

import { EPI_DATA, SECTION_LABELS, STANDARD_BENCHMARKS } from '../data/epiData';
import type {
  BuildingInfo,
  BuildingSizeType,
  BuildingUseType,
  ChecklistInputs,
  EpiItem,
  EpiResult,
  GradedRatio,
  HvacType,
  ItemInput,
  ItemResult,
  SectionKey,
  SectionResult,
} from '../types/epi.types';

// ─────────────────────────────────────────────
// 1. 건물 규모 분류
// ─────────────────────────────────────────────

/**
 * 연면적(㎡) → 대형/소형 분류
 * - 3,000㎡ 이상 → large
 * - 500~3,000㎡ 미만 → small
 */
export function classifyBuildingSize(area: number): BuildingSizeType {
  return area >= 3000 ? 'large' : 'small';
}

// ─────────────────────────────────────────────
// 2. 기본배점(a) 조회
// ─────────────────────────────────────────────

/**
 * 건물 용도에 따라 해당 항목의 기본배점(a)을 반환
 */
export function getBaseScore(
  item: EpiItem,
  buildingUse: BuildingUseType,
  sizeType: BuildingSizeType,
): number | null {
  // 비주거는 면적 기반으로 large/small 분기
  if (buildingUse === 'nonResidential') {
    return sizeType === 'large' ? item.baseScore.large : item.baseScore.small;
  }
  if (buildingUse === 'house1') return item.baseScore.house1;
  if (buildingUse === 'house2') return item.baseScore.house2;
  return null;
}

// ─────────────────────────────────────────────
// 3. 표준모델 점수 조회
// ─────────────────────────────────────────────

/**
 * 건물 규모 + 냉난방 방식 → 표준모델 취득점수 조회
 */
export function getStandardScore(
  item: EpiItem,
  sizeType: BuildingSizeType,
  hvacType: HvacType,
): number | null {
  const s = item.standardScore;
  if (sizeType === 'large') {
    return hvacType === 'central' ? s.largeCentral : s.largeIndividual;
  }
  return hvacType === 'central' ? s.smallCentral : s.smallIndividual;
}

/**
 * 건물 규모 + 냉난방 방식 → 표준모델 배점비율(b) 조회
 */
export function getStandardRatio(
  item: EpiItem,
  sizeType: BuildingSizeType,
): number | null {
  return sizeType === 'large'
    ? item.standardScore.largeRatio
    : item.standardScore.smallRatio;
}

// ─────────────────────────────────────────────
// 4. 항목별 취득점수 계산
// ─────────────────────────────────────────────

/**
 * 단일 항목 취득점수 계산
 *
 * @param baseScore - 해당 유형의 기본배점(a)
 * @param item      - EPI 항목 데이터
 * @param input     - 사용자 입력 (비율 or boolean or null)
 * @returns 취득점수 (소수점 2자리 반올림)
 */
export function calcItemScore(
  baseScore: number,
  item: EpiItem,
  input: ItemInput,
): number {
  if (input.value === null || input.value === undefined) return 0;

  if (item.scoreType === 'graded') {
    const ratio = input.value as GradedRatio;
    return Math.round(baseScore * ratio * 100) / 100;
  }

  // boolean
  return input.value === true ? baseScore : 0;
}

// ─────────────────────────────────────────────
// 5. 전체 계산
// ─────────────────────────────────────────────

/**
 * EPI 전체 점수 계산
 *
 * @param buildingInfo - 건물 기본 정보 (면적, 용도, 냉난방방식)
 * @param inputs       - 항목별 사용자 입력
 * @returns EpiResult  - 부문별 + 전체 계산 결과
 */
export function calculateEpi(
  buildingInfo: BuildingInfo,
  inputs: ChecklistInputs,
): EpiResult {
  const sizeType = classifyBuildingSize(buildingInfo.area);
  const { buildingUse, hvacType } = buildingInfo;

  const sections: SectionResult[] = EPI_DATA.map((sectionData) => {
    const sectionKey = sectionData.section as SectionKey;
    const sectionInputs = inputs[sectionKey] ?? {};

    const itemResults: ItemResult[] = sectionData.items.map((item) => {
      const base = getBaseScore(item, buildingUse, sizeType);
      const standardScore = getStandardScore(item, sizeType, hvacType);
      const isApplicable = base !== null;

      const input: ItemInput = sectionInputs[item.no] ?? { value: null };
      const earned = isApplicable ? calcItemScore(base!, item, input) : 0;

      return {
        no: item.no,
        name: item.name,
        scoreType: item.scoreType,
        baseScore: base ?? 0,
        earnedScore: earned,
        standardScore,
        inputValue: input.value ?? null,
        isApplicable,
      };
    });

    const totalBase = itemResults.reduce((sum, r) => sum + r.baseScore, 0);
    const totalEarned = Math.round(
      itemResults.reduce((sum, r) => sum + r.earnedScore, 0) * 100,
    ) / 100;

    const stdScores = itemResults
      .map((r) => r.standardScore)
      .filter((s): s is number => s !== null);
    const totalStandard =
      stdScores.length > 0
        ? Math.round(stdScores.reduce((a, b) => a + b, 0) * 100) / 100
        : null;

    return {
      section: sectionKey,
      sectionLabel: SECTION_LABELS[sectionKey],
      items: itemResults,
      totalBase,
      totalEarned,
      totalStandard,
    };
  });

  const totalBase = sections.reduce((s, r) => s + r.totalBase, 0);
  const totalEarned = Math.round(
    sections.reduce((s, r) => s + r.totalEarned, 0) * 100,
  ) / 100;

  const stdSums = sections
    .map((r) => r.totalStandard)
    .filter((s): s is number => s !== null);
  const totalStandard =
    stdSums.length > 0
      ? Math.round(stdSums.reduce((a, b) => a + b, 0) * 100) / 100
      : null;

  return {
    buildingInfo,
    sizeType,
    sections,
    totalBase,
    totalEarned,
    totalStandard,
    standardBenchmark: { ...STANDARD_BENCHMARKS },
  };
}

// ─────────────────────────────────────────────
// 6. 헬퍼 유틸리티
// ─────────────────────────────────────────────

/**
 * 현재 건물 유형의 표준모델 기준점수 반환
 */
export function getBenchmarkScore(
  sizeType: BuildingSizeType,
  hvacType: HvacType,
): number {
  if (sizeType === 'large') {
    return hvacType === 'central'
      ? STANDARD_BENCHMARKS.largeCentral
      : STANDARD_BENCHMARKS.largeIndividual;
  }
  return hvacType === 'central'
    ? STANDARD_BENCHMARKS.smallCentral
    : STANDARD_BENCHMARKS.smallIndividual;
}

/**
 * 표준모델 대비 달성률 (%) 계산
 */
export function calcAchievementRate(
  earnedScore: number,
  benchmarkScore: number,
): number {
  if (benchmarkScore === 0) return 0;
  return Math.round((earnedScore / benchmarkScore) * 1000) / 10;
}

/**
 * 입력값 없이 표준모델 점수를 기본값으로 채운 초기 inputs 생성
 * (표준모델 기준으로 미리 채워놓고 싶을 때 사용)
 */
export function buildStandardInputs(
  sizeType: BuildingSizeType,
  hvacType: HvacType,
): ChecklistInputs {
  const result: Partial<ChecklistInputs> = {};

  for (const sectionData of EPI_DATA) {
    const sectionKey = sectionData.section as SectionKey;
    const sectionMap: Record<number, ItemInput> = {};

    for (const item of sectionData.items) {
      const ratio = getStandardRatio(item, sizeType);
      const stdScore = getStandardScore(item, sizeType, hvacType);

      if (item.scoreType === 'graded' && ratio !== null) {
        sectionMap[item.no] = { value: ratio as GradedRatio };
      } else if (item.scoreType === 'boolean' && stdScore !== null) {
        sectionMap[item.no] = { value: stdScore > 0 };
      } else {
        sectionMap[item.no] = { value: null };
      }
    }

    result[sectionKey] = sectionMap;
  }

  return result as ChecklistInputs;
}

/**
 * 빈 inputs 생성 (모든 항목 미입력 상태)
 */
export function buildEmptyInputs(): ChecklistInputs {
  const result: Partial<ChecklistInputs> = {};
  for (const sectionData of EPI_DATA) {
    const sectionKey = sectionData.section as SectionKey;
    const sectionMap: Record<number, ItemInput> = {};
    for (const item of sectionData.items) {
      sectionMap[item.no] = { value: null };
    }
    result[sectionKey] = sectionMap;
  }
  return result as ChecklistInputs;
}
