// 학생 정보
export interface Student {
    id: string;
    name: string;
    phone: string;
}

// 강사 정보
export interface Teacher {
    id: string;
    name: string;
    phone: string;
    is_ontact: boolean;
}

// 수업 정보 (Student와 Teacher를 연결)
export interface Lesson {
    id: string;
    student_id: string;
    main_teacher_id: string;
}

// 보고서 정보 (DB 컬럼 일치) + 조인된 강사 정보 및 수업 정보
export interface ReportWithDetails {
    id: string;
    lesson_id: string;
    teacher_id: string;
    lesson_type: string;
    started_at: string;
    ended_at: string;
    report_content: string;
    homework_content: string;
    teacher: Teacher;     // 작성한 선생님 정보 (Join)
    lesson: {
        student_id: string;
    };
}

// ----------------------------------------------------
// UI 조회를 위한 확장 타입 (Join 결과)
// ----------------------------------------------------

// 1. 보고서 작성 페이지용: '수업' 선택 드롭다운 목록 아이템
export interface LessonWithDetails extends Lesson {
    student: Student;
    main_teacher: Teacher;
}

// 2. 학생 보고서 조회 페이지용: 보고서 + 작성 강사 정보
export interface ReportWithTeacher extends Report {
    teacher: Teacher;
}