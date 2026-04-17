# ZEBALL 풀스택 프로젝트

> 작성일: 2026-04-17

---

## 1. 프로젝트 개요

ZEBA는 **제로에너지건축물(Zero Energy Building)** 분석·관리 플랫폼으로, 세 개의 독립된 서비스가 연동되어 동작합니다.

| 프로젝트          | 역할                           | 포트 |
| ----------------- | ------------------------------ | ---- |
| `ZEBA-V2-1`       | Next.js 프론트엔드             | 5002 |
| `ZEBAGATEWAY_MAC` | Node.js Express API 게이트웨이 | 1218 |
| `Code_---_v5.0`   | Python FastAPI 계산 엔진       | 8000 |

---

## 2. 시스템 아키텍처

```
┌────────────────────────────────────────────────┐
│                 사용자 브라우저                  │
└─────────────────────┬──────────────────────────┘
                      │ HTTP / WebSocket
                      ▼
┌────────────────────────────────────────────────┐
│     ZEBA-V2-1  (Next.js 16 · Port 5002)        │
│                                                │
│  [lang] 라우팅 → 페이지별 컴포넌트              │
│  Zustand 15개 슬라이스 (전역 상태)              │
│  Tailwind v4 + Ant Design v6 + Framer Motion   │
└────────────┬─────────────────┬─────────────────┘
             │                 │
  BACKEND_URL:1218        API_URL:8000
             │                 │
             ▼                 ▼
┌───────────────────┐   ┌──────────────────────┐
│ ZEBAGATEWAY_MAC   │   │  Code_---_v5.0        │
│ (Node · Port 1218)│   │  (FastAPI · Port 8000)│
├───────────────────┤   ├──────────────────────┤
│ 인증 / 유저 관리   │   │ ZEB 계산 엔진         │
│ 프로젝트 CRUD     │   │ - 최소수준 계산       │
│ ZEB 분석 오케스트  │   │ - 예상 5등급 예측     │
│ 비용 시뮬레이션   │   │ - 최적화 알고리즘     │
│ Socket.io 실시간  │   │ - 결과 캐싱 (해시)    │
└────────┬──────────┘   └──────────┬───────────┘
         │                         │
         └───────────┬─────────────┘
                     ▼
              ┌────────────┐
              │   MySQL    │  (zebagateway DB)
              │  49.50.x.x │
              └────────────┘
```

---

## 3. 프로젝트별 상세

### 3-1. ZEBA-V2-1 (프론트엔드)

**기술 스택**

| 항목          | 버전                |
| ------------- | ------------------- |
| Next.js       | 16.0.7 (App Router) |
| React         | 19.2.1              |
| TypeScript    | 5.9.3 (strict)      |
| Zustand       | 5.0.12              |
| Tailwind CSS  | 4.2.2               |
| Ant Design    | 6.3.3               |
| Framer Motion | 12.38.0             |
| Axios         | 1.13.6              |

**디렉토리 구조**

```
src/
├── app/
│   ├── [lang]/             ← i18n 라우팅 (모든 페이지)
│   │   ├── login/
│   │   ├── signup/
│   │   ├── main/           ← 대시보드
│   │   ├── project-hub/
│   │   ├── collaboration/
│   │   └── landing/        ← style-a / b / c 변형
│   └── api/                ← Next.js API Routes (게이트웨이 프록시)
│       ├── auth/
│       ├── projects/[id]/
│       └── step/
├── components/             ← 도메인별 컴포넌트
│   ├── Auth/
│   ├── Landing/
│   ├── ProjectHub/
│   ├── Collaboration/
│   ├── Slides/
│   └── main/
├── services/               ← 외부 API 통신 전담
│   ├── api.ts
│   ├── auth.ts
│   └── steps.ts
├── store/                  ← Zustand 슬라이스
│   └── slices/
│       ├── authSlice.ts
│       ├── gradeSlice.ts
│       ├── formDataSlice.ts
│       ├── activeDataSlice.ts
│       ├── passiveDataSlice.ts
│       ├── renewableDataSlice.ts
│       └── ... (15개)
└── types/                  ← TypeScript 타입 정의
```

**환경변수**

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:1218
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY=...
```

---

### 3-2. ZEBAGATEWAY_MAC (API 게이트웨이)

**기술 스택**

| 항목            | 버전               |
| --------------- | ------------------ |
| Node.js         | Express 4.18.2     |
| MySQL           | mysql2 3.14.2      |
| Sequelize (ORM) | 6.28.0             |
| JWT             | jsonwebtoken 9.0.0 |
| Socket.io       | 4.7.5              |
| Kafka           | kafkajs 2.2.3      |
| AMQP            | amqplib 0.10.3     |
| Puppeteer       | 24.8.2             |
| ExcelJS         | 4.4.0              |

**MVC 구조**

```
app.js                      ← Express 진입점
├── controller/api/         ← 라우터 + 요청/응답 처리
│   ├── user.js
│   ├── zeb.js              (22.5KB)
│   ├── zebAnalysisRequest.js
│   ├── costReferenceData.js
│   ├── techTransferChecklist.js  (22KB)
│   ├── algorithmBaseData.js
│   ├── optimizeBaseData.js
│   └── v2/                 ← V2 API 엔드포인트
├── service/                ← 비즈니스 로직
│   ├── zeb.js              (375KB ← 리팩터 대상)
│   ├── auth.js
│   ├── cron.js
│   └── zebAnalysisRequest.js
├── db/                     ← 데이터 접근 레이어
│   ├── db.js
│   ├── analysisRequest.js
│   ├── dataHub.js          (25.4KB)
│   └── ...
├── migrations/             ← DB 스키마 마이그레이션 (20+개)
├── config/
│   ├── database.js
│   ├── mysql.json
│   └── cost-calculation.json
└── views/                  ← EJS 템플릿 (레거시)
```

**주요 API 엔드포인트**

| 경로                        | 설명                 |
| --------------------------- | -------------------- |
| `POST /api/auth/*`          | 로그인·회원가입·세션 |
| `GET/POST /api/projects`    | 프로젝트 목록·생성   |
| `GET/PUT /api/projects/:id` | 프로젝트 상세·수정   |
| `POST /api/analysis`        | ZEB 분석 요청        |
| `GET /api/zeb/*`            | ZEB 결과·기준 데이터 |
| `GET /api/costs/*`          | 비용 참조 데이터     |
| `GET /api/v2/health`        | 헬스체크             |
| `GET /api/v2/calculations`  | 계산 결과 조회       |

---

### 3-3. Code\_---\_v5.0 (계산 엔진)

**기술 스택**

| 항목           | 버전    |
| -------------- | ------- |
| Python         | 3.8+    |
| FastAPI        | 0.104.0 |
| SQLAlchemy     | 2.0.0   |
| Pandas / NumPy | Latest  |
| scikit-learn   | 1.0.0   |
| LightGBM       | 3.0.0   |
| PyMySQL        | 1.1.0   |

**지원 건물 유형**

| 건물 유형                   | 최소수준 | 예상5등급 | 최적화 |
| --------------------------- | -------- | --------- | ------ |
| 초중고 (v6.5/v7.0)          | ✅       | ✅        | ✅     |
| 업무시설 개별식 (v3.5/v4.0) | ✅       | ✅        | ✅     |
| 업무시설 중앙식 (v1.5/v2.0) | ✅       | ✅        | ✅     |

**계산 흐름**

```
사용자 입력
    ↓
입력 해시 생성 (결정론적)
    ↓
캐시 확인 (unified_results 테이블)
    ↓
  [캐시 HIT]          [캐시 MISS]
  결과 즉시 반환       해당 건물 모듈 로드
                          ↓
                      계산 실행 (생산량 / 소요량)
                          ↓
                      에너지자립률 산정 (%)
                          ↓
                      ZEB 등급 판정
                          ↓
                      DB 저장 → 결과 반환
```

**주요 API 엔드포인트**

| 경로                       | 설명                 |
| -------------------------- | -------------------- |
| `GET /health`              | 서버·DB 상태         |
| `POST /calculate`          | 최소수준 계산        |
| `POST /calculate/5grade`   | 예상 5등급 계산      |
| `POST /calculate/optimize` | 최적화 계산          |
| `POST /calculate/custom`   | 사용자 정의 파라미터 |
| `POST /calculate/combined` | 복합 계산            |
| `GET /results/{id}`        | 특정 결과 조회       |
| `GET /docs`                | Swagger UI           |

---

## 4. 공통 기술 결정 사항

### 설계 원칙

- **관심사 분리**: UI(React) → 오케스트레이션(Node) → 계산(Python) 3-tier
- **i18n 우선**: 프론트 모든 라우트에 `[lang]` 파라미터 내장
- **캐싱 전략**: 계산 엔진은 입력 해시 기반 중복 계산 방지
- **실시간**: Socket.io를 게이트웨이에서 운영, 프론트로 푸시

### 데이터 흐름

```
프론트(Zustand) → Next.js API Route → Node 게이트웨이 → MySQL
                                    → Python 계산 엔진 → MySQL (결과 저장)
```

---

## 5. 개발 환경 실행

```bash
# 1. Python 계산 엔진 (먼저 실행)
cd Code_---_v5.0
python run.py                    # localhost:8000

# 2. Node.js 게이트웨이
cd ZEBAGATEWAY_MAC
npm run dev                      # localhost:1218

# 3. Next.js 프론트엔드
cd ZEBA-V2-1
npm run dev                      # localhost:5002
```

---

## 6. 주요 개선 필요 사항

| 항목                     | 내용                                                   | 우선순위 |
| ------------------------ | ------------------------------------------------------ | -------- |
| `service/zeb.js` (375KB) | 도메인별 분리 리팩터 필요                              | 높음     |
| DB 자격증명 하드코딩     | `api/database.py`에 비밀번호 노출 → 환경변수로 이동    | 높음     |
| API 버전 혼재            | v1/v2 엔드포인트 공존, 마이그레이션 계획 필요          | 중간     |
| 테스트 커버리지          | 계산 엔진 test\_\*.py 외 프론트·게이트웨이 테스트 부재 | 중간     |
| EJS 레거시 뷰            | Node.js의 EJS 템플릿 → Next.js 전환 완료 여부 확인     | 낮음     |

---

## 7. Git 저장소

| 프로젝트        | 저장소                          | 브랜치 |
| --------------- | ------------------------------- | ------ |
| ZEBA-V2-1       | github.com/rancid83/ZEBA-V2     | main   |
| ZEBAGATEWAY_MAC | github.com/rancid83/ZEBAGATEWAY | main   |
| Code\_---\_v5.0 | 로컬                            | main   |
