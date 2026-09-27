import ReportForm from "./_components/ReportForm";
import { getReportFormData } from "@/services/reports";

export const metadata = {
    title: "선생님 보고서 작성 | 강쌤과외",
    description: "수업 종료 후 작성하는 수업 결과 보고서입니다.",
};

export default async function NewReportPage() {
    const { teachers, lessons } = await getReportFormData();

    return (
        <div className="max-w-3xl mx-auto px-6 py-10">
            <div className="mb-8">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-1">
                    선생님 보고서 작성
                </h2>
                <p className="text-sm text-gray-500">
                    수업 진행 내용과 학생 숙제를 빠짐없이 입력해주세요.
                </p>
            </div>

            <div className="border border-gray-200 rounded-xl p-6 sm:p-8 bg-white shadow-sm">
                <ReportForm lessons={lessons} teachers={teachers} />
            </div>
        </div>
    );
}