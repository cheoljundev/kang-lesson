with
-- 1. 선생님 데이터 등록 (박선생만 is_ontact = true)
inserted_teachers as (
insert into teachers (name, phone, is_ontact)
values
    ('김선생', '010-1111-2222', false),
    ('이선생', '010-3333-4444', false),
    ('박선생', '010-5555-6666', true)
    returning id, name
    ),

-- 2. 학생 데이터 등록
    inserted_students as (
insert into students (name, phone)
values
    ('이지은', '010-7777-8888'),
    ('박보검', '010-9999-0000'),
    ('정해인', '010-1234-5678')
    returning id, name
    ),

-- 3. 수업(Lesson) 매핑 등록 (학생 - 담당 선생님 배정)
    inserted_lessons as (
insert into lessons (student_id, main_teacher_id)
values
    -- 이지은 학생 -> 김선생님 배정
    (
    (select id from inserted_students where name = '이지은'),
    (select id from inserted_teachers where name = '김선생')
    ),
    -- 박보검 학생 -> 김선생님 배정
    (
    (select id from inserted_students where name = '박보검'),
    (select id from inserted_teachers where name = '김선생')
    ),
    -- 정해인 학생 -> 이선생님 배정
    (
    (select id from inserted_students where name = '정해인'),
    (select id from inserted_teachers where name = '이선생')
    )
    returning id, student_id, main_teacher_id
    )

-- 4. 수업 보고서(Report) 등록
insert into reports (lesson_id, teacher_id, lesson_type, started_at, ended_at, report_content, homework_content)
values
    -- 이지은 학생 정규 수업 (김선생님)
    (
    (select l.id from inserted_lessons l join inserted_students s on l.student_id = s.id where s.name = '이지은'),
    (select id from inserted_teachers where name = '김선생'),
    'regular',
    '2026-09-20 14:00:00+09',
    '2026-09-20 15:30:00+09',
    '기본 문법 복습 완료. 개념 이해도가 높으며 실습 문제를 빠르게 해결함.',
    '워크북 12~15페이지 풀고 오답노트 작성'
    ),
    (
    (select l.id from inserted_lessons l join inserted_students s on l.student_id = s.id where s.name = '이지은'),
    (select id from inserted_teachers where name = '김선생'),
    'regular',
    '2026-09-24 14:00:00+09',
    '2026-09-24 15:30:00+09',
    '심화 문제 풀이 진행. 특정 응용 유형에서 힌트가 다소 필요했음.',
    '오답 유형 5문제 다시 풀어보기'
    ),

    -- 박보검 학생 보강 수업 (온택트 담당 박선생님 대타)
    (
    (select l.id from inserted_lessons l join inserted_students s on l.student_id = s.id where s.name = '박보검'),
    (select id from inserted_teachers where name = '박선생'),
    'makeup',
    '2026-09-22 16:00:00+09',
    '2026-09-22 17:30:00+09',
    '지난주 결석분 온라인 보강 진행. 핵심 개념 위주로 요약 설명 완료.',
    '단원 마무리 평가 1회차 풀기'
    ),

    -- 정해인 학생 정규 수업 (이선생님)
    (
    (select l.id from inserted_lessons l join inserted_students s on l.student_id = s.id where s.name = '정해인'),
    (select id from inserted_teachers where name = '이선생'),
    'regular',
    '2026-09-25 18:00:00+09',
    '2026-09-25 19:30:00+09',
    '첫 진도 시작. 수업 집중도가 좋고 질의응답이 활발함.',
    '어휘 암기 20개 및 예문 읽기'
    );