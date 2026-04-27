# Backend Handoff

프론트엔드 기준 요구사항을 백엔드 팀에 지속 전달하기 위한 문서 폴더다.

## 목적

- 프론트 현재 상태를 기준으로 데이터 모델을 고정한다.
- 백엔드 DB 설계와 API 구현 범위를 명확히 전달한다.
- 버전별 변경 이력을 남겨 프론트/백엔드 계약 변경을 추적한다.

## 운영 규칙

- 새로운 전달본은 `vX.Y.Z` 폴더를 추가한다.
- 하위 문서는 아래 4종으로 유지한다.
  - `01-overview.md`
  - `02-domain-and-db.md`
  - `03-api-spec.md`
  - `04-open-questions.md`
- 프론트에서 타입, API shape, 라우팅 요구사항이 바뀌면 새 버전을 추가한다.
- 기존 버전은 수정하지 않고, 필요한 경우 최신 버전에서 변경점을 명시한다.

## 현재 버전

- `v1.0.0`
  - 현재 Next.js 프론트 코드 기준 첫 백엔드 전달본
  - 기준 소스:
    - `src/types/*`
    - `src/app/api/*`
    - `src/services/*`
    - `src/components/Auth/*`
    - `src/components/ProjectHub/*`
    - `src/components/Collaboration/*`

## 버전 이력

- `v1.0.0`
  - 프로젝트, 인증, 협업, ZEB 시나리오 저장 구조를 문서화
  - 프론트 내부 mock/file 저장 구조를 실제 백엔드 DB/API로 치환하기 위한 초안 작성
