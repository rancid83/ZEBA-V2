# Skill: API 연동

## 목표
ZEBA 서비스 레이어 패턴으로 API 연동 구현

## 작업 규칙

### 1. 파일 위치
- API 함수: `src/services/{도메인}.ts`
- 타입 정의: `src/types/{도메인}.ts`
- Zustand 스토어 (전역 상태 필요시): `src/store/use{Domain}Store.ts`

### 2. 서비스 파일 패턴
```tsx
// src/services/example.ts
import axios from "axios";
import type { ExampleData } from "@/types/example";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const exampleService = {
  getList: async (): Promise<ExampleData[]> => {
    const { data } = await axios.get(`${BASE_URL}/example`);
    return data;
  },

  create: async (payload: Partial<ExampleData>): Promise<ExampleData> => {
    const { data } = await axios.post(`${BASE_URL}/example`, payload);
    return data;
  },
};
```

### 3. Next.js API Route 패턴
```tsx
// src/app/api/example/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // 로직
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
```

### 4. 체크리스트
- [ ] 타입 정의 먼저
- [ ] 에러 처리 포함
- [ ] 환경변수 사용 (`NEXT_PUBLIC_` prefix)
- [ ] 기존 서비스 파일 패턴 유지

## 출력
1. 타입 파일
2. 서비스 파일
3. 사용 예시 코드
