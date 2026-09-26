// src/app/teacher/reports/new/page.tsx
import ReportForm from "./_components/ReportForm";
import { LessonWithDetails, Teacher } from "@/types/db"; // 경로에 맞게 확인

export const metadata = {
    title: "선생님 보고서 작성 | 강쌤과외",
    description: "수업 종료 후 작성하는 수업 결과 보고서입니다.",
};

// 목업 데이터 (추후 실제 DB 쿼리나 API 호출로 교체)
const MOCK_TEACHERS: Teacher[] = [
    { id: "1", name: "김선생님(주선생님)", phone: "010-1234-5678", is_ontact: false },
    { id: "2", name: "이선생님(보충선생님)", phone: "010-2939-4323", is_ontact: false },
    { id: "3", name: "박선생님(온택트선생님)", phone: "010-9876-5432", is_ontact: true },
];

const MOCK_LESSONS: LessonWithDetails[] = [
    {
        id: "1",
        student_id: "1",
        main_teacher_id: "1",
        student: { id: "1", name: "김철수", phone: "010-1111-2222" },
        main_teacher: { id: "1", name: "강쌤", phone: "010-1234-5678", is_ontact: false },
    },
    {
        id: "2",
        student_id: "2",
        main_teacher_id: "2",
        student: { id: "2", name: "이영희", phone: "010-3333-4444" },
        main_teacher: { id: "2", name: "이선생님", phone: "010-9876-5432", is_ontact: true },
    },
];

export default function NewReportPage() {
    return (
        <div className="mx-auto px-6 py-10">
            <div className="mb-8">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-1">
                    선생님 보고서 작성
                </h2>
                <p className="text-sm text-gray-500">
                    수업 진행 내용과 학생 숙제를 빠짐없이 입력해주세요.
                </p>
            </div>

            <div className="border border-gray-200 rounded-xl p-6 sm:p-8 bg-white">
                {/* 필수 props인 lessons와 teachers 전달 */}
                <ReportForm lessons={MOCK_LESSONS} teachers={MOCK_TEACHERS} />
            </div>
        </div>
    );
}