# Skill: 새 페이지 생성

## 목표
ZEBA 프로젝트에 새 Next.js 페이지를 올바른 구조로 생성

## 작업 규칙

### 1. 파일 위치
- 페이지: `src/app/[lang]/{페이지명}/page.tsx`
- 컴포넌트: `src/components/{PageName}/`
- API route: `src/app/api/{엔드포인트}/route.ts`

### 2. 페이지 구조
```tsx
// src/app/[lang]/example/page.tsx
import { ExampleMain } from "@/components/Example";

interface Props {
  params: Promise<{ lang: string }>;
}

export default async function ExamplePage({ params }: Props) {
  const { lang } = await params;
  return <ExampleMain lang={lang} />;
}
```

### 3. 컴포넌트 분리 기준
- 페이지 파일: 최소화 (라우팅만)
- UI 로직: `components/{PageName}/` 하위
- 재사용 가능한 UI: `components/main/` 또는 기존 폴더 활용

### 4. 체크리스트
- [ ] `[lang]` params 포함
- [ ] Server/Client 컴포넌트 구분
- [ ] 기존 컴포넌트 재사용 여부 확인
- [ ] TypeScript 타입 정의
- [ ] import 경로 `@/` 사용

## 출력
1. 생성할 파일 목록
2. 각 파일 코드
