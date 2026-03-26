# ZEBA 프로젝트 Claude 설정

## AI 작업 구조
- Agents: `ai/agents/` — 역할 정의
- Skills: `ai/skills/` — 작업 방식 정의
- Tasks: `ai/tasks/` — 실행 템플릿

## 프로젝트 기본 정보
- **프레임워크:** Next.js 16 (App Router)
- **언어:** TypeScript (strict)
- **스타일:** Tailwind CSS v4 + SASS
- **UI 라이브러리:** Ant Design v6
- **상태관리:** Zustand v5
- **애니메이션:** Framer Motion v12
- **HTTP:** Axios

## 핵심 구조 규칙
1. 모든 페이지는 `src/app/[lang]/` 하위에 위치 (i18n 라우팅)
2. 컴포넌트는 `src/components/{도메인명}/` 폴더에 도메인별 분리
3. API 통신은 `src/services/` 에서만
4. 전역 상태는 `src/store/` Zustand 스토어

## 작업 요청 방법
```
Agent: frontend-architect (또는 nextjs-builder)
Skill: create-page (또는 refactor-component, api-integration, code-review)

[요청 내용]
```

## 금지사항
- package.json에 없는 라이브러리 추가 금지
- Tailwind v3 문법 사용 금지
- `[lang]` 라우팅 구조 무시 금지
