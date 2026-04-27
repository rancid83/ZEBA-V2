// ─────────────────────────────────────────────
// EPI 모듈 진입점 (barrel export)
// ─────────────────────────────────────────────

// 타입
export type {
  BaseScore,
  BuildingInfo,
  BuildingSizeType,
  BuildingUseType,
  ChecklistInputs,
  EpiItem,
  EpiResult,
  EpiSection,
  GradedRatio,
  HvacType,
  ItemInput,
  ItemResult,
  ScoreType,
  SectionKey,
  SectionResult,
  StandardScore,
} from './types/epi.types';

// 데이터
export {
  EPI_DATA,
  GRADED_RATIOS,
  SECTION_LABELS,
  STANDARD_BENCHMARKS,
} from './data/epiData';

// 엔진 (순수 함수)
export {
  buildEmptyInputs,
  buildStandardInputs,
  calcAchievementRate,
  calcItemScore,
  calculateEpi,
  classifyBuildingSize,
  getBenchmarkScore,
  getBaseScore,
  getStandardScore,
  getStandardRatio,
} from './engine/epiEngine';

// React 훅
export {
  useEpiCalculator,
  useSectionItems,
} from './hooks/useEpiCalculator';
export type { UseEpiCalculatorReturn } from './hooks/useEpiCalculator';

// 컴포넌트 (필요시 import)
export {
  BuildingInfoForm,
  EpiCalculator,
  ResultSummary,
  SectionChecklist,
} from './components/EpiCalculator';
