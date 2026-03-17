// 로딩 상태 타입만 정의
export interface LoadingState {
  isLoading: boolean;
  loadingMessage?: string;
}

// GradeData 타입 정의
export interface GradeDataItem {
  label: {
    title: string;
    subTitle: string;
  };
  grade: number;
  zebGrade: number;
  creator: number;
  consume: number;
}

export interface GradeState {
  gradeData: GradeDataItem[];
}

// GradeBuildingData 타입 정의
export interface GradeBuildingDataItem {
  label: {
    title: string;
    subTitle: string;
  };
  grade: number;
  zebGrade: number;
  renewable: number;
  active: number;
  passive: number;
  increase: number;
  benefit: number;
}

// Building Data 타입 정의 (Active, Passive, Renewable)
export interface BuildingDataItem {
  name: string;
  regulation: string;
  mandatory: string;
  target: string;
  combined: string;
}

// 각 데이터 상태 타입 정의
export interface RenewableDataState {
  renewableData: BuildingDataItem[];
}

// BarChart 타입 정의
export interface BarChartState {
  chartMaxValue: number;
}

export interface ActiveDataState {
  activeData: BuildingDataItem[];
}

export interface PassiveDataState {
  passiveData: BuildingDataItem[];
}

export interface RenewableDataState {
  renewableData: BuildingDataItem[];
  grade: number;
  renewable: number;
  active: number;
  passive: number;
  increase: number;
  benefit: number;
}

export interface GradeBuildingState {
  gradeBuildingData: GradeBuildingDataItem[];
}

// GradeDataPercent 타입 정의
export interface GradeDataPercentItem {
  label: {
    title: string;
    subTitle: string;
  };
  data: Array<{ name: string; value: number }>;
  totalMoney: number;
  description: {
    description: string;
    subDescription: string;
  };
}

export interface GradeDataPercentState {
  gradeDataPercent: GradeDataPercentItem[];
}
