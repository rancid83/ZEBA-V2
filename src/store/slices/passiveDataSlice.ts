import { PassiveDataState, BuildingDataItem } from '../types';

export interface PassiveDataSlice extends PassiveDataState {
  passiveDataCost: BuildingDataItem[];
  setPassiveData: (data: BuildingDataItem[]) => void;
  setPassiveDataCost: (data: BuildingDataItem[]) => void;
  updatePassiveDataItem: (
    index: number,
    updates: Partial<BuildingDataItem>,
  ) => void;
  resetPassiveData: () => void;
  resetPassiveDataCost: () => void;
}

export const createPassiveDataSlice = (set: any) => ({
  passiveData: [],
  passiveDataCost: [],

  setPassiveData: (data: BuildingDataItem[]) => set({ passiveData: data }),

  setPassiveDataCost: (data: BuildingDataItem[]) =>
    set({ passiveDataCost: data }),

  updatePassiveDataItem: (index: number, updates: Partial<BuildingDataItem>) =>
    set((state: any) => ({
      passiveData: state.passiveData.map((item: any, i: number) =>
        i === index ? { ...item, ...updates } : item,
      ),
    })),

  resetPassiveData: () => set({ passiveData: [] }),

  resetPassiveDataCost: () => set({ passiveDataCost: [] }),
});
