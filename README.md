# 📚 강쌤과외 수업 일지 및 보고서 관리 시스템

Next.js App Router와 Supabase를 기반으로 구축된 과외 수업 일지 작성 및 학생별 보고서 조회 플랫폼입니다.  
별도의 복잡한 로그인 절차 없이, 표준적인 Next.js 서버 백엔드 통제(Service Role Key 기반 RLS 우회) 방식으로 안전하게 데이터를 처리합니다.

🔗 **배포 데모 사이트**: [https://kang-lesson.vercel.app/](https://kang-lesson.vercel.app/)

---

## 🚀 1. 프로젝트 실행 방법

### 1-1. 환경 변수 설정
프로젝트 최상위 루트 디렉터리에 `.env.local` 파일을 생성하고 Supabase 대시보드에서 발급받은 키를 등록합니다.

```env
# Supabase Project URL (끝에 /rest/v1 또는 슬래시 없이 도메인만 입력)
NEXT_PUBLIC_SUPABASE_URL=[https://your-project-ref.supabase.co](https://your-project-ref.supabase.co)

# Supabase Anon Key (Public)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...

# Supabase Service Role Key (Secret - 서버 백엔드 전용, NEXT_PUBLIC_ 접두사 금지)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
```

### 1-2. 패키지 설치 및 개발 서버 실행
```bash
# 의존성 패키지 설치
npm install

# 로컬 개발 서버 실행
npm run dev
```

### 1-3. 접속 경로
* **서비스 데모**: [https://kang-lesson.vercel.app/](https://kang-lesson.vercel.app/)
* **선생님 보고서 작성**: [https://kang-lesson.vercel.app/teacher/reports/new](https://kang-lesson.vercel.app/teacher/reports/new) (로컬: `http://localhost:3000/teacher/reports/new`)
* **학생 보고서 조회**: [https://kang-lesson.vercel.app/student/reports/read](https://kang-lesson.vercel.app/student/reports/read) (로컬: `http://localhost:3000/student/reports/read`)

---

## 🗄️ 2. 테이블 구조 설명

데이터베이스는 PostgreSQL(Supabase)을 기반으로 하며, 모든 테이블은 RLS(Row Level Security)가 활성화되어 있어 외부 브라우저의 직접적인 접근이 차단됩니다. (Next.js 백엔드 서버에서 `SUPABASE_SERVICE_ROLE_KEY`를 통해서만 안전하게 데이터 입출력 수행)

```
[teachers] (교사)
  ├── id (UUID, PK)
  ├── name (TEXT)
  ├── phone (TEXT)
  ├── is_ontact (BOOLEAN) - 온택트 교사 여부
  └── created_at / updated_at (TIMESTAMPTZ)

[students] (학생)
  ├── id (UUID, PK)
  ├── name (TEXT)
  ├── phone (TEXT)
  └── created_at / updated_at (TIMESTAMPTZ)

[lessons] (수업 매핑)
  ├── id (UUID, PK)
  ├── student_id (UUID, FK -> students.id)
  ├── main_teacher_id (UUID, FK -> teachers.id) - 해당 수업의 주 담당 교사
  └── created_at / updated_at (TIMESTAMPTZ)

[lesson_supplementary_teachers] (수업-보충 교사 매핑, N:M)
  ├── id (UUID, PK)
  ├── lesson_id (UUID, FK -> lessons.id)
  ├── teacher_id (UUID, FK -> teachers.id)
  └── created_at (TIMESTAMPTZ)
  * Unique Constraint: (lesson_id, teacher_id)

[reports] (수업 보고서 일지)
  ├── id (UUID, PK)
  ├── lesson_id (UUID, FK -> lessons.id)
  ├── teacher_id (UUID, FK -> teachers.id) - 실제 수업을 진행하고 작성한 교사
  ├── lesson_type (TEXT) - 'regular' | 'supplementary' | 'ontact'
  ├── started_at (TIMESTAMPTZ)
  ├── ended_at (TIMESTAMPTZ)
  ├── report_content (TEXT)
  ├── homework_content (TEXT)
  └── created_at / updated_at (TIMESTAMPTZ)
  * Check Constraint: started_at <= ended_at
  * Check Constraint: lesson_type IN ('regular', 'supplementary', 'ontact')
```

### 테이블 상세 설명
1. **`teachers` (교사 테이블)**:
    * 과외 수업을 진행하는 선생님 정보.
    * `is_ontact`: 온택트(비대면 보강/질의응답 전용) 교사 여부 플래그.
2. **`students` (학생 테이블)**:
    * 수강생 기본 정보 관리.
3. **`lessons` (수업 매핑 테이블)**:
    * 학생(`student_id`)과 해당 수업을 책임지는 **주 담당 선생님(`main_teacher_id`)**을 1:1로 매핑.
4. **`lesson_supplementary_teachers` (수업-보충 교사 매핑 테이블)**:
    * 정규 수업 외에 첨삭, 질의응답, 보충 수업을 지원하는 보충 선생님들의 N:M 연결 테이블.
    * `(lesson_id, teacher_id)` 복합 유니크 제약조건으로 중복 배정 방지.
5. **`reports` (수업 보고서 일지 테이블)**:
    * 실제 진행된 수업 단위의 학습 내용 및 과제 기록.
    * `started_at <= ended_at` 기간 검증 제약조건 포함.
    * `lesson_type`: 수업 성격 구분 (`regular`: 정규, `supplementary`: 보충, `ontact`: 온택트).

---

## 📊 3. 수업 완료 횟수 계산 방식 설명

본 시스템은 **과외 운영 규정 및 정산/진도 기준**에 따라 공정하고 엄격한 계산 방식을 적용합니다.

### 📌 핵심 비즈니스 룰
> **"해당 수업의 주 담당 선생님(Main Teacher)이 진행한 정규 수업(Regular) 보고서만 공식 완료 횟수(+1회)로 인정한다."**

| 구분 | 주 담당 선생님 (Main Teacher) | 보충 선생님 (Supplementary) | 온택트 선생님 (Ontact) |
| :--- | :---: | :---: | :---: |
| **정규 수업 (`regular`)** | **✅ +1회 인정** | ❌ 0회 (불인정) | ❌ 0회 (불인정) |
| **보충 수업 (`supplementary`)** | ❌ 0회 (불인정) | ❌ 0회 (불인정) | ❌ 0회 (불인정) |
| **온택트 수업 (`ontact`)** | ❌ 0회 (불인정) | ❌ 0회 (불인정) | ❌ 0회 (불인정) |

### 🔍 계산 알고리즘 (`src/services/studentReports.ts`)
1. 학생의 수강 목록(`lessons`)에서 각 수업의 `main_teacher_id`를 확인합니다.
2. 학생에게 등록된 모든 보고서(`reports`) 목록 중 다음 **2가지 조건을 동시에 만족하는 보고서만 필터링하여 합산**합니다:
    * `report.teacher_id === lesson.main_teacher_id` (작성자가 해당 수업의 주 담당 교사일 것)
    * `report.lesson_type === 'regular'` (수업 유형이 정규 수업일 것)
3. 보충 교사의 클리닉 수업(`supplementary`)이나 온택트 질의응답/보강(`ontact`)은 보고서 일지에는 정상 기록 및 열람되지만, **누적 완료 횟수 카운트에서는 제외(0회)**됩니다.

---

## 🔮 4. 추후 개선 사항 (Roadmap)

### 4-1. 사용자 인증 및 역할(Role) 기반 메뉴 분기 처리
* **현재 상태**: 누구나 URL을 통해 선생님 보고서 작성 화면과 학생 보고서 조회 화면에 접근 가능.
* **개선 계획**:
    * Supabase Auth 연동 및 미들웨어(`middleware.ts`) 세션 제어 적용.
    * **선생님 계정 세션**: 보고서 작성 페이지(`/teacher/reports/new`) 및 담당 수업 일지 관리 권한 부여.
    * **학생/학부모 계정 세션**: 타 학생 정보 접근 차단 및 해당 학생의 보고서 조회 페이지(`/student/reports/read`)만 노출되도록 분기 처리.

### 4-2. LLM 기반 AI 에이전트 연동 (선생님 작성 부담 경감)
* **현재 상태**: 선생님이 보고서 내용 및 과제 상세 내용을 직접 장문으로 서술하여 작성.
* **개선 계획**:
    * 보고서 작성 폼 내 'AI 초안 다듬기' 기능 탑재.
    * 선생님이 키워드나 요약 메모(예: *"삼각함수 진도, 공식 암기 부족, 연습문제 10~15번 숙제"*)만 간략히 입력하면, LLM 에이전트가 학생과 학부모가 읽고 신뢰할 수 있는 전문적이고 친절한 피드백 문장으로 자동 변환/보정.