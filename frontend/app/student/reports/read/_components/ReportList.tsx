"use client";

import { useState, useMemo } from "react";
import { ReportWithDetails } from "@/types/db";

interface ReportListProps {
    reports: ReportWithDetails[];
}

// 수업 유형별 라벨 및 스타일 매핑
const TYPE_CONFIG: Record<string, { label: string; badgeClass: string }> = {
    regular: {
        label: "정규 수업",
        badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
    },
    supplementary: {
        label: "보충 수업",
        badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
    },
    ontact: {
        label: "온택트 수업",
        badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
    },
};

export default function ReportList({ reports }: ReportListProps) {
    const [expandedId, setExpandedId] = useState<string | null>(
        reports.length > 0 ? reports[0].id : null
    );

    const toggleExpand = (id: string) => {
        setExpandedId((prev) => (prev === id ? null : id));
    };

    // 정규 수업만 카운팅하여 각 보고서의 실제 '인정 회차 번호'를 매핑 (과거 -> 최신 순 정렬 기준 카운트)
    const reportRoundMap = useMemo(() => {
        const roundMap = new Map<string, number>();
        let currentRound = 1;

        // 과거부터 시작하여 정규 수업인 경우에만 1씩 증가
        const reversed = [...reports].reverse();
        for (const rep of reversed) {
            const isMainTeacher = rep.lesson?.main_teacher_id === rep.teacher_id;
            if (isMainTeacher && rep.lesson_type === "regular") {
                roundMap.set(rep.id, currentRound++);
            }
        }
        return roundMap;
    }, [reports]);

    const formatDateTimeRange = (startStr: string, endStr: string) => {
        const start = new Date(startStr);
        const end = new Date(endStr);

        const dateStr = start.toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
            weekday: "short",
        });

        const startTimeStr = start.toLocaleTimeString("ko-KR", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });

        const endTimeStr = end.toLocaleTimeString("ko-KR", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });

        return `${dateStr} · ${startTimeStr} ~ ${endTimeStr}`;
    };

    if (reports.length === 0) {
        return (
            <div className="text-center py-16 bg-white border border-gray-200 rounded-xl">
                <p className="text-gray-500 text-sm">아직 등록된 수업 보고서가 없습니다.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {reports.map((report) => {
                const isExpanded = expandedId === report.id;
                const roundNumber = reportRoundMap.get(report.id);
                const typeInfo = TYPE_CONFIG[report.lesson_type] || {
                    label: report.lesson_type,
                    badgeClass: "bg-gray-100 text-gray-700 border-gray-200",
                };

                // 작성 선생님의 역할 식별
                const isMain = report.lesson?.main_teacher_id === report.teacher_id;
                const teacherRoleBadge = report.teacher?.is_ontact
                    ? "(온택트)"
                    : isMain
                        ? "(주선생님)"
                        : "(보충선생님)";

                return (
                    <div
                        key={report.id}
                        className="border border-gray-200 rounded-xl bg-white overflow-hidden transition-all shadow-sm"
                    >
                        {/* 카드 헤더 */}
                        <button
                            type="button"
                            onClick={() => toggleExpand(report.id)}
                            className="w-full text-left p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/70 transition-colors"
                        >
                            <div className="space-y-2">
                                <div className="flex flex-wrap items-center gap-2">
                                    {/* 정규 수업인 경우 정규 N회차 표시, 보충/온택트는 배지만 표시 */}
                                    {roundNumber ? (
                                        <span className="px-2.5 py-0.5 text-xs font-bold bg-gray-900 text-white rounded-md">
                                            정규 {roundNumber}회차
                                        </span>
                                    ) : (
                                        <span className="px-2.5 py-0.5 text-xs font-medium bg-gray-200 text-gray-700 rounded-md">
                                            추가 수업
                                        </span>
                                    )}

                                    <span
                                        className={`px-2 py-0.5 text-xs font-medium rounded border ${typeInfo.badgeClass}`}
                                    >
                                        {typeInfo.label}
                                    </span>

                                    <span className="text-xs text-gray-500 font-medium">
                                        작성: {report.teacher?.name} {teacherRoleBadge}
                                    </span>
                                </div>

                                <h4 className="text-base font-bold text-gray-900">
                                    {formatDateTimeRange(report.started_at, report.ended_at)}
                                </h4>
                            </div>

                            <div className="text-xs font-semibold text-gray-400 self-end sm:self-center flex items-center gap-1.5 pt-1 sm:pt-0">
                                <span>{isExpanded ? "접기" : "내용 보기"}</span>
                                <span className="text-xs">{isExpanded ? "▲" : "▼"}</span>
                            </div>
                        </button>

                        {/* 카드 본문 */}
                        {isExpanded && (
                            <div className="border-t border-gray-100 p-5 sm:p-6 bg-gray-50/40 space-y-4">
                                <div>
                                    <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                        수업 내용 및 피드백
                                    </h5>
                                    <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap bg-white p-4 rounded-lg border border-gray-200 shadow-none">
                                        {report.report_content}
                                    </p>
                                </div>

                                {report.homework_content && (
                                    <div>
                                        <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                            숙제 및 전달 사항
                                        </h5>
                                        <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap bg-white p-4 rounded-lg border border-gray-200 shadow-none">
                                            {report.homework_content}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}