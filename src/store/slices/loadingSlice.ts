import { LoadingState } from '../types';

// 로딩 슬라이스
export interface LoadingSlice extends LoadingState {
  setLoading: (isLoading: boolean, message?: string) => void;
  clearLoading: () => void;
}

export const createLoadingSlice = (set: any) => ({
  isLoading: false,
  loadingMessage: undefined,

  setLoading: (isLoading: boolean, message?: string) =>
    set({ isLoading, loadingMessage: message }, false, 'loading/setLoading'),

  clearLoading: () =>
    set(
      { isLoading: false, loadingMessage: undefined },
      false,
      'loading/clearLoading',
    ),
});
