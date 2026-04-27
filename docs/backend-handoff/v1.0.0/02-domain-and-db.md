# v1.0.0 Domain And DB

## 1. 엔티티 개요

현재 프론트 기준으로 필요한 주요 엔티티는 아래와 같다.

- `users`
- `user_sessions` 또는 토큰 기반 인증 저장소
- `projects`
- `project_ops_records`
- `project_zeb_workspaces`
- `project_zeb_scenarios`
- `project_zeb_saved_scenarios`
- `project_collaboration_services`
- `project_collaboration_agendas`
- `project_collaboration_records`
- `project_collaboration_attachments`
- `project_collaboration_timeline`
- `consulting_companies`
- `consulting_requests`
- `system_configs` 또는 별도 기준 데이터 테이블

## 2. users

프론트 사용 필드:

- `email`
- `name`
- `password`

권장 스키마:

| column | type | note |
| --- | --- | --- |
| id | uuid / bigint | PK |
| email | varchar unique | 로그인 ID |
| name | varchar | 사용자 이름 |
| password_hash | varchar | 원문 저장 금지 |
| status | varchar | active, invited, disabled 등 |
| created_at | datetime | 생성일 |
| updated_at | datetime | 수정일 |
| last_login_at | datetime nullable | 마지막 로그인 |

## 3. 인증/세션

현재 프론트는 `zeba_session` 쿠키 존재 여부만 검사한다. 실제 백엔드에서는 아래 중 하나를 권장한다.

- `access token + refresh token`
- `server-side session`

권장 최소 스키마:

### user_sessions

| column | type | note |
| --- | --- | --- |
| id | uuid / bigint | PK |
| user_id | fk users.id | 사용자 |
| token_hash | varchar | 세션 토큰 해시 |
| expires_at | datetime | 만료 시각 |
| created_at | datetime | 생성일 |
| revoked_at | datetime nullable | 로그아웃/강제 만료 |
| user_agent | varchar nullable | 추적용 |
| ip_address | varchar nullable | 추적용 |

## 4. projects

프론트 타입 기준:

- `id`
- `name`
- `region`
- `use`
- `gfa`
- `floors`
- `targetGrade`
- `status`
- `updatedAt`
- `map`
- `note`

현재 `map`은 아래 4개 모듈 상태를 가진다.

- `zeb`
- `epi`
- `ren`
- `consult`

각 값은 `pass | fail | none`

권장 스키마:

| column | type | note |
| --- | --- | --- |
| id | uuid / bigint | PK |
| owner_user_id | fk users.id nullable | 최초 생성자 |
| name | varchar | 프로젝트명 |
| region | varchar | 지역 |
| use_type | varchar | 용도 |
| gross_floor_area | decimal | 연면적 |
| floors | int | 층수 |
| target_grade | int | 목표 ZEB 등급 |
| status | varchar | 신규, 진행중, 완료 |
| zeb_status | varchar | pass, fail, none |
| epi_status | varchar | pass, fail, none |
| ren_status | varchar | pass, fail, none |
| consult_status | varchar | pass, fail, none |
| note | text | 프로젝트 메모 |
| created_at | datetime | 생성일 |
| updated_at | datetime | 수정일 |

## 5. project_ops_records

프론트 타입:

- `id`
- `title`
- `summary`
- `createdAt`

권장 스키마:

| column | type | note |
| --- | --- | --- |
| id | uuid / bigint | PK |
| project_id | fk projects.id | 프로젝트 귀속 |
| title | varchar | 기록 제목 |
| summary | text | 기록 요약 |
| created_by | fk users.id nullable | 작성자 |
| created_at | datetime | 생성일 |
| updated_at | datetime | 수정일 |

## 6. project_zeb_workspaces

프론트 타입 `ZebMultiScenarioWorkspaceState` 기준:

- `compareMode: boolean`
- `baseline: A | B | C`
- `selected: A | B | C`
- `managerNote: string`
- `selectedSavedRecordId: string`

워크스페이스 자체와 시나리오 배열은 분리 저장을 권장한다.

### project_zeb_workspaces

| column | type | note |
| --- | --- | --- |
| id | uuid / bigint | PK |
| project_id | fk projects.id unique | 프로젝트별 1개 |
| compare_mode | boolean | 비교 모드 |
| baseline_scenario_id | varchar | A/B/C |
| selected_scenario_id | varchar | A/B/C |
| manager_note | text | 관리자 메모 |
| selected_saved_record_id | varchar nullable | 저장본 선택값 |
| created_at | datetime | 생성일 |
| updated_at | datetime | 수정일 |

### project_zeb_scenarios

프론트 시나리오 필드:

- `id: A | B | C`
- `name`
- `isStandard`
- `status: draft | saved | final`
- `note`
- `savedAt`
- `spec`
- `result`
- `updatedAt`
- `analyzed`

권장 스키마:

| column | type | note |
| --- | --- | --- |
| id | uuid / bigint | PK |
| workspace_id | fk project_zeb_workspaces.id | 워크스페이스 |
| source_key | varchar | A/B/C |
| name | varchar | 시나리오명 |
| is_standard | boolean | 기준안 여부 |
| status | varchar | draft, saved, final |
| note | text | 사용자 메모 |
| analyzed | boolean | 계산 완료 여부 |
| saved_at | datetime nullable | 저장 시각 |
| passive_spec_json | json | wallU, windowU, roofU, floorU |
| active_spec_json | json | ehpCOP, ventilationEff, lightingLPD, boilerEff |
| renewable_spec_json | json | pvArea, pvEff, fuelCellKW |
| result_json | json | zebGrade, selfSuff, prod, demand, costTotal, costBreakdown |
| updated_at | datetime | 수정일 |

### project_zeb_saved_scenarios

프론트 타입 `SavedScenarioRecord` 기준:

- `recordId`
- `sourceId`
- `name`
- `status`
- `savedAt`
- `note`
- `snapshot`

권장 스키마:

| column | type | note |
| --- | --- | --- |
| id | uuid / bigint | PK |
| workspace_id | fk project_zeb_workspaces.id | 워크스페이스 |
| source_scenario_key | varchar | A/B/C |
| name | varchar | 저장본 이름 |
| status | varchar | draft, saved, final |
| note | text | 메모 |
| snapshot_json | json | 시점 스냅샷 |
| saved_at | datetime | 저장일 |

## 7. 협업 도메인

현재 프론트 구조는 서비스 단위로 협업 데이터를 묶는다.

- 서비스: `zeb`, `epi`, `ren`
- 안건
- 안건별 기록
- 안건별 타임라인
- 기록별 첨부

실제 백엔드에서는 반드시 `project_id`를 기준으로 분리하는 것을 권장한다.

### project_collaboration_agendas

| column | type | note |
| --- | --- | --- |
| id | uuid / bigint | PK |
| project_id | fk projects.id | 프로젝트 |
| service_id | varchar | zeb, epi, ren |
| title | varchar | 안건 제목 |
| author_type | varchar | 설계사, 컨설턴트, 시스템 |
| status | varchar | 진행 중, 해결 |
| target | varchar | 검토 대상 |
| updated_at | datetime | 최근 갱신 |
| created_at | datetime | 생성일 |

### project_collaboration_records

| column | type | note |
| --- | --- | --- |
| id | uuid / bigint | PK |
| agenda_id | fk project_collaboration_agendas.id | 안건 |
| title | varchar | 기록 제목 |
| body | text | 기록 내용 |
| author_type | varchar | 설계사, 컨설턴트, 시스템 |
| created_by | fk users.id nullable | 사용자 |
| created_at | datetime | 생성일 |

### project_collaboration_attachments

| column | type | note |
| --- | --- | --- |
| id | uuid / bigint | PK |
| record_id | fk project_collaboration_records.id | 기록 |
| file_name | varchar | 파일명 |
| file_size_label | varchar | 현재 프론트 표시용 |
| file_url | varchar nullable | 실제 저장 위치 |
| mime_type | varchar nullable | 파일 타입 |
| created_at | datetime | 생성일 |

### project_collaboration_timeline

| column | type | note |
| --- | --- | --- |
| id | uuid / bigint | PK |
| agenda_id | fk project_collaboration_agendas.id | 안건 |
| record_id | fk project_collaboration_records.id nullable | 관련 기록 |
| type | varchar | created, comment, status |
| icon | varchar | sparkles, message, check |
| label | varchar | 표시용 라벨 |
| title | varchar | 타이틀 |
| body | text | 본문 |
| author_type | varchar | 설계사, 컨설턴트, 시스템 |
| display_time | varchar | 현재 프론트는 축약 문자열 사용 |
| has_attachment | boolean | 첨부 여부 |
| created_at | datetime | 실제 정렬 기준 |

## 8. 기준 데이터 / 설정성 데이터

현재 프론트에는 아래 성격의 기준 데이터가 있다.

- `consulting company`
- `specialty options`
- `request type options`
- `response mode options`
- `renewable region factor`
- `unit energy use`
- `unit production`
- `epi seed data`

초기 구현은 아래 중 하나를 권장한다.

1. 운영 편집이 거의 없으면 `system_configs` 또는 json column
2. 관리자 수정이 필요하면 개별 테이블 분리

## 9. DB 설계 시 주의사항

- 현재 프론트 ID는 문자열 기반 mock 값이 많으므로, 실제 DB에서는 내부 PK와 외부 표시용 키를 분리해도 된다.
- 날짜는 프론트가 문자열로 받고 있으나, DB에는 반드시 `datetime/timestamp`로 저장한다.
- 시나리오 상세 값은 변경 가능성이 높으므로 초기에는 `json` 저장이 유리하다.
- 협업 첨부는 곧 파일 업로드 요구로 확장될 가능성이 높다. 스토리지 키를 함께 설계하는 것이 좋다.
