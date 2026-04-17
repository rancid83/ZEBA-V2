# v1.0.0 API Spec

## 1. 공통 규칙

현재 프론트는 응답 형식을 완전히 통일해서 사용하지는 않는다. 백엔드 구현 시 아래 형식으로 최대한 통일하는 것을 권장한다.

### 성공 응답 권장 형식

```json
{
  "status": true,
  "data": {},
  "message": "optional"
}
```

### 실패 응답 권장 형식

```json
{
  "status": false,
  "error": "에러 메시지"
}
```

## 2. 인증 API

프론트 호출 위치:

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/session`

현재 Next.js 내부 route는 외부 백엔드 게이트웨이로 다시 포워딩하는 구조다. 실제 백엔드 구현 시 아래 계약을 맞추면 프론트 수정이 최소화된다.

### 2.1 회원가입

- Method: `POST`
- Backend target: `/auth/signup`

Request:

```json
{
  "email": "user@example.com",
  "password": "plain-password",
  "name": "홍길동"
}
```

Response example:

```json
{
  "status": true,
  "data": {
    "user": {
      "id": "u_123",
      "email": "user@example.com",
      "name": "홍길동"
    },
    "token": "access-token"
  }
}
```

비고:

- 프론트는 토큰이 `token`, `accessToken`, `access_token`, 또는 `data` 내부에 와도 읽을 수 있다.
- 성공 시 쿠키 세팅은 현재 Next.js 서버 레이어가 처리 중이다.

### 2.2 로그인

- Method: `POST`
- Backend target: `/auth/login`

Request:

```json
{
  "email": "user@example.com",
  "password": "plain-password"
}
```

Response example:

```json
{
  "status": true,
  "data": {
    "user": {
      "id": "u_123",
      "email": "user@example.com",
      "name": "홍길동"
    },
    "token": "access-token"
  }
}
```

### 2.3 로그아웃

- Method: `POST`
- 현재 프론트는 내부 쿠키 제거만 수행
- 실제 백엔드에서 세션 폐기까지 처리하려면 토큰 revoke API 추가 권장

### 2.4 세션 조회

- Method: `GET`
- 현재 프론트 기대값:

```json
{
  "status": true,
  "authenticated": true
}
```

권장 확장 응답:

```json
{
  "status": true,
  "authenticated": true,
  "data": {
    "user": {
      "id": "u_123",
      "email": "user@example.com",
      "name": "홍길동"
    }
  }
}
```

## 3. 프로젝트 API

프론트 호출 위치:

- `GET /api/projects`
- `POST /api/projects`
- `GET /api/projects/:id`
- `PUT /api/projects/:id`
- `DELETE /api/projects/:id`

### 3.1 프로젝트 목록 조회

- Method: `GET`
- Path: `/projects`

Response:

```json
{
  "projects": [
    {
      "id": "p-001",
      "name": "성수 업무시설",
      "region": "서울",
      "use": "업무시설",
      "gfa": 12800,
      "floors": 12,
      "targetGrade": 3,
      "status": "진행중",
      "updatedAt": "2026-03-03 17:20",
      "map": {
        "zeb": "pass",
        "epi": "fail",
        "ren": "pass",
        "consult": "none"
      },
      "note": "EPI 재검토 필요 · 62점 / 기준 65점",
      "opsRecords": []
    }
  ]
}
```

비고:

- 현재 프론트는 목록 응답에서도 `opsRecords` 포함을 가정한다.
- 프로젝트 수가 많아지면 summary/list용 shape와 detail용 shape 분리 권장

### 3.2 프로젝트 생성

- Method: `POST`
- Path: `/projects`

Request example:

```json
{
  "name": "신규 프로젝트",
  "region": "서울",
  "use": "업무시설",
  "gfa": 10000,
  "floors": 10,
  "targetGrade": 3,
  "status": "신규",
  "map": {
    "zeb": "none",
    "epi": "none",
    "ren": "none",
    "consult": "none"
  },
  "note": ""
}
```

Response:

```json
{
  "project": {}
}
```

### 3.3 프로젝트 상세 조회

- Method: `GET`
- Path: `/projects/:id`

Response:

```json
{
  "project": {}
}
```

### 3.4 프로젝트 수정

- Method: `PUT`
- Path: `/projects/:id`
- 현재 프론트는 전체 `Project` 객체를 보낸다.

주의:

- 초기에는 `PUT full replace`로 가도 되지만, 장기적으로는 `PATCH` 분리 권장

### 3.5 프로젝트 삭제

- Method: `DELETE`
- Path: `/projects/:id`

Response:

```json
{
  "ok": true
}
```

## 4. 운영 기록 API

프론트 호출 위치:

- `POST /api/projects/:id/ops-records`
- `PATCH /api/projects/:id/ops-records/:recordId`
- `DELETE /api/projects/:id/ops-records/:recordId`

### 4.1 운영 기록 생성

- Method: `POST`
- Path: `/projects/:id/ops-records`

Request:

```json
{
  "title": "EPI 재검토 요청",
  "summary": "설계팀에 보완 요청"
}
```

Response:

```json
{
  "project": {},
  "record": {
    "id": "ops-001",
    "title": "EPI 재검토 요청",
    "summary": "설계팀에 보완 요청",
    "createdAt": "2026-03-03 17:20"
  }
}
```

### 4.2 운영 기록 수정

- Method: `PATCH`
- Path: `/projects/:id/ops-records/:recordId`

Request:

```json
{
  "title": "수정 제목",
  "summary": "수정 내용"
}
```

### 4.3 운영 기록 삭제

- Method: `DELETE`
- Path: `/projects/:id/ops-records/:recordId`

## 5. ZEB 워크스페이스 API

프론트 호출 위치:

- `PATCH /api/projects/:id/zeb-workspace`

Request body는 `ZebMultiScenarioWorkspaceState` 전체다.

Request example:

```json
{
  "compareMode": true,
  "baseline": "A",
  "selected": "B",
  "managerNote": "B안 검토 우선",
  "scenarios": [],
  "savedLibrary": [],
  "selectedSavedRecordId": ""
}
```

Response:

```json
{
  "project": {}
}
```

권장 개선:

- 향후 시나리오 저장/분석/확정 기능이 커지면 아래로 분리
  - `GET /projects/:id/zeb-workspace`
  - `PATCH /projects/:id/zeb-workspace/meta`
  - `PUT /projects/:id/zeb-workspace/scenarios/:scenarioKey`
  - `POST /projects/:id/zeb-workspace/saved-scenarios`

## 6. 협업 API

현재 프론트는 `fetchHubData("collaboration")`와 `saveCollaborationData()`만 사용 중이며, 저장 단위가 프로젝트별로 분리되어 있지 않다.

실제 백엔드에서는 아래 API로 재설계하는 것을 권장한다.

### 6.1 프로젝트 협업 전체 조회

- Method: `GET`
- Path: `/projects/:id/collaboration`

Response:

```json
{
  "zeb": {
    "panelTitle": "ZEB 협업 서비스",
    "agendas": []
  },
  "epi": {
    "panelTitle": "EPI 협업 서비스",
    "agendas": []
  },
  "ren": {
    "panelTitle": "신재생 협업 서비스",
    "agendas": []
  }
}
```

### 6.2 안건 생성

- Method: `POST`
- Path: `/projects/:id/collaboration/agendas`

### 6.3 안건 상태 변경

- Method: `PATCH`
- Path: `/projects/:id/collaboration/agendas/:agendaId`

### 6.4 기록 추가

- Method: `POST`
- Path: `/projects/:id/collaboration/agendas/:agendaId/records`

### 6.5 첨부 업로드

- Method: `POST`
- Path: `/projects/:id/collaboration/attachments`

권장:

- 파일 업로드는 presigned URL 또는 multipart 업로드로 분리

## 7. 기준 데이터 API

현재 mock slug:

- `collaboration`
- `consulting`
- `epi-seed`
- `renewable`

실제 백엔드에서는 아래처럼 분리하는 것이 더 적절하다.

- `GET /reference/consulting-companies`
- `GET /reference/renewable-defaults`
- `GET /reference/epi-seed`
- `GET /reference/project-collaboration-template`

## 8. ZEB 분석 API

프론트 코드 기준 기대 경로:

- `GET /admin/api/zeb/step1`
- `GET /admin/api/zeb/step2`
- `GET /admin/api/zeb/step3`

현재 프론트 helper 기준 파라미터:

### step1

- `region`
- `totalArea`
- `floorCount`

### step2

- `region`
- `totalArea`
- `floorCount`
- `targetGrade`

### step3

- step2 파라미터 +
- 성능 조합 선택 파라미터들

현재 프론트 타입이 기대하는 응답 shape:

```json
{
  "status": true,
  "data": {
    "gradeBuildingData": [],
    "gradeData": [],
    "active": [],
    "passive": [],
    "renewable": [],
    "activeCost": [],
    "passiveCost": [],
    "renewableCost": [],
    "standardById": []
  },
  "timestamp": "2026-04-16T00:00:00.000Z"
}
```

주의:

- `step3` 상세 파라미터 명세는 현재 프론트 코드만으로 확정되지 않는다.
- 계산 엔진이 이미 있으면 Swagger/OpenAPI를 별도 기준 문서로 고정해야 한다.
