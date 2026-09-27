"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { LessonWithDetails, Teacher } from "@/types/db";
import { createReportAction } from "../actions";

interface ReportFormProps {
    lessons: LessonWithDetails[];
    teachers: Teacher[];
}

const LESSON_TYPES = [
    { value: "regular", label: "정규 수업 (완료 1회 인정)" },
    { value: "supplementary", label: "보충 수업 (완료 0회)" },
    { value: "ontact", label: "온택트 수업 (완료 0회)" },
];

export default function ReportForm({ lessons, teachers }: ReportFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        lesson_id: "",
        teacher_id: "",
        started_at: "",
        ended_at: "",
        report_content: "",
        homework_content: "",
    });

    // 1. 현재 선택된 수업
    const selectedLesson = useMemo(() => {
        return lessons.find((l) => l.id === formData.lesson_id);
    }, [lessons, formData.lesson_id]);

    // 2. 작성 가능한 선생님 목록 필터링
    const availableTeachers = useMemo(() => {
        if (!selectedLesson) {
            return teachers.filter((t) => t.is_ontact);
        }

        const supplementaryTeacherIds = new Set(
            (selectedLesson.supplementary_teachers || []).map((t) => t.id)
        );

        return teachers.filter((t) => {
            const isMain = t.id === selectedLesson.main_teacher_id;
            const isSupplementary = supplementaryTeacherIds.has(t.id);
            const isOntact = t.is_ontact;
            return isMain || isSupplementary || isOntact;
        });
    }, [teachers, selectedLesson]);

    // 3. 선택된 선생님의 역할에 따라 수업 종류 자동 결정
    const currentLessonType: "regular" | "supplementary" | "ontact" = useMemo(() => {
        if (!selectedLesson || !formData.teacher_id) return "regular";

        const currentTeacher = teachers.find((t) => t.id === formData.teacher_id);
        if (currentTeacher?.is_ontact) return "ontact";
        if (formData.teacher_id === selectedLesson.main_teacher_id) return "regular";
        return "supplementary";
    }, [selectedLesson, formData.teacher_id, teachers]);

    // 수업 선택 변경 시
    const handleLessonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const nextLessonId = e.target.value;
        const targetLesson = lessons.find((l) => l.id === nextLessonId);

        setFormData((prev) => ({
            ...prev,
            lesson_id: nextLessonId,
            teacher_id: targetLesson ? targetLesson.main_teacher_id : "",
        }));
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // 제출 핸들러 (React 19 native action)
    const handleSubmit = async () => {
        if (!formData.lesson_id) {
            alert("수업을 선택해주세요.");
            return;
        }
        if (!formData.teacher_id) {
            alert("작성 선생님을 선택해주세요.");
            return;
        }
        if (!formData.started_at || !formData.ended_at) {
            alert("수업 시작 및 종료 시간을 입력해주세요.");
            return;
        }
        if (new Date(formData.started_at) >= new Date(formData.ended_at)) {
            alert("종료 일시는 시작 일시보다 이후여야 합니다.");
            return;
        }

        try {
            setIsSubmitting(true);

            // 자동으로 판별된 lesson_type을 페이로드에 결합하여 전송
            const payload = {
                ...formData,
                lesson_type: currentLessonType,
            };

            const res = await createReportAction(payload);

            if (!res.success) {
                alert(res.message || "보고서 저장 중 오류가 발생했습니다.");
                return;
            }

            alert("보고서가 정상적으로 등록되었습니다.");
            router.push("/student/reports/read");
            router.refresh();
        } catch (error) {
            console.error(error);
            alert("네트워크 통신 중 오류가 발생했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form action={handleSubmit} className="space-y-6">
            {/* 1. 수업 선택 */}
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
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-gray-900 outline-none"
                >
                    <option value="">수업을 선택하세요</option>
                    {lessons.map((lesson) => (
                        <option key={lesson.id} value={lesson.id}>
                            {lesson.student.name} 학생 (주 담당: {lesson.main_teacher.name})
                        </option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 2. 작성 강사 선택 */}
                <div>
                    <label htmlFor="teacher_id" className="block text-sm font-semibold text-gray-900 mb-1.5">
                        작성 선생님 <span className="text-red-500">*</span>
                    </label>
                    <select
                        id="teacher_id"
                        name="teacher_id"
                        value={formData.teacher_id}
                        onChange={handleChange}
                        disabled={!formData.lesson_id}
                        required
                        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-gray-900 outline-none disabled:bg-gray-100 disabled:text-gray-400"
                    >
                        {!formData.lesson_id ? (
                            <option value="">수업을 먼저 선택해주세요</option>
                        ) : (
                            availableTeachers.map((teacher) => {
                                let badge = "";
                                if (teacher.id === selectedLesson?.main_teacher_id) {
                                    badge = "(주선생님)";
                                } else if (teacher.is_ontact) {
                                    badge = "(온택트)";
                                } else {
                                    badge = "(보충선생님)";
                                }

                                return (
                                    <option key={teacher.id} value={teacher.id}>
                                        {teacher.name} {badge}
                                    </option>
                                );
                            })
                        )}
                    </select>
                </div>

                {/* 3. 수업 종류 (선생님 선택에 따라 고정되는 Readonly Select) */}
                <div>
                    <label htmlFor="lesson_type" className="block text-sm font-semibold text-gray-900 mb-1.5">
                        수업 종류 <span className="text-xs text-gray-500 font-normal">(선생님 유형에 따라 자동 고정)</span>
                    </label>
                    <select
                        id="lesson_type"
                        value={currentLessonType}
                        disabled
                        tabIndex={-1}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-gray-100 text-gray-700 text-sm cursor-not-allowed select-none outline-none"
                    >
                        {LESSON_TYPES.map((type) => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </select>
                    {/* disabled 필드는 네이티브 폼 데이터 수집에서 제외되므로 hidden input으로 보장 */}
                    <input type="hidden" name="lesson_type" value={currentLessonType} />
                </div>
            </div>

            {/* 4. 수업 일시 */}
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
                        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-gray-900 outline-none"
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
                        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-gray-900 outline-none"
                    />
                </div>
            </div>

            {/* 5. 보고서 본문 */}
            <div>
                <label htmlFor="report_content" className="block text-sm font-semibold text-gray-900 mb-1.5">
                    보고서 내용 (수업 피드백) <span className="text-red-500">*</span>
                </label>
                <textarea
                    id="report_content"
                    name="report_content"
                    rows={5}
                    value={formData.report_content}
                    onChange={handleChange}
                    required
                    placeholder="오늘 진행된 수업 내용과 피드백을 작성해주세요."
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-gray-900 outline-none resize-y"
                />
            </div>

            {/* 6. 과제 내용 */}
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
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-gray-900 outline-none resize-y"
                />
            </div>

            <div className="flex justify-end gap-3 pt-2">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                    취소
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 transition-colors"
                >
                    {isSubmitting ? "저장 중..." : "보고서 저장"}
                </button>
            </div>
        </form>
    );
}