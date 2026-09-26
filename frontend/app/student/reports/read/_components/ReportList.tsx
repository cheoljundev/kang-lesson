"use client";

import { useState } from "react";
import { ReportWithDetails } from "@/types/db";

interface ReportListProps {
    reports: ReportWithDetails[];
}

export default function ReportList({ reports }: ReportListProps) {
    const [expandedId, setExpandedId] = useState<string | null>(
        reports.length > 0 ? reports[0].id : null
    );

    const toggleExpand = (id: string) => {
        setExpandedId((prev) => (prev === id ? null : id));
    };

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
            {reports.map((report, index) => {
                const isExpanded = expandedId === report.id;
                const roundNumber = reports.length - index; // 최신순 기준 회차 번호

                return (
                    <div
                        key={report.id}
                        className="border border-gray-200 rounded-xl bg-white overflow-hidden transition-colors"
                    >
                        {/* 카드 헤더 */}
                        <button
                            type="button"
                            onClick={() => toggleExpand(report.id)}
                            className="w-full text-left p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/50 transition-colors"
                        >
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-xs font-semibold bg-gray-900 text-white rounded">
                    {roundNumber}회차
                  </span>
                                    <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded border border-gray-200">
                    {report.lesson_type}
                  </span>
                                    <span className="text-xs text-gray-500 font-medium">
                    작성 강사: {report.teacher?.name} {report.teacher?.is_ontact ? "(온택트)" : ""}
                  </span>
                                </div>
                                <h4 className="text-base font-bold text-gray-900">
                                    {formatDateTimeRange(report.started_at, report.ended_at)}
                                </h4>
                            </div>

                            <div className="text-xs font-semibold text-gray-400 self-end sm:self-center flex items-center gap-1">
                                <span>{isExpanded ? "접기" : "내용 보기"}</span>
                                <span className="text-sm">{isExpanded ? "▲" : "▼"}</span>
                            </div>
                        </button>

                        {/* 카드 본문 (보고서 및 과제 내용) */}
                        {isExpanded && (
                            <div className="border-t border-gray-100 p-5 sm:p-6 bg-gray-50/30 space-y-5">
                                <div>
                                    <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                        수업 내용 및 피드백
                                    </h5>
                                    <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap bg-white p-4 rounded-lg border border-gray-200">
                                        {report.report_content}
                                    </p>
                                </div>

                                {report.homework_content && (
                                    <div>
                                        <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                            숙제 및 전달 사항
                                        </h5>
                                        <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap bg-white p-4 rounded-lg border border-gray-200">
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