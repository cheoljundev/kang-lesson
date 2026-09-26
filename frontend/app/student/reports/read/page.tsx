import StudentSummary from "./_components/StudentSummary";
import ReportList from "./_components/ReportList";
import { Student, Lesson, ReportWithDetails } from "@/types/db";

export const metadata = {
    title: "학생 보고서 조회 | 강쌤과외",
};

// --- 목업 데이터 (실제 서비스에서는 DB 쿼리로 대체) ---
const MOCK_STUDENTS: Student[] = [
    { id: "1", name: "김철수", phone: "010-1111-2222" },
    { id: "2", name: "이영희", phone: "010-3333-4444" },
];

const MOCK_LESSONS: Lesson[] = [
    { id: "1", student_id: "1", main_teacher_id: "1" },
    { id: "2", student_id: "2", main_teacher_id: "2" },
];

const MOCK_REPORTS: ReportWithDetails[] = [
    {
        id: "1",
        lesson_id: "1",
        teacher_id: "1",
        lesson_type: "정규 수업",
        started_at: "2026-09-24T18:00:00",
        ended_at: "2026-09-24T20:00:00",
        report_content: "이차방정식 근과 계수의 관계 고난도 기출 풀이를 진행했습니다.",
        homework_content: "블랙라벨 p.42 ~ p.45 홀수 번호 풀기",
        teacher: { id: "1", name: "강쌤", phone: "010-9999-8888", is_ontact: false },
        lesson: { student_id: "1" },
    },
    {
        id: "2",
        lesson_id: "1",
        teacher_id: "1",
        lesson_type: "보충 수업",
        started_at: "2026-09-20T14:00:00",
        ended_at: "2026-09-20T16:00:00",
        report_content: "판별식 취약 유형 1:1 클리닉 진행 완료.",
        homework_content: "보충 프린트물 20제 완료",
        teacher: { id: "1", name: "강쌤", phone: "010-9999-8888", is_ontact: false },
        lesson: { student_id: "1" },
    },
    {
        id: "3",
        lesson_id: "2",
        teacher_id: "2",
        lesson_type: "정규 수업",
        started_at: "2026-09-23T19:00:00",
        ended_at: "2026-09-23T21:00:00",
        report_content: "모의고사 빈칸 추론 구문 분석 완료.",
        homework_content: "영단어 100개 암기",
        teacher: { id: "2", name: "이선생님", phone: "010-5555-6666", is_ontact: true },
        lesson: { student_id: "2" },
    },
];

interface PageProps {
    searchParams: Promise<{ studentId?: string }>;
}

export default async function StudentReportReadPage({ searchParams }: PageProps) {
    const { studentId } = await searchParams;

    // 1. 현재 선택된 학생 지정 (기본값: 첫 번째 학생)
    const currentStudent =
        MOCK_STUDENTS.find((s) => s.id === studentId) || MOCK_STUDENTS[0];

    // 2. 선택된 학생의 ID와 연결된 Lesson들의 ID 목록 추출
    const studentLessonIds = MOCK_LESSONS.filter(
        (l) => l.student_id === currentStudent.id
    ).map((l) => l.id);

    // 3. 해당 Lesson들에 속한 Report들만 필터링
    const filteredReports = MOCK_REPORTS.filter((rep) =>
        studentLessonIds.includes(rep.lesson_id)
    );

    return (
        <div className="mx-auto px-6 py-10">
            <div className="mb-6">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-1">
                    학생 보고서 조회
                </h2>
                <p className="text-sm text-gray-500">
                    선택한 수강생의 일자별 수업 리포트와 진도 현황을 확인합니다.
                </p>
            </div>

            {/* 학생 선택 및 누적 완료 횟수 (Student 스키마 및 Lesson 연동) */}
            <StudentSummary
                students={MOCK_STUDENTS}
                currentStudent={currentStudent}
                totalCompletedCount={filteredReports.length}
            />

            {/* 보고서 목록 */}
            <div>
                <h3 className="text-base font-bold text-gray-900 mb-4">
                    수업 일지 목록 ({filteredReports.length}건)
                </h3>
                <ReportList reports={filteredReports} />
            </div>
        </div>
    );
}