// Request 상태 슬라이스
export interface RequestSlice {
  step1Request: boolean;
  step2Request: boolean;
  step3Request: boolean;

  // Actions
  setStep1Request: (isRequesting: boolean) => void;
  setStep2Request: (isRequesting: boolean) => void;
  setStep3Request: (isRequesting: boolean) => void;
  resetAllRequests: () => void;
}

export const createRequestSlice = (set: any): RequestSlice => ({
  step1Request: false,
  step2Request: false,
  step3Request: false,

  setStep1Request: (isRequesting: boolean) =>
    set(
      (state: RequestSlice) => ({ ...state, step1Request: isRequesting }),
      false,
      'request/setStep1Request',
    ),

  setStep2Request: (isRequesting: boolean) =>
    set(
      (state: RequestSlice) => ({ ...state, step2Request: isRequesting }),
      false,
      'request/setStep2Request',
    ),

  setStep3Request: (isRequesting: boolean) =>
    set(
      (state: RequestSlice) => ({ ...state, step3Request: isRequesting }),
      false,
      'request/setStep3Request',
    ),

  resetAllRequests: () =>
    set(
      (state: RequestSlice) => ({
        ...state,
        step1Request: false,
        step2Request: false,
        step3Request: false,
      }),
      false,
      'request/resetAllRequests',
    ),
});
