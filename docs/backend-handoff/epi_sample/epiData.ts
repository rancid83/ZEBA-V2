import type { EpiSection } from '../types/epi.types';

/**
 * EPI 표준모델 배점 데이터
 * 출처: EPI_표준_모델_공종_항목별_점수_.xlsx
 *
 * standardScore 필드:
 *  largeCentral    = 대형 중앙식 취득점수 (엑셀 N열)
 *  largeIndividual = 대형 개별식 취득점수 (엑셀 O열)
 *  largeRatio      = 대형 기준 배점비율(b) (엑셀 P열)
 *  smallCentral    = 소형 중앙식 취득점수 (엑셀 R열)
 *  smallIndividual = 소형 개별식 취득점수 (엑셀 S열)
 *  smallRatio      = 소형 기준 배점비율(b) (엑셀 T열)
 */
export const EPI_DATA: EpiSection[] = [
  {
    section: 'architecture',
    items: [
      {
        no: 1,
        name: '외벽의 평균 열관류율',
        scoreType: 'graded',
        baseScore: { large: 21, small: 34, house1: 31, house2: 28 },
        standardScore: { largeCentral: 16.8, largeIndividual: 16.8, largeRatio: 0.8, smallCentral: 27.2, smallIndividual: 27.2, smallRatio: 0.8 },
      },
      {
        no: 2,
        name: '지붕의 평균 열관류율',
        scoreType: 'graded',
        baseScore: { large: 7, small: 8, house1: 10, house2: 10 },
        standardScore: { largeCentral: 5.6, largeIndividual: 5.6, largeRatio: 0.8, smallCentral: 6.4, smallIndividual: 6.4, smallRatio: 0.8 },
      },
      {
        no: 3,
        name: '바닥의 평균 열관류율',
        scoreType: 'graded',
        baseScore: { large: 5, small: 6, house1: 6, house2: 6 },
        standardScore: { largeCentral: 4, largeIndividual: 4, largeRatio: 0.8, smallCentral: 4.8, smallIndividual: 4.8, smallRatio: 0.8 },
      },
      {
        no: 4,
        name: '외피 열교부위의 단열 성능',
        scoreType: 'graded',
        baseScore: { large: 4, small: 6, house1: 6, house2: 6 },
        standardScore: { largeCentral: null, largeIndividual: null, largeRatio: 0.8, smallCentral: null, smallIndividual: null, smallRatio: 0.8 },
      },
      {
        no: 5,
        name: '기밀성 등급',
        scoreType: 'graded',
        baseScore: { large: 5, small: 6, house1: 6, house2: 6 },
        standardScore: { largeCentral: 5, largeIndividual: 5, largeRatio: 1.0, smallCentral: 6, smallIndividual: 6, smallRatio: 1.0 },
      },
      {
        no: 6,
        name: '기밀성능 강화 조치',
        scoreType: 'boolean',
        baseScore: { large: 1, small: 2, house1: 2, house2: 2 },
        standardScore: { largeCentral: null, largeIndividual: null, largeRatio: 0.8, smallCentral: null, smallIndividual: null, smallRatio: 0.8 },
      },
      {
        no: 7,
        name: '태양열 취득률',
        scoreType: 'graded',
        baseScore: { large: 7, small: 5, house1: 3, house2: 3 },
        standardScore: { largeCentral: null, largeIndividual: null, largeRatio: 0.8, smallCentral: null, smallIndividual: null, smallRatio: 0.8 },
      },
      {
        no: 8,
        name: '(공동주택) 출입구의 방풍구조',
        scoreType: 'boolean',
        baseScore: { large: null, small: null, house1: 1, house2: 1 },
        standardScore: { largeCentral: null, largeIndividual: null, largeRatio: null, smallCentral: null, smallIndividual: null, smallRatio: null },
      },
      {
        no: 9,
        name: '(공동주택) 인동간격',
        scoreType: 'graded',
        baseScore: { large: null, small: null, house1: 1, house2: 1 },
        standardScore: { largeCentral: null, largeIndividual: null, largeRatio: null, smallCentral: null, smallIndividual: null, smallRatio: null },
      },
      {
        no: 10,
        name: '(공동주택) 지하주차장 미설치',
        scoreType: 'graded',
        baseScore: { large: null, small: null, house1: 1, house2: 1 },
        standardScore: { largeCentral: null, largeIndividual: null, largeRatio: null, smallCentral: null, smallIndividual: null, smallRatio: null },
      },
    ],
  },
  {
    section: 'mechanical',
    items: [
      {
        no: 1,
        name: '난방 설비',
        scoreType: 'graded',
        baseScore: { large: 7, small: 6, house1: 9, house2: 6 },
        standardScore: { largeCentral: 5.6, largeIndividual: 5.6, largeRatio: 0.8, smallCentral: 4.8, smallIndividual: 4.8, smallRatio: 0.8 },
      },
      {
        no: 2,
        name: '냉방 설비',
        scoreType: 'graded',
        baseScore: { large: 6, small: 2, house1: null, house2: 2 },
        standardScore: { largeCentral: 4.8, largeIndividual: 4.8, largeRatio: 0.8, smallCentral: 1.6, smallIndividual: 1.6, smallRatio: 0.8 },
      },
      {
        no: 3,
        name: '공조기 송풍기 효율',
        scoreType: 'graded',
        baseScore: { large: 3, small: 1, house1: null, house2: 1 },
        standardScore: { largeCentral: null, largeIndividual: null, largeRatio: 0.8, smallCentral: null, smallIndividual: null, smallRatio: 0.8 },
      },
      {
        no: 4,
        name: '펌프 효율',
        scoreType: 'graded',
        baseScore: { large: 2, small: 2, house1: 3, house2: 3 },
        standardScore: { largeCentral: 1.6, largeIndividual: null, largeRatio: 0.8, smallCentral: 1.6, smallIndividual: null, smallRatio: 0.8 },
      },
      {
        no: 5,
        name: '이코노마이저 적용',
        scoreType: 'boolean',
        baseScore: { large: 3, small: 1, house1: null, house2: 1 },
        standardScore: { largeCentral: null, largeIndividual: null, largeRatio: 1.0, smallCentral: null, smallIndividual: null, smallRatio: 1.0 },
      },
      {
        no: 6,
        name: '열교환기 효율',
        scoreType: 'graded',
        baseScore: { large: 3, small: 3, house1: 3, house2: 3 },
        standardScore: { largeCentral: null, largeIndividual: null, largeRatio: 0.8, smallCentral: null, smallIndividual: null, smallRatio: 0.8 },
      },
      {
        no: 7,
        name: '덕트 및 배관 단열 적용',
        scoreType: 'boolean',
        baseScore: { large: 2, small: 1, house1: 2, house2: 2 },
        standardScore: { largeCentral: 2, largeIndividual: 2, largeRatio: 1.0, smallCentral: 1, smallIndividual: 1, smallRatio: 1.0 },
      },
      {
        no: 8,
        name: '열원설비 운전 제어 적용',
        scoreType: 'boolean',
        baseScore: { large: 2, small: 1, house1: 2, house2: 2 },
        standardScore: { largeCentral: null, largeIndividual: null, largeRatio: 1.0, smallCentral: null, smallIndividual: null, smallRatio: 1.0 },
      },
      {
        no: 9,
        name: '공조기 팬 운전 제어 적용',
        scoreType: 'boolean',
        baseScore: { large: 2, small: 1, house1: null, house2: 1 },
        standardScore: { largeCentral: null, largeIndividual: null, largeRatio: 1.0, smallCentral: null, smallIndividual: null, smallRatio: 1.0 },
      },
      {
        no: 10,
        name: '전기 제외한 에너지원 냉방 시스템',
        scoreType: 'graded',
        baseScore: { large: 2, small: 1, house1: null, house2: 1 },
        standardScore: { largeCentral: null, largeIndividual: null, largeRatio: 0.8, smallCentral: null, smallIndividual: null, smallRatio: 0.8 },
      },
      {
        no: 11,
        name: '급탕용 보일러 효율',
        scoreType: 'graded',
        baseScore: { large: 2, small: 2, house1: 2, house2: 2 },
        standardScore: { largeCentral: 1.6, largeIndividual: 1.6, largeRatio: 0.8, smallCentral: 1.6, smallIndividual: 1.6, smallRatio: 0.8 },
      },
      {
        no: 12,
        name: '냉방 순환 펌프 효율',
        scoreType: 'boolean',
        baseScore: { large: 2, small: 1, house1: 2, house2: 2 },
        standardScore: { largeCentral: 2, largeIndividual: null, largeRatio: 1.0, smallCentral: 1, smallIndividual: null, smallRatio: 1.0 },
      },
      {
        no: 13,
        name: '급수 펌프 운전 제어 적용',
        scoreType: 'boolean',
        baseScore: { large: 1, small: 1, house1: 1, house2: 1 },
        standardScore: { largeCentral: 1, largeIndividual: 1, largeRatio: 1.0, smallCentral: 1, smallIndividual: 1, smallRatio: 1.0 },
      },
      {
        no: 14,
        name: '지하주차장 환기',
        scoreType: 'boolean',
        baseScore: { large: 1, small: 1, house1: 1, house2: 1 },
        standardScore: { largeCentral: 1, largeIndividual: 1, largeRatio: 1.0, smallCentral: null, smallIndividual: null, smallRatio: 1.0 },
      },
      {
        no: 15,
        name: 'T.A.B 또는 커미셔닝',
        scoreType: 'graded',
        baseScore: { large: 1, small: 1, house1: null, house2: null },
        standardScore: { largeCentral: 0.8, largeIndividual: 0.8, largeRatio: 0.8, smallCentral: 0.8, smallIndividual: 0.8, smallRatio: 0.8 },
      },
      {
        no: 16,
        name: '지역 난방',
        scoreType: 'boolean',
        baseScore: { large: 10, small: 8, house1: 12, house2: 9 },
        standardScore: { largeCentral: null, largeIndividual: null, largeRatio: 1.0, smallCentral: null, smallIndividual: null, smallRatio: 1.0 },
      },
      {
        no: 17,
        name: '개별식 보상 점수',
        scoreType: 'boolean',
        baseScore: { large: 4, small: 2, house1: 4, house2: 4 },
        standardScore: { largeCentral: null, largeIndividual: 4, largeRatio: 1.0, smallCentral: null, smallIndividual: 2, smallRatio: 1.0 },
      },
    ],
  },
  {
    section: 'electrical',
    items: [
      {
        no: 1,
        name: '조명 밀도',
        scoreType: 'graded',
        baseScore: { large: 9, small: 8, house1: 8, house2: 8 },
        standardScore: { largeCentral: 7.2, largeIndividual: 7.2, largeRatio: 0.8, smallCentral: 6.4, smallIndividual: 6.4, smallRatio: 0.8 },
      },
      {
        no: 2,
        name: '전압 강하',
        scoreType: 'graded',
        baseScore: { large: 1, small: 1, house1: 1, house2: 1 },
        standardScore: { largeCentral: 0.8, largeIndividual: 0.8, largeRatio: 0.8, smallCentral: 0.8, smallIndividual: 0.8, smallRatio: 0.8 },
      },
      {
        no: 3,
        name: '전력 제어 설비 적용',
        scoreType: 'boolean',
        baseScore: { large: 2, small: 1, house1: 1, house2: 1 },
        standardScore: { largeCentral: null, largeIndividual: null, largeRatio: 1.0, smallCentral: null, smallIndividual: null, smallRatio: 1.0 },
      },
      {
        no: 4,
        name: '조명 자동 제어',
        scoreType: 'boolean',
        baseScore: { large: 1, small: 1, house1: null, house2: null },
        standardScore: { largeCentral: null, largeIndividual: null, largeRatio: 1.0, smallCentral: null, smallIndividual: null, smallRatio: 1.0 },
      },
      {
        no: 5,
        name: '조명',
        scoreType: 'boolean',
        baseScore: { large: 1, small: 1, house1: 1, house2: 1 },
        standardScore: { largeCentral: 1, largeIndividual: 1, largeRatio: 1.0, smallCentral: 1, smallIndividual: 1, smallRatio: 1.0 },
      },
      {
        no: 6,
        name: '일괄 소등 스위치',
        scoreType: 'boolean',
        baseScore: { large: 1, small: 1, house1: null, house2: null },
        standardScore: { largeCentral: 1, largeIndividual: 1, largeRatio: 1.0, smallCentral: 1, smallIndividual: 1, smallRatio: 1.0 },
      },
      {
        no: 7,
        name: '전력량계 설치',
        scoreType: 'boolean',
        baseScore: { large: 1, small: 2, house1: null, house2: null },
        standardScore: { largeCentral: 1, largeIndividual: 1, largeRatio: 1.0, smallCentral: 2, smallIndividual: 2, smallRatio: 1.0 },
      },
      {
        no: 8,
        name: 'BEMS 적용',
        scoreType: 'graded',
        baseScore: { large: 3, small: 3, house1: 2, house2: 2 },
        standardScore: { largeCentral: null, largeIndividual: null, largeRatio: 0.8, smallCentral: null, smallIndividual: null, smallRatio: 0.8 },
      },
      {
        no: 9,
        name: '역률자동조절 장치 적용',
        scoreType: 'boolean',
        baseScore: { large: 1, small: 1, house1: 1, house2: 1 },
        standardScore: { largeCentral: 1, largeIndividual: 1, largeRatio: 1.0, smallCentral: 1, smallIndividual: 1, smallRatio: 1.0 },
      },
      {
        no: 10,
        name: '대기전력차단장치 적용',
        scoreType: 'graded',
        baseScore: { large: 2, small: 2, house1: 2, house2: 2 },
        standardScore: { largeCentral: 1.6, largeIndividual: 1.6, largeRatio: 0.8, smallCentral: 1.6, smallIndividual: 1.6, smallRatio: 0.8 },
      },
      {
        no: 11,
        name: '승강기 회생제동 장치 적용',
        scoreType: 'boolean',
        baseScore: { large: 2, small: 1, house1: null, house2: null },
        standardScore: { largeCentral: null, largeIndividual: null, largeRatio: 1.0, smallCentral: null, smallIndividual: null, smallRatio: 1.0 },
      },
    ],
  },
  {
    section: 'renewable',
    items: [
      {
        no: 1,
        name: '난방 설비 신재생에너지 설비 적용',
        scoreType: 'graded',
        baseScore: { large: 4, small: 4, house1: 5, house2: 4 },
        standardScore: { largeCentral: null, largeIndividual: null, largeRatio: null, smallCentral: null, smallIndividual: null, smallRatio: null },
      },
      {
        no: 2,
        name: '냉방 설비 신재생에너지 설비 적용',
        scoreType: 'graded',
        baseScore: { large: 4, small: 4, house1: null, house2: 3 },
        standardScore: { largeCentral: null, largeIndividual: null, largeRatio: null, smallCentral: null, smallIndividual: null, smallRatio: null },
      },
      {
        no: 3,
        name: '급탕 설비 신재생에너지 설비 적용',
        scoreType: 'graded',
        baseScore: { large: 1, small: 1, house1: 4, house2: 3 },
        standardScore: { largeCentral: null, largeIndividual: null, largeRatio: null, smallCentral: null, smallIndividual: null, smallRatio: null },
      },
      {
        no: 4,
        name: '조명 설비 신재생에너지 설비 적용',
        scoreType: 'graded',
        baseScore: { large: 4, small: 4, house1: 4, house2: 3 },
        standardScore: { largeCentral: null, largeIndividual: null, largeRatio: null, smallCentral: null, smallIndividual: null, smallRatio: null },
      },
    ],
  },
];

/** 부문 한글 레이블 */
export const SECTION_LABELS: Record<string, string> = {
  architecture: '건축 부문',
  mechanical: '기계 부문',
  electrical: '전기 부문',
  renewable: '신재생 부문',
};

/** 표준모델 기준 합계점수 (엑셀 Row 2: N13/O14/R17/S18 합계) */
export const STANDARD_BENCHMARKS = {
  largeCentral: 65.4,
  largeIndividual: 65.8,
  smallCentral: 71.6,
  smallIndividual: 71.0,
} as const;

/** 배점비율(b) 선택 옵션 */
export const GRADED_RATIOS = [1, 0.9, 0.8, 0.7, 0.6] as const;
