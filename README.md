# 납품 시간 예약 대시보드

Assembly BP사와 납품 BP사 사이의 납품 예정 시간을 조율하는 웹 대시보드입니다.
납품 BP사가 도착 예정 시간을 등록하면, 해당 assembly BP사가 승인/반려로 확정합니다.

- **역할**: 납품 BP사는 `/signup`에서 자유 가입, Assembly BP사는 **관리자가 이메일로
  초대**해서 생성 (10곳 미만이라 미리 확정해두는 구조), 관리자는 `/admin`에서 초대 관리
- **예약**: 납품 BP사가 매번 assembly 회사를 선택해 도착 예정 시간 등록 (LOT/W-O 필수,
  연락처/비고는 선택)
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
2. **SQL Editor**에서 순서대로 실행:
   - [`supabase/schema.sql`](supabase/schema.sql)
   - [`supabase/migrations/002_add_lot_wo_contact.sql`](supabase/migrations/002_add_lot_wo_contact.sql)
   - [`supabase/migrations/003_add_admin_role.sql`](supabase/migrations/003_add_admin_role.sql)
     (새 프로젝트라면 schema.sql에 이미 반영되어 있어 002, 003은 생략 가능)
3. **Authentication > Sign In / Providers**에서 **User Signups > "Confirm email" 옵션을 꺼주세요.**
   이 프로젝트는 내부 협력사용 도구라 회원가입 직후 바로 로그인 세션을 만들어
   회사 정보를 저장하는 방식이라, 이메일 인증을 켜두면 가입 흐름이 끊깁니다.
4. **Authentication > URL Configuration**에서 **Redirect URLs**에 아래 두 개를 등록:
   - `http://localhost:3000/set-password` (로컬 개발용, 포트가 다르면 맞게)
   - `https://내프로젝트.vercel.app/set-password` (배포 후 실제 도메인으로)
   Assembly 회사 초대 이메일의 링크가 이 목록에 없는 주소로는 리다이렉트되지 않습니다.
5. **Authentication > Emails**에서 **Invite user** 템플릿을 열어, 링크 부분을 아래처럼
   수정 (기본 `{{ .ConfirmationURL }}` 대신):
   ```html
   <a href="{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=invite">계정 활성화하기</a>
   ```
   Gmail 등 모바일 메일 앱이 링크를 사람이 누르기 전에 미리 스캔하면서 1회용 토큰을
   먼저 소모해버려 "링크 만료" 오류가 나는 문제 때문입니다. 이렇게 바꾸면 `/set-password`
   화면에서 사람이 실제로 버튼을 눌러야만 토큰이 소모됩니다 (자세한 내용은
   `src/app/set-password/page.tsx` 주석 참고).
6. **Project Settings > API**에서 `Project URL`, `anon public` 키, `service_role` 키를 확인

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
- `NEXT_PUBLIC_SITE_URL`: assembly 회사 초대 이메일 링크가 가리킬 주소. 로컬은
  `http://localhost:3000`(포트가 다르면 맞게), 배포 후에는 실제 Vercel 도메인으로

### 4. 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 접속 → `/signup`에서 납품 BP사 계정 생성 후 확인

### 5. 첫 관리자 계정 만들기

Admin 계정은 회원가입 화면에서 만들 수 없습니다 (의도적으로 막아둠). 아래처럼 한 번만
직접 승격시켜주세요:

1. `/signup`에서 관리자로 쓸 이메일로 평소처럼 가입 (역할은 상관없이 납품 BP사로 생성됨)
2. Supabase **SQL Editor**에서 실행:
   ```sql
   update public.profiles set role = 'admin'
   where id = (select id from auth.users where email = '본인이메일@example.com');
   ```
3. 다시 로그인하면 `/admin`으로 이동 — 여기서 assembly 회사를 이메일로 초대할 수 있습니다

## Vercel 배포

1. 이 저장소를 GitHub에 올린 뒤 Vercel에서 Import
2. Vercel 프로젝트의 **Environment Variables**에 `.env.local`과 동일한 값 등록
   (`NEXT_PUBLIC_SITE_URL`은 배포된 실제 도메인으로 — 예: `https://내프로젝트.vercel.app`)
3. Supabase **Authentication > URL Configuration > Redirect URLs**에도 그 도메인의
   `/set-password`를 등록 (2단계 참고)
4. 배포 후 접속 URL을 각 BP사에 공유 (모바일 브라우저에서도 반응형으로 동작)

## 폴더 구조

```
src/
  app/
    login/, signup/          로그인 · 회원가입(납품 BP사만)
    set-password/             초대 이메일로 들어와 비밀번호 설정
    admin/                    관리자: assembly 회사 이메일 초대/목록
    delivery/                 납품 BP사 대시보드 (예약 등록/재입력)
    assembly/                 Assembly BP사 대시보드 (히트맵/검색/승인·반려), settings/
  components/                 폼/테이블/캘린더 등 공용 UI
  lib/
    supabase/                 브라우저/서버/미들웨어/관리자 클라이언트
    types.ts                  Profile, Delivery, DeliveryWithCompany 타입
    conflicts.ts               시간 겹침 판정 로직
    date.ts                    로컬 날짜 계산(3주 캘린더 그리드 등)
    email.ts                   Resend 이메일 발송
supabase/
  schema.sql                  테이블, RLS 정책, 워크플로우를 강제하는 트리거
  migrations/                 이미 배포된 프로젝트에 순서대로 적용하는 변경분
```

## 다음 단계 후보

- 카카오톡 알림톡 연동 (이메일 대체/병행)
- 반복 납품 패턴 저장 (매주 같은 시간 등)
- 담당자 여러 명/회사당 계정 확장
- 지연·반려 통계 리포트
