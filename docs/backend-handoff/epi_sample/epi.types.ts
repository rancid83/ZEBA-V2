// ─────────────────────────────────────────────
// EPI 배점 관련 타입 정의
// ─────────────────────────────────────────────

/** 건물 면적 분류 */
export type BuildingSizeType = 'large' | 'small';
// large: 3,000㎡ 이상
// small: 500~3,000㎡ 미만

/** 냉난방 방식 */
export type HvacType = 'central' | 'individual';
// central: 중앙식
// individual: 개별식

/** 건물 용도 */
export type BuildingUseType = 'nonResidential' | 'house1' | 'house2';
// nonResidential: 비주거(업무/상업 등)
// house1: 공동주택 1
// house2: 공동주택 2

/** 항목 점수 산출 방식 */
export type ScoreType = 'graded' | 'boolean';
// graded  : 취득점수 = 기본배점(a) × 배점비율(b) [1 / 0.9 / 0.8 / 0.7 / 0.6]
// boolean : 적용 여부 → 적용 시 기본배점(a) 전액, 미적용 시 0

/** graded 항목의 배점비율(b) */
export type GradedRatio = 1 | 0.9 | 0.8 | 0.7 | 0.6;

/** EPI 부문 키 */
export type SectionKey = 'architecture' | 'mechanical' | 'electrical' | 'renewable';

// ─────────────────────────────────────────────
// 데이터 레이어
// ─────────────────────────────────────────────

/** 유형별 기본배점 (a) */
export interface BaseScore {
  large: number | null;    // 대형(3,000㎡↑)
  small: number | null;    // 소형(500~3,000㎡)
  house1: number | null;   // 공동주택1
  house2: number | null;   // 공동주택2
}

/** 표준모델 사전 산출 점수 (엑셀 N/O/R/S 컬럼) */
export interface StandardScore {
  largeCentral: number | null;    // 대형 중앙식
  largeIndividual: number | null; // 대형 개별식
  largeRatio: number | null;      // 대형 기준 배점비율
  smallCentral: number | null;    // 소형 중앙식
  smallIndividual: number | null; // 소형 개별식
  smallRatio: number | null;      // 소형 기준 배점비율
}

/** EPI 체크리스트 항목 */
export interface EpiItem {
  no: number;
  name: string;
  scoreType: ScoreType;
  baseScore: BaseScore;
  standardScore: StandardScore;
}

/** EPI 부문 */
export interface EpiSection {
  section: SectionKey;
  items: EpiItem[];
}

// ─────────────────────────────────────────────
// 입력 레이어
// ─────────────────────────────────────────────

/** 건물 기본 정보 입력 */
export interface BuildingInfo {
  area: number;            // 연면적 (㎡)
  buildingUse: BuildingUseType;
  hvacType: HvacType;
}

/** 개별 항목 사용자 입력 */
export interface ItemInput {
  /** graded: 배점비율(b) 선택 / boolean: 적용 여부 */
  value: GradedRatio | boolean | null;
  /** 표준모델 점수 사용 여부 (null 값 항목 처리용) */
  useStandard?: boolean;
}

/** 전체 체크리스트 입력 (section → itemNo → input) */
export type ChecklistInputs = Record<SectionKey, Record<number, ItemInput>>;

// ─────────────────────────────────────────────
// 결과 레이어
// ─────────────────────────────────────────────

/** 단일 항목 계산 결과 */
export interface ItemResult {
  no: number;
  name: string;
  scoreType: ScoreType;
  baseScore: number;           // 해당 유형의 기본배점(a)
  earnedScore: number;         // 취득 점수
  standardScore: number | null; // 표준모델 점수 (비교용)
  inputValue: GradedRatio | boolean | null;
  isApplicable: boolean;       // 해당 건물유형에 적용 가능한 항목인지
}

/** 부문별 계산 결과 */
export interface SectionResult {
  section: SectionKey;
  sectionLabel: string;
  items: ItemResult[];
  totalBase: number;           // 부문 기본배점 합계
  totalEarned: number;         // 부문 취득점수 합계
  totalStandard: number | null; // 부문 표준모델 점수 합계
}

/** 최종 EPI 계산 결과 */
export interface EpiResult {
  buildingInfo: BuildingInfo;
  sizeType: BuildingSizeType;
  sections: SectionResult[];
  totalBase: number;
  totalEarned: number;
  totalStandard: number | null;
  /** 표준모델 기준점수 (유형별 합계) */
  standardBenchmark: {
    largeCentral: number;
    largeIndividual: number;
    smallCentral: number;
    smallIndividual: number;
  };
}
