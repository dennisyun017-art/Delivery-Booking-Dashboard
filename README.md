# 납품 시간 예약 대시보드

Assembly BP사와 납품 BP사 사이의 납품 예정 시간을 조율하는 웹 대시보드입니다.
납품 BP사가 도착 예정 시간을 등록하면, 해당 assembly BP사가 승인/반려로 확정합니다.

- **역할**: 계정 가입 시 "납품 BP사" 또는 "Assembly BP사" 중 하나를 선택
- **예약**: 납품 BP사가 매번 assembly 회사를 선택해 도착 예정 시간 등록
- **확정**: assembly BP사가 승인 또는 반려(사유 포함) → 반려 시 납품 BP사가 재입력
- **충돌 표시**: 같은 날 같은 assembly사 앞으로 예약이 몰릴 경우, 설정한 분(기본 15분) 이내로 겹치면 화면에 강조 표시. assembly BP사별로 `/assembly/settings`에서 기준 분을 직접 조정 가능
- **알림**: 새 예약 등록 시 assembly BP사에게, 승인/반려 처리 시 납품 BP사에게 이메일 발송 (Resend)

## 기술 스택

- Next.js (App Router, TypeScript) + Tailwind CSS
- Supabase (Postgres, Auth, Row Level Security)
- Resend (이메일 알림)
- Vercel 배포

## 로컬 개발 설정

### 1. 패키지 설치

```bash
npm install
```

### 2. Supabase 프로젝트 준비

1. [supabase.com](https://supabase.com)에서 새 프로젝트 생성
2. **SQL Editor**에서 [`supabase/schema.sql`](supabase/schema.sql) 내용을 그대로 실행
3. **Authentication > Providers > Email**에서 **"Confirm email" 옵션을 꺼주세요.**
   이 프로젝트는 내부 협력사용 도구라 회원가입 직후 바로 로그인 세션을 만들어
   회사 정보를 저장하는 방식이라, 이메일 인증을 켜두면 가입 흐름이 끊깁니다.
4. **Project Settings > API**에서 `Project URL`, `anon public` 키, `service_role` 키를 확인

### 3. 환경 변수 설정

`.env.local.example`을 `.env.local`로 복사한 뒤 값을 채워주세요.

```bash
cp .env.local.example .env.local
```

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase 프로젝트 값
- `SUPABASE_SERVICE_ROLE_KEY`: 이메일 알림 발송 시 상대 회사의 로그인 이메일을
  조회하는 용도로만 서버에서 사용됩니다. **절대 클라이언트에 노출되지 않도록 주의**
- `RESEND_API_KEY`, `RESEND_FROM_EMAIL`: 없어도 앱은 정상 동작하며, 이메일 발송만
  콘솔 로그로 대체됩니다 (개발 중 우선 생략 가능)

### 4. 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 접속 → `/signup`에서 계정 생성 후 확인

## Vercel 배포

1. 이 저장소를 GitHub에 올린 뒤 Vercel에서 Import
2. Vercel 프로젝트의 **Environment Variables**에 `.env.local`과 동일한 값 등록
3. 배포 후 접속 URL을 각 BP사에 공유 (모바일 브라우저에서도 반응형으로 동작)

## 폴더 구조

```
src/
  app/
    login/, signup/        로그인 · 회원가입
    delivery/               납품 BP사 대시보드 (예약 등록/재입력)
    assembly/                Assembly BP사 대시보드 (승인/반려), settings/ (겹침 기준 설정)
  components/               폼/배지 등 공용 UI
  lib/
    supabase/                브라우저/서버/미들웨어/관리자 클라이언트
    types.ts                 Profile, Delivery 타입
    conflicts.ts              시간 겹침 판정 로직
    email.ts                  Resend 이메일 발송
supabase/
  schema.sql                 테이블, RLS 정책, 워크플로우를 강제하는 트리거
```

## 다음 단계 후보

- 카카오톡 알림톡 연동 (이메일 대체/병행)
- 반복 납품 패턴 저장 (매주 같은 시간 등)
- 담당자 여러 명/회사당 계정 확장
- 지연·반려 통계 리포트
