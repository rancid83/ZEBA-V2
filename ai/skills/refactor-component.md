# Skill: 컴포넌트 리팩토링

## 목표
기존 컴포넌트를 ZEBA 구조 기준으로 개선

## 작업 규칙

### 1. 분석 순서
1. 현재 컴포넌트 역할 파악
2. Server/Client 분리 가능 여부 확인
3. 재사용 가능한 부분 추출
4. 상태관리 최적화 (불필요한 useState 제거)

### 2. Server/Client 분리 기준
**Server Component로 유지:**
- 데이터 페칭
- 정적 렌더링
- DB/API 직접 접근

**Client Component로 변경:**
- onClick, onChange 등 이벤트 핸들러
- useState, useEffect 사용
- 브라우저 API (window, document)
- Zustand 스토어 접근

### 3. 리팩토링 패턴
```
Before: 하나의 큰 컴포넌트
After:
  ParentComponent (Server)
    ├── StaticSection (Server)
    └── InteractiveSection (Client) ← "use client"
```

### 4. Ant Design v6 사용 시
- `import { Button } from "antd"` 형식 유지
- Theme 커스터마이징은 기존 `ConfigProvider` 활용
- CSS-in-JS: `@ant-design/cssinjs` 사용

### 5. Zustand 패턴
```tsx
// src/store/useExampleStore.ts
import { create } from "zustand";

interface ExampleStore {
  data: string;
  setData: (data: string) => void;
}

export const useExampleStore = create<ExampleStore>((set) => ({
  data: "",
  setData: (data) => set({ data }),
}));
```

## 출력
1. 변경 전/후 구조 비교
2. 수정된 파일 코드
3. 개선 이유 요약
