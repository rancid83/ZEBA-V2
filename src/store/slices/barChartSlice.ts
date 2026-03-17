import { BarChartState } from '../types';

export interface BarChartSlice extends BarChartState {
  setChartMaxValue: (value: number) => void;
  resetChartMaxValue: () => void;
}

export const createBarChartSlice = (set: any) => ({
  chartMaxValue: 0,

  setChartMaxValue: (value: number) => set({ chartMaxValue: value }),

  resetChartMaxValue: () => set({ chartMaxValue: 0 }),
});
