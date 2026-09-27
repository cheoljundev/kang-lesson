// src/services/studentReports.ts
import { Student, Teacher, Lesson, ReportWithDetails } from "@/types/db";
import { createAdminClient } from "@/utils/supabase/server";

// ==============================================================================
// 1. MOCK DATA (데이터 구조 참고용 및 DB 연결 실패 시 Fallback 샘플)
// ==============================================================================
export const MOCK_TEACHERS: Record<string, Teacher> = {
    t1: { id: "t1", name: "김선생", phone: "010-1111-2222", is_ontact: false },
    t2: { id: "t2", name: "이선생", phone: "010-3333-4444", is_ontact: false },
    t3: { id: "t3", name: "박선생", phone: "010-5555-6666", is_ontact: true },
};

export const MOCK_STUDENTS: Student[] = [
    { id: "s1", name: "이지은", phone: "010-7777-8888" },
    { id: "s2", name: "박보검", phone: "010-9999-0000" },
    { id: "s3", name: "정해인", phone: "010-1234-5678" },
];

export interface LessonWithMapping extends Lesson {
    student: Student;
    main_teacher: Teacher;
    supplementary_teachers: Teacher[];
}

export const MOCK_LESSONS: LessonWithMapping[] = [
    {
        id: "l1",
        student_id: "s1",
        main_teacher_id: "t1",
        student: MOCK_STUDENTS[0],
        main_teacher: MOCK_TEACHERS.t1,
        supplementary_teachers: [MOCK_TEACHERS.t2], // 이지은: 주-김선생, 보충-이선생
    },
    {
        id: "l2",
        student_id: "s2",
        main_teacher_id: "t1",
        student: MOCK_STUDENTS[1],
        main_teacher: MOCK_TEACHERS.t1,
        supplementary_teachers: [], // 박보검: 주-김선생
    },
    {
        id: "l3",
        student_id: "s3",
        main_teacher_id: "t2",
        student: MOCK_STUDENTS[2],
        main_teacher: MOCK_TEACHERS.t2,
        supplementary_teachers: [MOCK_TEACHERS.t1], // 정해인: 주-이선생, 보충-김선생
    },
];

export const MOCK_REPORTS: ReportWithDetails[] = [
    // [이지은] 주 선생님(김선생) - 정규 (+1회 인정)
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
    // [이지은] 주 선생님(김선생) - 정규 (+1회 인정)
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
    // [이지은] 보충 선생님(이선생) - 보충 (+0회 미인정)
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
    // [박보검] 온택트 선생님(박선생) - 온택트 (+0회 미인정)
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
    // [정해인] 주 선생님(이선생) - 정규 (+1회 인정)
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

// ==============================================================================
// 2. SUPABASE 연동 데이터 조회 함수 (MOCK Fallback 포함)
// ==============================================================================
export async function getStudentReportViewData(
    targetStudentId?: string
): Promise<StudentReportViewData> {
    try {
        const supabase = createAdminClient();

        // 1. 전체 학생 목록 조회 (드롭다운 채우기용)
        const { data: students, error: studentError } = await supabase
            .from("students")
            .select("id, name, phone")
            .order("name", { ascending: true });

        if (studentError) throw studentError;

        // DB에 학생이 없는 경우 MOCK 샘플 반환
        if (!students || students.length === 0) {
            return getMockStudentReportViewData(targetStudentId);
        }

        // 2. 현재 선택된 학생 지정 (선택된 ID 매칭 또는 첫 번째 학생 기본값)
        const currentStudent =
            students.find((s) => s.id === targetStudentId) || students[0];

        // 3. 해당 학생의 수업 목록 및 교사 목록 병렬 조회
        const [{ data: lessons, error: lessonError }, { data: teachers, error: teacherError }] =
            await Promise.all([
                supabase
                    .from("lessons")
                    .select("id, student_id, main_teacher_id")
                    .eq("student_id", currentStudent.id),
                supabase.from("teachers").select("id, name, phone, is_ontact"),
            ]);

        if (lessonError) throw lessonError;
        if (teacherError) throw teacherError;

        const lessonIds = (lessons || []).map((l) => l.id);
        const lessonMap = new Map((lessons || []).map((l) => [l.id, l]));
        const teacherMap = new Map((teachers || []).map((t) => [t.id, t]));

        // 수강 중인 수업이 없는 경우 빈 보고서 목록 반환
        if (lessonIds.length === 0) {
            return {
                students,
                currentStudent,
                reports: [],
                totalCompletedCount: 0,
            };
        }

        // 4. 해당 학생의 수업에 등록된 보고서 목록 조회
        const { data: rawReports, error: reportError } = await supabase
            .from("reports")
            .select("*")
            .in("lesson_id", lessonIds)
            .order("started_at", { ascending: false });

        if (reportError) throw reportError;

        // 5. 프론트엔드 UI 규격(ReportWithDetails)에 맞게 데이터 조립
        const reports: ReportWithDetails[] = (rawReports || []).map((rep) => {
            const lesson = lessonMap.get(rep.lesson_id);
            const teacher = teacherMap.get(rep.teacher_id);

            return {
                ...rep,
                teacher: teacher || {
                    id: rep.teacher_id,
                    name: "알 수 없음",
                    phone: "",
                    is_ontact: false,
                },
                lesson: {
                    id: rep.lesson_id,
                    student_id: currentStudent.id,
                    main_teacher_id: lesson?.main_teacher_id || "",
                },
            };
        });

        // 6. [비즈니스 룰] 누적 수업 완료 횟수 카운트
        // 주 선생님(main_teacher_id)이 작성한 정규 수업(regular)만 1회 카운트
        const totalCompletedCount = reports.filter((rep) => {
            const lesson = lessonMap.get(rep.lesson_id);
            return lesson?.main_teacher_id === rep.teacher_id && rep.lesson_type === "regular";
        }).length;

        return {
            students,
            currentStudent,
            reports,
            totalCompletedCount,
        };
    } catch (error) {
        console.error("Supabase 학생 보고서 조회 실패 (MOCK 샘플 대체):", error);
        return getMockStudentReportViewData(targetStudentId);
    }
}

// MOCK 전용 로직 분리 함수
function getMockStudentReportViewData(targetStudentId?: string): StudentReportViewData {
    const students = MOCK_STUDENTS;
    const currentStudent = students.find((s) => s.id === targetStudentId) || students[0];

    const studentLessons = MOCK_LESSONS.filter((l) => l.student_id === currentStudent.id);
    const studentLessonIds = studentLessons.map((l) => l.id);

    const reports = MOCK_REPORTS.filter((rep) =>
        studentLessonIds.includes(rep.lesson_id)
    ).sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());

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