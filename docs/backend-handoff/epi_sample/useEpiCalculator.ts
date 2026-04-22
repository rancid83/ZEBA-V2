/**
 * useEpiCalculator
 *
 * EPI 배점 계산 전체 상태를 관리하는 React 훅
 *
 * 사용 예시:
 *   const { buildingInfo, setBuildingInfo, inputs, setItemInput, result, reset } = useEpiCalculator();
 */

import { useCallback, useMemo, useState } from 'react';
import { EPI_DATA } from '../data/epiData';
import {
  buildEmptyInputs,
  buildStandardInputs,
  calcAchievementRate,
  calculateEpi,
  classifyBuildingSize,
  getBenchmarkScore,
} from '../engine/epiEngine';
import type {
  BuildingInfo,
  BuildingUseType,
  ChecklistInputs,
  GradedRatio,
  HvacType,
  ItemInput,
  SectionKey,
} from '../types/epi.types';

// ─────────────────────────────────────────────
// 기본값
// ─────────────────────────────────────────────

const DEFAULT_BUILDING_INFO: BuildingInfo = {
  area: 3000,
  buildingUse: 'nonResidential',
  hvacType: 'central',
};

// ─────────────────────────────────────────────
// 훅 반환 타입
// ─────────────────────────────────────────────

export interface UseEpiCalculatorReturn {
  /** 건물 기본 정보 */
  buildingInfo: BuildingInfo;
  /** 건물 정보 업데이트 */
  setBuildingInfo: (info: Partial<BuildingInfo>) => void;

  /** 항목별 사용자 입력 */
  inputs: ChecklistInputs;
  /** 단일 항목 입력값 업데이트 */
  setItemInput: (
    section: SectionKey,
    itemNo: number,
    value: GradedRatio | boolean | null,
  ) => void;
  /** 부문 전체 일괄 입력 */
  setSectionInputs: (
    section: SectionKey,
    sectionInputs: Record<number, ItemInput>,
  ) => void;

  /** 계산 결과 (buildingInfo / inputs 변경 시 자동 재계산) */
  result: ReturnType<typeof calculateEpi>;

  /** 파생 상태 */
  sizeType: ReturnType<typeof classifyBuildingSize>;
  benchmarkScore: number;
  achievementRate: number;

  /** 표준모델 기본값으로 초기화 */
  applyStandardDefaults: () => void;
  /** 전체 초기화 */
  reset: () => void;
}

// ─────────────────────────────────────────────
// 훅 구현
// ─────────────────────────────────────────────

export function useEpiCalculator(): UseEpiCalculatorReturn {
  const [buildingInfo, setBuildingInfoState] =
    useState<BuildingInfo>(DEFAULT_BUILDING_INFO);
  const [inputs, setInputs] = useState<ChecklistInputs>(buildEmptyInputs);

  // 건물 정보 부분 업데이트
  const setBuildingInfo = useCallback((info: Partial<BuildingInfo>) => {
    setBuildingInfoState((prev) => ({ ...prev, ...info }));
  }, []);

  // 단일 항목 입력값 업데이트
  const setItemInput = useCallback(
    (
      section: SectionKey,
      itemNo: number,
      value: GradedRatio | boolean | null,
    ) => {
      setInputs((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [itemNo]: { value },
        },
      }));
    },
    [],
  );

  // 부문 전체 일괄 업데이트
  const setSectionInputs = useCallback(
    (section: SectionKey, sectionInputs: Record<number, ItemInput>) => {
      setInputs((prev) => ({
        ...prev,
        [section]: sectionInputs,
      }));
    },
    [],
  );

  // 표준모델 기본값 적용
  const applyStandardDefaults = useCallback(() => {
    const sizeType = classifyBuildingSize(buildingInfo.area);
    setInputs(buildStandardInputs(sizeType, buildingInfo.hvacType));
  }, [buildingInfo.area, buildingInfo.hvacType]);

  // 전체 초기화
  const reset = useCallback(() => {
    setBuildingInfoState(DEFAULT_BUILDING_INFO);
    setInputs(buildEmptyInputs());
  }, []);

  // 파생 상태
  const sizeType = useMemo(
    () => classifyBuildingSize(buildingInfo.area),
    [buildingInfo.area],
  );

  const benchmarkScore = useMemo(
    () => getBenchmarkScore(sizeType, buildingInfo.hvacType),
    [sizeType, buildingInfo.hvacType],
  );

  // 계산 결과 (메모이제이션)
  const result = useMemo(
    () => calculateEpi(buildingInfo, inputs),
    [buildingInfo, inputs],
  );

  const achievementRate = useMemo(
    () => calcAchievementRate(result.totalEarned, benchmarkScore),
    [result.totalEarned, benchmarkScore],
  );

  return {
    buildingInfo,
    setBuildingInfo,
    inputs,
    setItemInput,
    setSectionInputs,
    result,
    sizeType,
    benchmarkScore,
    achievementRate,
    applyStandardDefaults,
    reset,
  };
}

// ─────────────────────────────────────────────
// 추가 유틸 훅: 특정 부문 항목 목록 조회
// ─────────────────────────────────────────────

/**
 * 특정 부문의 항목 목록 반환 (건물 용도 필터 포함)
 */
export function useSectionItems(
  section: SectionKey,
  buildingUse: BuildingUseType,
  hvacType: HvacType,
) {
  return useMemo(() => {
    const sectionData = EPI_DATA.find((s) => s.section === section);
    if (!sectionData) return [];

    return sectionData.items.map((item) => {
      // 해당 용도에 기본배점이 있는 항목인지 확인
      let baseScore: number | null = null;
      if (buildingUse === 'nonResidential') {
        // large/small은 면적으로 결정하므로 둘 다 확인
        baseScore = item.baseScore.large ?? item.baseScore.small;
      } else if (buildingUse === 'house1') {
        baseScore = item.baseScore.house1;
      } else {
        baseScore = item.baseScore.house2;
      }

      const stdKey =
        hvacType === 'central'
          ? ('largeCentral' as const)
          : ('largeIndividual' as const);

      return {
        ...item,
        isApplicable: baseScore !== null,
        standardScoreValue: item.standardScore[stdKey],
      };
    });
  }, [section, buildingUse, hvacType]);
}
