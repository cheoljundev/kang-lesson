// src/app/student/reports/read/page.tsx
import StudentSummary from "./_components/StudentSummary";
import ReportList from "./_components/ReportList";
import { getStudentReportViewData } from "@/services/studentReports";

export const metadata = {
    title: "학생 보고서 조회 | 강쌤과외",
    description: "학생별 수업 일지와 누적 수업 완료 횟수를 확인합니다.",
};

interface PageProps {
    searchParams: Promise<{ studentId?: string }>;
}

export default async function StudentReportReadPage({ searchParams }: PageProps) {
    const { studentId } = await searchParams;

    // 서버 함수를 통해 비즈니스 데이터 일괄 호출
    const { students, currentStudent, reports, totalCompletedCount } =
        await getStudentReportViewData(studentId);

    return (
        <div className="max-w-4xl mx-auto px-6 py-10">
            <div className="mb-6">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-1">
                    학생 보고서 조회
                </h2>
                <p className="text-sm text-gray-500">
                    선택한 수강생의 일자별 수업 일지와 누적 수업 완료 횟수를 확인합니다.
                </p>
            </div>

            {/* 학생 정보 및 누적 완료 횟수 */}
            <StudentSummary
                students={students}
                currentStudent={currentStudent}
                totalCompletedCount={totalCompletedCount}
            />

            {/* 보고서 목록 */}
            <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-gray-900">
                        수업 일지 목록 ({reports.length}건)
                    </h3>
                    <span className="text-xs text-gray-500">
                        * 보충 및 온택트 수업은 완료 횟수에 포함되지 않습니다.
                    </span>
                </div>
                <ReportList reports={reports} />
            </div>
        </div>
    );
}