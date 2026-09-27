-- ==============================================================================
-- 0. 기존 테이블 데이터 초기화 (외래 키 종속성 일괄 해제)
-- ==============================================================================
truncate table
    reports,
    lesson_supplementary_teachers,
    lessons,
    students,
    teachers
restart identity cascade;

-- ==============================================================================
-- 1. 씨드 데이터 삽입
-- ==============================================================================
with
-- 1) 선생님 데이터 등록 (박선생만 온택트 교사)
inserted_teachers as (
insert into teachers (name, phone, is_ontact)
values
    ('김선생', '010-1111-2222', false),
    ('이선생', '010-3333-4444', false),
    ('박선생', '010-5555-6666', true)
    returning id, name, is_ontact
    ),

-- 2) 학생 데이터 등록
    inserted_students as (
insert into students (name, phone)
values
    ('이지은', '010-7777-8888'),
    ('박보검', '010-9999-0000'),
    ('정해인', '010-1234-5678')
    returning id, name
    ),

-- 3) 수업(Lesson) 매핑 등록 (학생 - 주 담당 선생님 배정)
    inserted_lessons as (
insert into lessons (student_id, main_teacher_id)
values
    -- 이지은 학생 -> 주 선생님: 김선생
    (
    (select id from inserted_students where name = '이지은'),
    (select id from inserted_teachers where name = '김선생')
    ),
    -- 박보검 학생 -> 주 선생님: 김선생
    (
    (select id from inserted_students where name = '박보검'),
    (select id from inserted_teachers where name = '김선생')
    ),
    -- 정해인 학생 -> 주 선생님: 이선생
    (
    (select id from inserted_students where name = '정해인'),
    (select id from inserted_teachers where name = '이선생')
    )
    returning id, student_id, main_teacher_id
    ),

-- 4) 보충 선생님(Supplementary Teacher) 매핑 등록
    inserted_supplementary_teachers as (
insert into lesson_supplementary_teachers (lesson_id, teacher_id)
values
    -- 이지은 학생 수업에 '이선생'을 보충 선생님으로 배정
    (
    (select l.id from inserted_lessons l join inserted_students s on l.student_id = s.id where s.name = '이지은'),
    (select id from inserted_teachers where name = '이선생')
    ),
    -- 정해인 학생 수업에 '김선생'을 보충 선생님으로 배정
    (
    (select l.id from inserted_lessons l join inserted_students s on l.student_id = s.id where s.name = '정해인'),
    (select id from inserted_teachers where name = '김선생')
    )
    returning id, lesson_id, teacher_id
    )

-- 5) 수업 보고서(Report) 등록 (유형별 정합성 테스트 데이터)
insert into reports (lesson_id, teacher_id, lesson_type, started_at, ended_at, report_content, homework_content)
values
    -- [케이스 1] 이지은 학생: 주 선생님(김선생)의 정규 수업 1회차 (수업 완료 +1)
    (
    (select l.id from inserted_lessons l join inserted_students s on l.student_id = s.id where s.name = '이지은'),
    (select id from inserted_teachers where name = '김선생'),
    'regular',
    '2026-09-20 14:00:00+09',
    '2026-09-20 15:30:00+09',
    '기본 문법 복습 완료. 개념 이해도가 높으며 실습 문제를 빠르게 해결함.',
    '워크북 12~15페이지 풀고 오답노트 작성'
    ),

    -- [케이스 2] 이지은 학생: 주 선생님(김선생)의 정규 수업 2회차 (수업 완료 +1)
    (
    (select l.id from inserted_lessons l join inserted_students s on l.student_id = s.id where s.name = '이지은'),
    (select id from inserted_teachers where name = '김선생'),
    'regular',
    '2026-09-24 14:00:00+09',
    '2026-09-24 15:30:00+09',
    '심화 문제 풀이 진행. 특정 응용 유형에서 힌트가 다소 필요했음.',
    '오답 유형 5문제 다시 풀어보기'
    ),

    -- [케이스 3] 이지은 학생: 배정된 보충 선생님(이선생)의 보충 수업 (수업 완료 +0)
    (
    (select l.id from inserted_lessons l join inserted_students s on l.student_id = s.id where s.name = '이지은'),
    (select id from inserted_teachers where name = '이선생'),
    'supplementary',
    '2026-09-25 10:00:00+09',
    '2026-09-25 11:30:00+09',
    '서술형 대비 첨삭 클리닉 진행. 감점 요인 점검 완료.',
    '서술형 3문항 다시 쓰기 과제'
    ),

    -- [케이스 4] 박보검 학생: 온택트 선생님(박선생)의 원격 수업 (수업 완료 +0)
    (
    (select l.id from inserted_lessons l join inserted_students s on l.student_id = s.id where s.name = '박보검'),
    (select id from inserted_teachers where name = '박선생'),
    'ontact',
    '2026-09-22 16:00:00+09',
    '2026-09-22 17:30:00+09',
    '지난주 결석분 온라인 보강 진행. 핵심 개념 위주로 요약 설명 완료.',
    '단원 마무리 평가 1회차 풀기'
    ),

    -- [케이스 5] 정해인 학생: 주 선생님(이선생)의 정규 수업 (수업 완료 +1)
    (
    (select l.id from inserted_lessons l join inserted_students s on l.student_id = s.id where s.name = '정해인'),
    (select id from inserted_teachers where name = '이선생'),
    'regular',
    '2026-09-25 18:00:00+09',
    '2026-09-25 19:30:00+09',
    '첫 진도 시작. 수업 집중도가 좋고 질의응답이 활발함.',
    '어휘 암기 20개 및 예문 읽기'
    );