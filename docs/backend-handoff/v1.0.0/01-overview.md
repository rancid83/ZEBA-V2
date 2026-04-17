# v1.0.0 Overview

## 1. 문서 목적

이 문서는 현재 ZEBA 프론트엔드 프로젝트를 기준으로, 백엔드 팀이 다음 작업을 시작할 수 있도록 정리한 전달본이다.

- DB 스키마 설계
- 인증 API 구현
- 프로젝트 허브 API 구현
- 협업 데이터 저장 구조 설계
- ZEB 분석 API 연동 방식 정리

현재 프론트는 일부 기능을 `Next.js route handler + local json file` 형태로 mock 처리하고 있다. 백엔드 구현 시 이 mock 저장 구조를 실제 DB 및 API로 교체하는 것이 목표다.

## 2. 현재 프론트 기술 구조

- Framework: `Next.js 16 App Router`
- UI: `React 19`, `Ant Design`, `Tailwind`, `SCSS module`
- Client state: `zustand`
- 현재 서버 대체 레이어:
  - `src/app/api/auth/*`
  - `src/app/api/projects/*`
  - `src/app/api/hub-data/*`
  - `src/app/api/step/route.ts`

## 3. 백엔드 관점 핵심 도메인

현재 코드 기준 핵심 도메인은 아래 6개다.

1. 사용자/인증
2. 프로젝트
3. 프로젝트 운영 기록(ops records)
4. ZEB 다중 시나리오 워크스페이스
5. 협업 안건/기록/첨부
6. 기준 데이터 및 분석 API

## 4. 현재 프론트가 기대하는 동작

### 인증

- 회원가입: 이메일, 이름, 비밀번호로 가입
- 로그인: 이메일, 비밀번호로 로그인
- 로그인/회원가입 성공 시 세션 토큰을 쿠키에 저장
- 세션 조회 API는 현재 `authenticated: boolean` 정도만 사용 중

### 프로젝트 허브

- 프로젝트 목록 조회
- 프로젝트 생성/수정/삭제
- 프로젝트별 운영 기록 추가/수정/삭제
- 프로젝트별 ZEB 워크스페이스 저장

### 협업

- 서비스 단위(`zeb`, `epi`, `ren`) 협업 데이터 저장
- 안건, 기록, 타임라인, 첨부를 저장 가능해야 함
- 현재는 프로젝트별 분리가 안 되어 있으나, 실제 백엔드에서는 프로젝트 단위 귀속이 필요함

### ZEB 분석

- 프론트는 `/admin/api/zeb/step1`, `/step2`, `/step3` 형태의 분석 API를 기대하고 있음
- 현재 응답은 표준화가 덜 되어 있으므로 백엔드와 계약 확정 필요

## 5. 현재 mock 저장 위치

- `data/projects.json`
- `data/collaboration.json`
- `data/consulting.json`
- `data/renewable.json`
- `data/epi-seed.json`

실제 백엔드 구현 시 위 파일 기반 저장은 모두 DB로 이관하는 것을 권장한다.

## 6. 우선순위 제안

1. 인증/회원/세션
2. 프로젝트 + 운영 기록
3. 프로젝트별 ZEB 워크스페이스
4. 프로젝트별 협업 데이터
5. 기준 데이터 관리용 API
6. ZEB 계산 엔진 연동 정리
