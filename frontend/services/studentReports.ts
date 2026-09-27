// src/services/studentReports.ts
import { Student, Teacher, Lesson, ReportWithDetails } from "@/types/db";

// --- 목업 데이터 (추후 Supabase 클라이언트 호출로 대체) ---
const MOCK_TEACHERS: Record<string, Teacher> = {
    t1: { id: "t1", name: "김선생", phone: "010-1111-2222", is_ontact: false },
    t2: { id: "t2", name: "이선생", phone: "010-3333-4444", is_ontact: false },
    t3: { id: "t3", name: "박선생", phone: "010-5555-6666", is_ontact: true },
};

const MOCK_STUDENTS: Student[] = [
    { id: "s1", name: "이지은", phone: "010-7777-8888" },
    { id: "s2", name: "박보검", phone: "010-9999-0000" },
    { id: "s3", name: "정해인", phone: "010-1234-5678" },
];

interface LessonWithMapping extends Lesson {
    student: Student;
    main_teacher: Teacher;
    supplementary_teachers: Teacher[];
}

const MOCK_LESSONS: LessonWithMapping[] = [
    {
        id: "l1",
        student_id: "s1",
        main_teacher_id: "t1",
        student: MOCK_STUDENTS[0],
        main_teacher: MOCK_TEACHERS.t1,
        supplementary_teachers: [MOCK_TEACHERS.t2],
    },
    {
        id: "l2",
        student_id: "s2",
        main_teacher_id: "t1",
        student: MOCK_STUDENTS[1],
        main_teacher: MOCK_TEACHERS.t1,
        supplementary_teachers: [],
    },
    {
        id: "l3",
        student_id: "s3",
        main_teacher_id: "t2",
        student: MOCK_STUDENTS[2],
        main_teacher: MOCK_TEACHERS.t2,
        supplementary_teachers: [MOCK_TEACHERS.t1],
    },
];

const MOCK_REPORTS: ReportWithDetails[] = [
    {
        id: "r1",
        lesson_id: "l1",
        teacher_id: "t1",
        lesson_type: "regular",
        started_at: "2026-09-20T14:00:00+09:00",
        ended_at: "2026-09-20T15:30:00+09:00",
        report_content: "기본 문법 복습 완료. 개념 이해도가 높으며 실습 문제를 빠르게 해결함.",
        homework_content: "워크북 12~15페이지 풀고 오답노트 작성",
        teacher: MOCK_TEACHERS.t1,
        lesson: {
            id: "l1",
            student_id: "s1",
            main_teacher_id: "t1",
            student: MOCK_STUDENTS[0],
            main_teacher: MOCK_TEACHERS.t1,
            supplementary_teachers: [MOCK_TEACHERS.t2],
        },
    },
    {
        id: "r2",
        lesson_id: "l1",
        teacher_id: "t1",
        lesson_type: "regular",
        started_at: "2026-09-24T14:00:00+09:00",
        ended_at: "2026-09-24T15:30:00+09:00",
        report_content: "심화 문제 풀이 진행. 특정 응용 유형에서 힌트가 다소 필요했음.",
        homework_content: "오답 유형 5문제 다시 풀어보기",
        teacher: MOCK_TEACHERS.t1,
        lesson: {
            id: "l1",
            student_id: "s1",
            main_teacher_id: "t1",
            student: MOCK_STUDENTS[0],
            main_teacher: MOCK_TEACHERS.t1,
            supplementary_teachers: [MOCK_TEACHERS.t2],
        },
    },
    {
        id: "r3",
        lesson_id: "l1",
        teacher_id: "t2",
        lesson_type: "supplementary",
        started_at: "2026-09-25T10:00:00+09:00",
        ended_at: "2026-09-25T11:30:00+09:00",
        report_content: "서술형 대비 첨삭 클리닉 진행. 감점 요인 점검 완료.",
        homework_content: "서술형 3문항 다시 쓰기 과제",
        teacher: MOCK_TEACHERS.t2,
        lesson: {
            id: "l1",
            student_id: "s1",
            main_teacher_id: "t1",
            student: MOCK_STUDENTS[0],
            main_teacher: MOCK_TEACHERS.t1,
            supplementary_teachers: [MOCK_TEACHERS.t2],
        },
    },
    {
        id: "r4",
        lesson_id: "l2",
        teacher_id: "t3",
        lesson_type: "ontact",
        started_at: "2026-09-22T16:00:00+09:00",
        ended_at: "2026-09-22T17:30:00+09:00",
        report_content: "지난주 결석분 온라인 보강 진행. 핵심 개념 위주로 요약 설명 완료.",
        homework_content: "단원 마무리 평가 1회차 풀기",
        teacher: MOCK_TEACHERS.t3,
        lesson: {
            id: "l2",
            student_id: "s2",
            main_teacher_id: "t1",
            student: MOCK_STUDENTS[1],
            main_teacher: MOCK_TEACHERS.t1,
            supplementary_teachers: [],
        },
    },
    {
        id: "r5",
        lesson_id: "l3",
        teacher_id: "t2",
        lesson_type: "regular",
        started_at: "2026-09-25T18:00:00+09:00",
        ended_at: "2026-09-25T19:30:00+09:00",
        report_content: "첫 진도 시작. 수업 집중도가 좋고 질의응답이 활발함.",
        homework_content: "어휘 암기 20개 및 예문 읽기",
        teacher: MOCK_TEACHERS.t2,
        lesson: {
            id: "l3",
            student_id: "s3",
            main_teacher_id: "t2",
            student: MOCK_STUDENTS[2],
            main_teacher: MOCK_TEACHERS.t2,
            supplementary_teachers: [MOCK_TEACHERS.t1],
        },
    },
];

export interface StudentReportViewData {
    students: Student[];
    currentStudent: Student;
    reports: ReportWithDetails[];
    totalCompletedCount: number;
}

export async function getStudentReportViewData(
    targetStudentId?: string
): Promise<StudentReportViewData> {
    /*
    // [추후 Supabase 연동 코드 구조]
    const supabase = await createClient();

    // 1. 전체 학생 목록
    const { data: students } = await supabase.from('students').select('*').order('name');
    const currentStudent = students?.find(s => s.id === targetStudentId) || students?.[0];

    // 2. 현재 학생의 수업 보고서 (Teacher, Lesson 조인)
    const { data: reports } = await supabase
        .from('reports')
        .select(`*, teacher:teachers(*), lesson:lessons!inner(*, student:students(*), main_teacher:teachers!main_teacher_id(*))`)
        .eq('lesson.student_id', currentStudent.id)
        .order('started_at', { ascending: false });

    // 3. 누적 완료 횟수 (주선생님 + regular)
    const totalCompletedCount = reports?.filter(
        r => r.teacher_id === r.lesson.main_teacher_id && r.lesson_type === 'regular'
    ).length ?? 0;
    */

    const students = MOCK_STUDENTS;
    const currentStudent = students.find((s) => s.id === targetStudentId) || students[0];

    const studentLessons = MOCK_LESSONS.filter((l) => l.student_id === currentStudent.id);
    const studentLessonIds = studentLessons.map((l) => l.id);

    const reports = MOCK_REPORTS.filter((rep) =>
        studentLessonIds.includes(rep.lesson_id)
    ).sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());

    // 비즈니스 룰: 주 선생님(main_teacher_id)이 작성한 정규 수업(regular)만 1회 인정
    const totalCompletedCount = reports.filter((rep) => {
        const lesson = studentLessons.find((l) => l.id === rep.lesson_id);
        return lesson?.main_teacher_id === rep.teacher_id && rep.lesson_type === "regular";
    }).length;

    return {
        students,
        currentStudent,
        reports,
        totalCompletedCount,
    };
}