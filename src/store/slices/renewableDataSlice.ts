import { RenewableDataState, BuildingDataItem } from '../types';

export interface RenewableDataSlice extends RenewableDataState {
  renewableDataCost: BuildingDataItem[];
  setRenewableData: (data: BuildingDataItem[]) => void;
  setRenewableDataCost: (data: BuildingDataItem[]) => void;
  updateRenewableDataItem: (
    index: number,
    updates: Partial<BuildingDataItem>,
  ) => void;
  resetRenewableData: () => void;
  resetRenewableDataCost: () => void;
}

export const createRenewableDataSlice = (set: any) => ({
  renewableData: [],
  renewableDataCost: [],
  grade: 0,
  renewable: 0,
  active: 0,
  passive: 0,
  increase: 0,
  benefit: 0,

  setRenewableData: (data: BuildingDataItem[]) => set({ renewableData: data }),

  setRenewableDataCost: (data: BuildingDataItem[]) =>
    set({ renewableDataCost: data }),

  updateRenewableDataItem: (
    index: number,
    updates: Partial<BuildingDataItem>,
  ) =>
    set((state: any) => ({
      renewableData: state.renewableData.map((item: any, i: number) =>
        i === index ? { ...item, ...updates } : item,
      ),
    })),

  resetRenewableData: () => set({ renewableData: [] }),

  resetRenewableDataCost: () => set({ renewableDataCost: [] }),
});
