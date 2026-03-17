export interface PageSlice {
  pageStep: number;
  setPageStep: (step: number) => void;
}

export const createPageSlice = (set: any) => ({
  pageStep: 0,
  setPageStep: (step: number) =>
    set({ pageStep: step }, false, 'page/setPageStep'),
});
