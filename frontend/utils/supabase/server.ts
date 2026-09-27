import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

/**
 * 1. 서버 백엔드 전용 관리자 클라이언트 (Service Role Key 기반)
 * RLS(Row Level Security)를 우회하여 서버 컴포넌트, 서버 액션에서 안전하게 DB를 제어합니다.
 */
export function createAdminClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error(
            "Supabase 환경 변수가 누락되었습니다. .env.local에 NEXT_PUBLIC_SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY를 설정해주세요."
        );
    }

    return createSupabaseClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
    });
}

/**
 * 2. 일반 서버 클라이언트 (쿠키 세션 기반 / 익명 키)
 * 필요 시 사용자 세션 쿠키를 처리할 때 사용합니다.
 * 현재로써는 로그인이 없으므로 사용하지 않음.
 */
export async function createClient() {
    const cookieStore = await cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // 서버 컴포넌트 환경에서의 set 에러 방지
                    }
                },
            },
        }
    );
}