"use server";

import { revalidatePath } from "next/cache";

export interface CreateReportInput {
    lesson_id: string;
    teacher_id: string;
    lesson_type: string;
    started_at: string;
    ended_at: string;
    report_content: string;
    homework_content?: string;
}

export async function createReportAction(payload: CreateReportInput) {
    if (!payload.lesson_id || !payload.teacher_id) {
        return { success: false, message: "필수 입력 항목이 누락되었습니다." };
    }

    if (new Date(payload.started_at) >= new Date(payload.ended_at)) {
        return { success: false, message: "종료 일시는 시작 일시보다 늦어야 합니다." };
    }

    /*
    // [추후 Supabase 연동 코드]
    import { createClient } from "@/utils/supabase/server";
    const supabase = await createClient();

    const { error } = await supabase.from("reports").insert({
        lesson_id: payload.lesson_id,
        teacher_id: payload.teacher_id,
        lesson_type: payload.lesson_type,
        started_at: new Date(payload.started_at).toISOString(),
        ended_at: new Date(payload.ended_at).toISOString(),
        report_content: payload.report_content,
        homework_content: payload.homework_content || null,
    });

    if (error) {
        return { success: false, message: error.message };
    }
    */

    console.log("[SERVER ACTION] 수업 보고서 저장 완료:", payload);

    // 학생 보고서 조회 및 관련 페이지 캐시 갱신
    revalidatePath("/student/reports/read");

    return { success: true };
}