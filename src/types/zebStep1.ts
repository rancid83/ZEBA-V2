// ZEB Step1 API 전체 응답 타입 정의

export interface ZebLabel {
  title: string;
  subTitle: string;
}

export interface ZebGradeBuildingData {
  label: ZebLabel;
  zebGrade: number;
  grade: number;
  renewable: number;
  active: number;
  passive: number;
  increase: number;
  benefit: number;
}

export interface ZebGradeData {
  label: ZebLabel;
  grade: number;
  zebGrade: number;
  creator: number;
  consume: number;
}

export interface ZebItem {
  name: string;
  regulation: string;
  mandatory: string;
  target: string;
  combined: string;
}

export interface ZebStep1Data {
  gradeBuildingData: ZebGradeBuildingData[];
  gradeData: ZebGradeData[];
  active: ZebItem[];
  passive: ZebItem[];
  renewable: ZebItem[];
  activeCost: ZebItem[];
  passiveCost: ZebItem[];
  renewableCost: ZebItem[];
  /** step2 응답: 목표 등급별 성능 데이터 */
  standardById?: unknown[];
}

export interface ZebStep1Response {
  status: boolean;
  data: ZebStep1Data;
  timestamp: string;
}
