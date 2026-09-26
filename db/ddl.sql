-- 1. UUID 확장 활성화 (Supabase 기본 내장)
create extension if not exists "pgcrypto";

-- 2. updated_at 자동 갱신 트리거 함수
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
return new;
end;
$$ language plpgsql;

-- 3. Teacher 테이블
create table teachers (
                          id uuid primary key default gen_random_uuid(),
                          name text not null,
                          phone text,
                          is_ontact boolean not null default false,
                          created_at timestamptz not null default now(),
                          updated_at timestamptz not null default now()
);

-- 4. Student 테이블
create table students (
                          id uuid primary key default gen_random_uuid(),
                          name text not null,
                          phone text,
                          created_at timestamptz not null default now(),
                          updated_at timestamptz not null default now()
);

-- 5. Lesson 테이블 (학생과 메인 교사 매핑)
create table lessons (
                         id uuid primary key default gen_random_uuid(),
                         student_id uuid not null references students(id) on delete cascade,
                         main_teacher_id uuid not null references teachers(id) on delete restrict,
                         created_at timestamptz not null default now(),
                         updated_at timestamptz not null default now()
);

-- 6. Report 테이블 (수업 보고서/일지)
create table reports (
                         id uuid primary key default gen_random_uuid(),
                         lesson_id uuid not null references lessons(id) on delete cascade,
                         teacher_id uuid not null references teachers(id) on delete restrict, -- 대타 수업 등을 고려해 직접 작성 교사 기록
                         lesson_type text not null, -- 예: 'regular', 'substitute', 'makeup' 등
                         started_at timestamptz not null,
                         ended_at timestamptz not null,
                         report_content text,
                         homework_content text,
                         created_at timestamptz not null default now(),
                         updated_at timestamptz not null default now(),

    -- 시작 시각이 종료 시각보다 앞서야 하는 무결성 제약조건
                         constraint check_lesson_period check (started_at <= ended_at)
);

-- 7. 외래 키 조회 성능 최적화를 위한 인덱스 생성
create index idx_lessons_student_id on lessons(student_id);
create index idx_lessons_main_teacher_id on lessons(main_teacher_id);
create index idx_reports_lesson_id on reports(lesson_id);
create index idx_reports_teacher_id on reports(teacher_id);
create index idx_reports_started_at on reports(started_at);

-- 8. updated_at 자동 트리거 바인딩
create trigger update_teachers_updated_at before update on teachers
    for each row execute function update_updated_at_column();

create trigger update_students_updated_at before update on students
    for each row execute function update_updated_at_column();

create trigger update_lessons_updated_at before update on lessons
    for each row execute function update_updated_at_column();

create trigger update_reports_updated_at before update on reports
    for each row execute function update_updated_at_column();

-- 9. Supabase RLS (Row Level Security) 활성화
alter table teachers enable row level security;
alter table students enable row level security;
alter table lessons enable row level security;
alter table reports enable row level security;