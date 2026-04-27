# ZEBA 3-Repo Integration Guide

This guide aligns three repositories into one organic development flow.

- Frontend: `ZEBA-V2-1` (Next.js)
- Gateway Backend: `ZEBAGATEWAY_MAC` (Node.js/Express)
- Analysis Engine: `Code_---_v5.0` (FastAPI/Python)

## 1) Standard Local Topology

- Frontend: `http://localhost:5002`
- Gateway Backend: `http://localhost:1218`
- Analysis Engine: `http://localhost:8000`

Flow:

1. Frontend calls Gateway API.
2. Gateway checks DB cache and unified tables.
3. Gateway calls Analysis Engine when cache miss or recalculation is needed.
4. Analysis Engine computes and saves to DB.
5. Gateway returns normalized response to Frontend.

## 2) Environment Variable Contract

Use these names consistently across repos.

### Frontend (`ZEBA-V2-1`)

- `NEXT_PUBLIC_BACKEND_URL`: Gateway base URL (example: `http://localhost:1218`)
- `NEXT_PUBLIC_API_URL`: Analysis API URL for direct/testing use (example: `http://localhost:8000`)
- `NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY`: Kakao map SDK key

### Gateway (`ZEBAGATEWAY_MAC`)

- `ANALYSIS_ENGINE_URL`: Analysis Engine base URL (example: `http://localhost:8000`)
- `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`
- `JWT_SECRET`, `SESSION_SECRET`
- `NODE_ENV`

### Analysis Engine (`Code_---_v5.0`)

- `SQLALCHEMY_DATABASE_URL` (preferred, full DSN)
- or `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`, `MYSQL_CHARSET`

## 3) API Ownership and Boundaries

- Frontend must call Gateway APIs (`/admin/api/...`) as the default path.
- Gateway owns:
  - request validation
  - orchestration (cache lookup + engine request + polling)
  - response shape for UI
- Analysis Engine owns:
  - heavy calculation
  - calculation persistence
  - calculation-specific APIs (`/calculate`, `/calculate-5grade`, `/optimize`, `/calculate-custom`)

Do not put calculation business logic into Frontend.

## 4) "Vibe Coding" Team Rules (High-Speed but Safe)

1. Single source of truth for payload schema:
   - change request/response shape in Analysis Engine first
   - update Gateway mapping second
   - update Frontend types and UI last
2. Keep backward compatibility for one cycle:
   - add new fields first
   - remove old fields only after Gateway and Frontend are updated
3. Define timeout and retry intentionally:
   - Gateway -> Engine requests should have explicit timeout
   - user-facing message must distinguish timeout vs validation error
4. Add lightweight observability:
   - include request context (region/area/floor/targetGrade) in logs
   - keep one correlation id per step flow
5. Cache-first rule:
   - always attempt DB/unified table lookup before expensive calculation

## 5) Branch and Commit Convention

Recommended branch prefix:

- `feat/integration-*`
- `fix/integration-*`
- `chore/env-*`

Commit style:

- `feat(integration): align env contract across 3 repos`
- `fix(gateway): normalize step3 response for frontend`
- `chore(engine): load mysql config from environment`

## 6) Local Run Order

Run in this order for stable integration checks:

1. Analysis Engine (`Code_---_v5.0`)
2. Gateway (`ZEBAGATEWAY_MAC`)
3. Frontend (`ZEBA-V2-1`)

Then verify:

1. `GET http://localhost:8000/health`
2. `GET http://localhost:1218/docs`
3. Frontend page load (`http://localhost:5002`)
4. One step API path end-to-end (`/admin/api/zeb/step1`, `step2`, `step3`)

## 7) Minimal End-to-End Smoke Cases

Use one fixed sample input set:

- `region=광주(광주)`
- `totalArea=20000`
- `floorCount=5`
- `targetGrade=4`

Smoke matrix:

1. Gateway Step1 (no target grade)
2. Gateway Step2 (target grade)
3. Gateway Step3 (target grade + one performance param)
4. repeated Step2 call (cache hit expectation)

## 8) Operational Checklist Before Merge

- `.env` values use the standard names above
- Frontend does not bypass Gateway for production path
- Gateway can reach Analysis Engine URL from its runtime
- Analysis Engine DB connectivity validated
- At least one full Step1 -> Step3 manual run completed

