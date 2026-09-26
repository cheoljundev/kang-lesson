"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Student } from "@/types/db";

interface StudentSummaryProps {
    students: Student[];
    currentStudent: Student;
    totalCompletedCount: number;
}

export default function StudentSummary({
                                           students,
                                           currentStudent,
                                           totalCompletedCount,
                                       }: StudentSummaryProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleStudentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedId = e.target.value;
        const params = new URLSearchParams(searchParams.toString());
        params.set("studentId", selectedId);
        router.push(`?${params.toString()}`);
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-5">
            {/* 학생 선택 */}
            <div className="space-y-2">
                <label
                    htmlFor="student-select"
                    className="block text-xs font-semibold text-gray-500 uppercase tracking-wide"
                >
                    수강생 선택
                </label>
                <select
                    id="student-select"
                    value={currentStudent.id}
                    onChange={handleStudentChange}
                    className="font-bold text-gray-900 bg-gray-50 border border-gray-300 rounded-lg px-3.5 py-2 text-base focus:outline-none focus:ring-2 focus:ring-gray-900 cursor-pointer"
                >
                    {students.map((student) => (
                        <option key={student.id} value={student.id}>
                            {student.name} 학생 (연락처: {student.phone})
                        </option>
                    ))}
                </select>
            </div>

            {/* 누적 수업 완료 횟수 (스키마 연동 결과) */}
            <div className="bg-gray-50 border border-gray-100 rounded-xl px-6 py-3.5 flex items-center justify-between md:justify-start gap-5">
                <span className="text-sm font-medium text-gray-600">누적 완료 수업</span>
                <div className="flex items-baseline gap-1">
          <span className="text-3xl font-black text-gray-900">
            {totalCompletedCount}
          </span>
                    <span className="text-xs font-bold text-gray-500">회차</span>
                </div>
            </div>
        </div>
    );
}