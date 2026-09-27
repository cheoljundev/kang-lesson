import { LessonWithDetails, Teacher } from "@/types/db";

const MOCK_TEACHERS: Teacher[] = [
    { id: "101", name: "김선생", phone: "010-1111-2222", is_ontact: false },
    { id: "102", name: "이선생", phone: "010-3333-4444", is_ontact: false },
    { id: "103", name: "박선생", phone: "010-5555-6666", is_ontact: true },
];

const MOCK_LESSONS: LessonWithDetails[] = [
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

export async function getReportFormData(): Promise<{
    teachers: Teacher[];
    lessons: LessonWithDetails[];
}> {
    /*
    // [추후 Supabase 연동 코드]
    import { createClient } from "@/utils/supabase/server";
    const supabase = await createClient();

    const [{ data: teachers }, { data: lessons }] = await Promise.all([
        supabase.from("teachers").select("*").order("name"),
        supabase.from("lessons").select(`
            id,
            student_id,
            main_teacher_id,
            student:students(*),
            main_teacher:teachers!main_teacher_id(*),
            supplementary_teachers:teachers!lesson_supplementary_teachers(*)
        `),
    ]);

    return {
        teachers: (teachers as Teacher[]) ?? [],
        lessons: (lessons as unknown as LessonWithDetails[]) ?? [],
    };
    */

    return {
        teachers: MOCK_TEACHERS,
        lessons: MOCK_LESSONS,
    };
}