// 에너지 탭 상태 슬라이스
export interface EnergyTabSlice {
  activeTab: string;

  // Actions
  setActiveTab: (tab: string) => void;
  resetTab: () => void;
}

export const createEnergyTabSlice = (set: any): EnergyTabSlice => ({
  activeTab: '1', // 기본값: 에너지 자립률

  setActiveTab: (tab: string) =>
    set(
      (state: EnergyTabSlice) => ({ ...state, activeTab: tab }),
      false,
      'energyTab/setActiveTab',
    ),

  resetTab: () =>
    set(
      (state: EnergyTabSlice) => ({ ...state, activeTab: '1' }),
      false,
      'energyTab/resetTab',
    ),
});
