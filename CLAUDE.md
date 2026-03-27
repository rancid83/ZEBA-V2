# ZEBA 프로젝트 Claude 설정

## AI 작업 구조
- Agents: `ai/agents/` — 역할 정의
- Skills: `ai/skills/` — 작업 방식 정의
- Tasks: `ai/tasks/` — 실행 템플릿

### 태스크 (템플릿)
| Task 파일 | 용도 |
|-----------|------|
| `create-page.md` | 새 페이지 생성 |
| `design-update.md` | 디자인·UI 변경 |
| `refactor-page.md` | 페이지 리팩터 |
| `add-feature.md` | 기능 추가 |
| `review-code.md` | 코드 리뷰 |
| `orchestrate-work.md` | 작업 오케스트레이션 |

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

## 에이전트 역할 요약
| Agent | 용도 |
|--------|------|
| `frontend-architect` | 구조 설계·아키텍처 |
| `nextjs-builder` | 코드 구현 |
| `ui-design-lead` | UI·레이아웃·비주얼·디자인 시스템 일관성 (프론트/디자인 변경 위주) |
| `chief-designer` | 프로젝트 전반 디자인 시스템·톤앤매너·비주얼 방향 정의 및 일관성 감사 |

## 스킬 요약
| Skill | 용도 |
|--------|------|
| `create-page` | 새 페이지 생성 |
| `refactor-component` | 컴포넌트 리팩터 |
| `api-integration` | API 연동 |
| `code-review` | 코드 리뷰 |
| `design-system-ui` | antd·Tailwind·SCSS 역할 분담, 간격·색·타이포 |
| `style-polish` | 반응형·접근성·Framer Motion 마감 |

## 작업 요청 방법
```
Agent: frontend-architect (또는 nextjs-builder, ui-design-lead, chief-designer)
Skill: create-page (또는 refactor-component, api-integration, code-review, design-system-ui, style-polish)

[요청 내용]
```

### 전체 디자인 시스템·방향 잡기 예시
```
Agent: chief-designer
Skill: design-system-ui

프로젝트 전반의 색상·타이포·간격 토큰을 정리하고 antd 테마와 연결해줘
```

### 프론트·디자인 변경 위주 예시
```
Agent: ui-design-lead
Skill: design-system-ui

[화면/컴포넌트 경로와 원하는 디자인 방향]
```

```
Agent: nextjs-builder
Skill: style-polish

[파일] … 반응형·a11y·모션만 다듬어줘
```

## 금지사항
- package.json에 없는 라이브러리 추가 금지
- Tailwind v3 문법 사용 금지
- `[lang]` 라우팅 구조 무시 금지
