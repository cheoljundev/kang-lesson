// 1. 기본 테이블 엔티티 (DB Row 단위)

// 학생 정보
export interface Student {
    id: string;
    name: string;
    phone: string;
    created_at?: string;
    updated_at?: string;
}

// 강사 정보
export interface Teacher {
    id: string;
    name: string;
    phone: string;
    is_ontact: boolean;
    created_at?: string;
    updated_at?: string;
}

// 수업 기본 정보
export interface Lesson {
    id: string;
    student_id: string;
    main_teacher_id: string;
    created_at?: string;
    updated_at?: string;
}

// 수업 보고서 기본 정보
export interface Report {
    id: string;
    lesson_id: string;
    teacher_id: string;
    lesson_type: "regular" | "supplementary" | "ontact" | string;
    started_at: string;
    ended_at: string;
    report_content: string;
    homework_content: string | null;
    created_at?: string;
    updated_at?: string;
}


// ----------------------------------------------------
// 2. UI 및 비즈니스 로직 조회를 위한 확장 타입 (Join 결과)
// ----------------------------------------------------

/**
 * 1. 보고서 작성 페이지용: 수업 정보 + 학생 + 주선생님 + [보충선생님 목록]
 * - supplementary_teachers: 해당 수업에 매핑된 보충 선생님 객체 배열
 */
export interface LessonWithDetails extends Lesson {
    student: Student;
    main_teacher: Teacher;
    supplementary_teachers: Teacher[];
}

/**
 * 2. 상세 보고서 정보 (조인 포함)
 */
export interface ReportWithDetails extends Report {
    teacher: Teacher; // 작성한 교사
    lesson: Lesson & {
        student: Student;
        main_teacher: Teacher;
        supplementary_teachers?: Teacher[];
    };
}
