import { ActiveDataState, BuildingDataItem } from '../types';

export interface ActiveDataSlice extends ActiveDataState {
  activeDataCost: BuildingDataItem[];
  setActiveData: (data: BuildingDataItem[]) => void;
  setActiveDataCost: (data: BuildingDataItem[]) => void;
  updateActiveDataItem: (
    index: number,
    updates: Partial<BuildingDataItem>,
  ) => void;
  resetActiveData: () => void;
  resetActiveDataCost: () => void;
}

export const createActiveDataSlice = (set: any) => ({
  activeData: [],
  activeDataCost: [],

  setActiveData: (data: BuildingDataItem[]) => set({ activeData: data }),

  setActiveDataCost: (data: BuildingDataItem[]) =>
    set({ activeDataCost: data }),

  updateActiveDataItem: (index: number, updates: Partial<BuildingDataItem>) =>
    set((state: any) => ({
      activeData: state.activeData.map((item: any, i: number) =>
        i === index ? { ...item, ...updates } : item,
      ),
    })),

  resetActiveData: () => set({ activeData: [] }),

  resetActiveDataCost: () => set({ activeDataCost: [] }),
});
