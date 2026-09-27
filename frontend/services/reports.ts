import { LessonWithDetails, Teacher } from "@/types/db";
import { createAdminClient } from "@/utils/supabase/server";

// ==============================================================================
// 1. MOCK DATA (데이터 구조 참고용 및 Fallback)
// ==============================================================================
export const MOCK_TEACHERS: Teacher[] = [
    { id: "101", name: "김선생", phone: "010-1111-2222", is_ontact: false },
    { id: "102", name: "이선생", phone: "010-3333-4444", is_ontact: false },
    { id: "103", name: "박선생", phone: "010-5555-6666", is_ontact: true },
];

export const MOCK_LESSONS: LessonWithDetails[] = [
    {
        id: "201",
        student_id: "301",
        main_teacher_id: "101",
        student: { id: "301", name: "이지은", phone: "010-7777-8888" },
        main_teacher: { id: "101", name: "김선생", phone: "010-1111-2222", is_ontact: false },
        supplementary_teachers: [
            { id: "102", name: "이선생", phone: "010-3333-4444", is_ontact: false },
        ],
    },
    {
        id: "202",
        student_id: "302",
        main_teacher_id: "101",
        student: { id: "302", name: "박보검", phone: "010-9999-0000" },
        main_teacher: { id: "101", name: "김선생", phone: "010-1111-2222", is_ontact: false },
        supplementary_teachers: [],
    },
    {
        id: "203",
        student_id: "303",
        main_teacher_id: "102",
        student: { id: "303", name: "정해인", phone: "010-1234-5678" },
        main_teacher: { id: "102", name: "이선생", phone: "010-3333-4444", is_ontact: false },
        supplementary_teachers: [
            { id: "101", name: "김선생", phone: "010-1111-2222", is_ontact: false },
        ],
    },
];

// ==============================================================================
// 2. Supabase DB 조회 로직 (createAdminClient)
// ==============================================================================
export async function getReportFormData(): Promise<{
    teachers: Teacher[];
    lessons: LessonWithDetails[];
}> {
    try {
        const supabase = createAdminClient();

        // 4개 테이블 병렬 조회 (외래키 경로 오류 원천 방지)
        const [
            { data: teachers, error: tErr },
            { data: students, error: sErr },
            { data: lessonsRaw, error: lErr },
            { data: supMappings, error: smErr },
        ] = await Promise.all([
            supabase.from("teachers").select("id, name, phone, is_ontact").order("name"),
            supabase.from("students").select("id, name, phone"),
            supabase.from("lessons").select("id, student_id, main_teacher_id"),
            supabase.from("lesson_supplementary_teachers").select("lesson_id, teacher_id"),
        ]);

        if (tErr) throw tErr;
        if (sErr) throw sErr;
        if (lErr) throw lErr;
        if (smErr) throw smErr;

        // DB에 데이터가 없으면 MOCK 샘플 반환
        if (!teachers?.length || !lessonsRaw?.length) {
            console.log("DB 데이터가 없어 MOCK 샘플을 반환합니다.");
            return { teachers: MOCK_TEACHERS, lessons: MOCK_LESSONS };
        }

        const teacherMap = new Map((teachers ?? []).map((t) => [t.id, t]));
        const studentMap = new Map((students ?? []).map((s) => [s.id, s]));

        // 보충 선생님 그룹화 매핑
        const supplementaryMap = new Map<string, Teacher[]>();
        (supMappings ?? []).forEach((mapping) => {
            const teacher = teacherMap.get(mapping.teacher_id);
            if (teacher) {
                const list = supplementaryMap.get(mapping.lesson_id) || [];
                list.push(teacher);
                supplementaryMap.set(mapping.lesson_id, list);
            }
        });

        const lessons: LessonWithDetails[] = (lessonsRaw ?? []).map((l) => ({
            id: l.id,
            student_id: l.student_id,
            main_teacher_id: l.main_teacher_id,
            student: studentMap.get(l.student_id)!,
            main_teacher: teacherMap.get(l.main_teacher_id)!,
            supplementary_teachers: supplementaryMap.get(l.id) || [],
        }));

        return { teachers: teachers ?? [], lessons };
    } catch (error) {
        console.error("Supabase 데이터 조회 오류 (MOCK 샘플 대체):", error);
        return {
            teachers: MOCK_TEACHERS,
            lessons: MOCK_LESSONS,
        };
    }
}