# Zustand Store 사용법

## 기본 사용법

```typescript
import { useLoading, useLoadingActions } from '@/store';

const MyComponent = () => {
  // 로딩 상태 가져오기
  const { isLoading, loadingMessage } = useLoading();
  
  // 로딩 액션 가져오기
  const { setLoading, clearLoading } = useLoadingActions();

  const handleStart = () => {
    setLoading(true, '데이터 로딩 중...');
  };

  const handleComplete = () => {
    clearLoading();
  };

  return (
    <div>
      {isLoading && <div>로딩 중: {loadingMessage}</div>}
      <button onClick={handleStart}>로딩 시작</button>
      <button onClick={handleComplete}>로딩 완료</button>
    </div>
  );
};
```

## 새로운 슬라이스 추가 방법

1. `slices/` 폴더에 새 슬라이스 파일 생성
2. `store/index.ts`에서 슬라이스 import 및 추가
3. 타입에 슬라이스 추가

예시:
```typescript
// slices/authSlice.ts
export const createAuthSlice = (set: any) => ({
  isLoggedIn: false,
  login: () => set({ isLoggedIn: true }),
  logout: () => set({ isLoggedIn: false }),
});

// store/index.ts에 추가
type StoreState = LoadingSlice & AuthSlice;

export const useStore = create<StoreState>()(
  devtools((set, get, api) => ({
    ...createLoadingSlice(set),
    ...createAuthSlice(set),  // 새 슬라이스 추가
  }))
);
```
