-- ==============================================================================
-- 1. 확장 및 공통 함수 설정
-- ==============================================================================
create extension if not exists "pgcrypto";

-- updated_at 자동 갱신 트리거 함수
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
return new;
end;
$$ language plpgsql;

-- ==============================================================================
-- 2. 기본 엔티티 테이블 (Teachers, Students)
-- ==============================================================================
-- 교사 테이블
create table teachers (
                          id         uuid primary key     default gen_random_uuid(),
                          name       text        not null,
                          phone      text,
                          is_ontact  boolean     not null default false,
                          created_at timestamptz not null default now(),
                          updated_at timestamptz not null default now()
);

-- 학생 테이블
create table students (
                          id         uuid primary key     default gen_random_uuid(),
                          name       text        not null,
                          phone      text,
                          created_at timestamptz not null default now(),
                          updated_at timestamptz not null default now()
);

-- ==============================================================================
-- 3. 수업 및 관계 테이블 (Lessons, Lesson_Supplementary_Teachers)
-- ==============================================================================
-- 수업 테이블 (학생 - 주 담당 선생님 매핑)
create table lessons (
                         id              uuid primary key     default gen_random_uuid(),
                         student_id      uuid        not null references students (id) on delete cascade,
                         main_teacher_id uuid        not null references teachers (id) on delete restrict,
                         created_at      timestamptz not null default now(),
                         updated_at      timestamptz not null default now()
);

-- 수업별 보충 선생님 매핑 테이블 (N:M 관계)
create table lesson_supplementary_teachers (
                                               id         uuid primary key     default gen_random_uuid(),
                                               lesson_id  uuid        not null references lessons (id) on delete cascade,
                                               teacher_id uuid        not null references teachers (id) on delete restrict,
                                               created_at timestamptz not null default now(),

    -- 한 수업에 동일한 보충 선생님 중복 배정 방지
                                               constraint uq_lesson_supplementary_teacher unique (lesson_id, teacher_id)
);

-- ==============================================================================
-- 4. 수업 보고서 테이블 (Reports)
-- ==============================================================================
create table reports (
                         id               uuid primary key     default gen_random_uuid(),
                         lesson_id        uuid        not null references lessons (id) on delete cascade,
                         teacher_id       uuid        not null references teachers (id) on delete restrict,
                         lesson_type      text        not null,
                         started_at       timestamptz not null,
                         ended_at         timestamptz not null,
                         report_content   text,
                         homework_content text,
                         created_at       timestamptz not null default now(),
                         updated_at       timestamptz not null default now(),

    -- 시작 시각이 종료 시각보다 앞서야 함
                         constraint check_lesson_period check (started_at <= ended_at),
    -- 비즈니스 수업 유형 무결성 제약조건
                         constraint check_valid_lesson_type check (lesson_type in ('regular', 'supplementary', 'ontact'))
);

-- ==============================================================================
-- 5. 성능 최적화 인덱스
-- ==============================================================================
create index idx_lessons_student_id on lessons (student_id);
create index idx_lessons_main_teacher_id on lessons (main_teacher_id);

create index idx_lesson_supplementary_teachers_lesson_id on lesson_supplementary_teachers (lesson_id);
create index idx_lesson_supplementary_teachers_teacher_id on lesson_supplementary_teachers (teacher_id);

create index idx_reports_lesson_id on reports (lesson_id);
create index idx_reports_teacher_id on reports (teacher_id);
create index idx_reports_started_at on reports (started_at desc);

-- ==============================================================================
-- 6. updated_at 자동 갱신 트리거 바인딩
-- ==============================================================================
create trigger update_teachers_updated_at
    before update on teachers
    for each row execute function update_updated_at_column();

create trigger update_students_updated_at
    before update on students
    for each row execute function update_updated_at_column();

create trigger update_lessons_updated_at
    before update on lessons
    for each row execute function update_updated_at_column();

create trigger update_reports_updated_at
    before update on reports
    for each row execute function update_updated_at_column();

-- ==============================================================================
-- 7. RLS 보안 활성화 (외부 anon 직접 접근 전면 차단)
-- ==============================================================================
-- Policy를 작성하지 않고 활성화만 해두면 브라우저/외부 클라이언트의 직접 접근이 완전 차단됩니다.
-- 데이터 조작은 오직 Next.js 서버(Service Role Key)를 통해서만 안전하게 이루어집니다.
alter table teachers enable row level security;
alter table students enable row level security;
alter table lessons enable row level security;
alter table lesson_supplementary_teachers enable row level security;
alter table reports enable row level security;

-- PostgREST 스키마 캐시 새로고침
NOTIFY pgrst, 'reload schema';