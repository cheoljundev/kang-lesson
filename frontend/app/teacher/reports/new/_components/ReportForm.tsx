"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LessonWithDetails, Teacher } from "@/types/db";

interface ReportFormProps {
    lessons: LessonWithDetails[];
    teachers: Teacher[];
}

const LESSON_TYPES = ["정규 수업", "보충 수업", "시험 대비 특강", "시범 수업"];

export default function ReportForm({ lessons, teachers }: ReportFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // DB 컬럼에 맞춘 폼 상태
    const [formData, setFormData] = useState({
        lesson_id: "",
        teacher_id: teachers?.[0]?.id ?? "",
        lesson_type: LESSON_TYPES[0],
        started_at: "",
        ended_at: "",
        report_content: "",
        homework_content: "",
    });

    // 수업 선택 시, 해당 수업의 main_teacher를 작성 교사 기본값으로 자동 동기화
    const handleLessonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedLessonId = e.target.value;
        const selectedLesson = lessons.find((l) => l.id === selectedLessonId);

        setFormData((prev) => ({
            ...prev,
            lesson_id: selectedLessonId,
            teacher_id: selectedLesson ? selectedLesson.main_teacher_id : prev.teacher_id,
        }));
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.lesson_id) {
            alert("수업을 선택해주세요.");
            return;
        }
        if (formData.started_at >= formData.ended_at) {
            alert("종료 시간은 시작 시간보다 이후여야 합니다.");
            return;
        }

        try {
            setIsSubmitting(true);

            // TODO: Server Action 호출 또는 POST /api/reports
            // const res = await createReport(formData);
            console.log("DB Insert Payload:", formData);

            alert("보고서가 저장되었습니다.");
            router.push("/student/reports/read");
        } catch (error) {
            console.error(error);
            alert("저장 실패");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* 수업 선택 (Lesson - Student 매핑) */}
            <div>
                <label htmlFor="lesson_id" className="block text-sm font-semibold text-gray-900 mb-1.5">
                    수업 선택 <span className="text-red-500">*</span>
                </label>
                <select
                    id="lesson_id"
                    name="lesson_id"
                    value={formData.lesson_id}
                    onChange={handleLessonChange}
                    required
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-gray-900"
                >
                    <option value="">수업을 선택하세요</option>
                    {lessons.map((lesson) => (
                        <option key={lesson.id} value={lesson.id}>
                            {lesson.student.name} 학생 (담당: {lesson.main_teacher.name})
                        </option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 작성 강사 선택 */}
                <div>
                    <label htmlFor="teacher_id" className="block text-sm font-semibold text-gray-900 mb-1.5">
                        작성 선생님 <span className="text-red-500">*</span>
                    </label>
                    <select
                        id="teacher_id"
                        name="teacher_id"
                        value={formData.teacher_id}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-gray-900"
                    >
                        {teachers.map((teacher) => (
                            <option key={teacher.id} value={teacher.id}>
                                {teacher.name} {teacher.is_ontact ? "(온택트)" : ""}
                            </option>
                        ))}
                    </select>
                </div>

                {/* 수업 유형 */}
                <div>
                    <label htmlFor="lesson_type" className="block text-sm font-semibold text-gray-900 mb-1.5">
                        수업 종류 <span className="text-red-500">*</span>
                    </label>
                    <select
                        id="lesson_type"
                        name="lesson_type"
                        value={formData.lesson_type}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-gray-900"
                    >
                        {LESSON_TYPES.map((type) => (
                            <option key={type} value={type}>
                                {type}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* 수업 시작 / 종료 시간 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="started_at" className="block text-sm font-semibold text-gray-900 mb-1.5">
                        시작 일시 <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="datetime-local"
                        id="started_at"
                        name="started_at"
                        value={formData.started_at}
                        onChange={handleChange}
                        required
                        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-gray-900"
                    />
                </div>
                <div>
                    <label htmlFor="ended_at" className="block text-sm font-semibold text-gray-900 mb-1.5">
                        종료 일시 <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="datetime-local"
                        id="ended_at"
                        name="ended_at"
                        value={formData.ended_at}
                        onChange={handleChange}
                        required
                        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-gray-900"
                    />
                </div>
            </div>

            {/* 보고서 내용 */}
            <div>
                <label htmlFor="report_content" className="block text-sm font-semibold text-gray-900 mb-1.5">
                    보고서 내용 (수업 내용 및 피드백) <span className="text-red-500">*</span>
                </label>
                <textarea
                    id="report_content"
                    name="report_content"
                    rows={5}
                    value={formData.report_content}
                    onChange={handleChange}
                    required
                    placeholder="오늘 진행된 수업 내용과 피드백을 작성해주세요."
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-gray-900 resize-y"
                />
            </div>

            {/* 과제 내용 */}
            <div>
                <label htmlFor="homework_content" className="block text-sm font-semibold text-gray-900 mb-1.5">
                    숙제 및 전달 사항
                </label>
                <textarea
                    id="homework_content"
                    name="homework_content"
                    rows={3}
                    value={formData.homework_content}
                    onChange={handleChange}
                    placeholder="다음 시간까지 완료해야 할 숙제를 입력해주세요."
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-gray-900 resize-y"
                />
            </div>

            <div className="flex justify-end gap-3 pt-2">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                    취소
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 disabled:opacity-50"
                >
                    {isSubmitting ? "저장 중..." : "보고서 저장"}
                </button>
            </div>
        </form>
    );
}