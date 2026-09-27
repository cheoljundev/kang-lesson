"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/utils/supabase/server";

export interface CreateReportInput {
    lesson_id: string;
    teacher_id: string;
    lesson_type: "regular" | "supplementary" | "ontact" | string;
    started_at: string;
    ended_at: string;
    report_content: string;
    homework_content?: string;
}

export async function createReportAction(payload: CreateReportInput) {
    // 1. 필수 입력값 검증
    if (!payload.lesson_id || !payload.teacher_id) {
        return { success: false, message: "수업과 작성 선생님을 반드시 선택해주세요." };
    }

    if (!payload.started_at || !payload.ended_at) {
        return { success: false, message: "수업 시작 일시와 종료 일시를 입력해주세요." };
    }

    // 2. 수업 시간 유효성 검증
    const startDate = new Date(payload.started_at);
    const endDate = new Date(payload.ended_at);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return { success: false, message: "올바른 날짜 형식이 아닙니다." };
    }

    if (startDate >= endDate) {
        return { success: false, message: "종료 일시는 시작 일시보다 늦어야 합니다." };
    }

    try {
        // 3. 서버 전용 관리자 클라이언트(Service Role)로 RLS 우회하여 insert
        const supabase = createAdminClient();

        const { error } = await supabase.from("reports").insert({
            lesson_id: payload.lesson_id,
            teacher_id: payload.teacher_id,
            lesson_type: payload.lesson_type,
            started_at: startDate.toISOString(),
            ended_at: endDate.toISOString(),
            report_content: payload.report_content,
            homework_content: payload.homework_content || null,
        });

        if (error) {
            console.error("[Supabase Insert Error]:", error);
            return { success: false, message: `DB 저장 오류: ${error.message}` };
        }

        console.log("[SERVER ACTION] 수업 보고서 저장 완료:", payload);

        // 4. 학생 보고서 목록 페이지 캐시 갱신
        revalidatePath("/student/reports/read");

        return { success: true };
    } catch (err: any) {
        console.error("[createReportAction Exception]:", err);
        return {
            success: false,
            message: err.message || "서버 내부 처리 중 오류가 발생했습니다.",
        };
    }
}