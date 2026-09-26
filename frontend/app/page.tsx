import Link from "next/link";

export const metadata = {
  title: "강쌤과외",
  description: "강쌤과외 홈페이지",
};

export default function HomePage() {
  return (
      <div className="mx-auto px-6 py-16">
        {/* 안내 문구 영역 */}
        <section className="text-center mb-12">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-3">
            수업 보고서 시스템
          </h2>
          <p className="text-base text-gray-600 leading-relaxed max-w-xl mx-auto">
            강쌤과외에서는 수업 종료 후 선생님이 수업 보고서를 작성하고,
            <br className="hidden sm:inline" />
            학생은 작성된 보고서를 열람할 수 있는 시스템을 운영합니다.
          </p>
        </section>

        {/* 역할별 바로가기 카드 */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 선생님: 보고서 작성 */}
          <div className="border border-gray-200 rounded-xl p-8 bg-white flex flex-col justify-between hover:border-gray-400 transition-colors">
            <div>
            <span className="inline-block px-2.5 py-1 text-xs font-semibold bg-gray-100 text-gray-700 rounded mb-4">
              선생님용
            </span>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                선생님 보고서 작성
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-6">
                수업 종료 후 진도 현황, 과제 수행도, 학생 피드백을 기록합니다.
              </p>
            </div>
            <Link
                href="/teacher/reports/new"
                className="w-full text-center py-3 px-4 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors"
            >
              보고서 작성하기
            </Link>
          </div>

          {/* 학생: 보고서 조회 */}
          <div className="border border-gray-200 rounded-xl p-8 bg-white flex flex-col justify-between hover:border-gray-400 transition-colors">
            <div>
            <span className="inline-block px-2.5 py-1 text-xs font-semibold bg-gray-100 text-gray-700 rounded mb-4">
              학생용
            </span>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                학생 보고서 조회
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-6">
                선생님이 등록한 수업 일자별 리포트와 피드백을 확인합니다.
              </p>
            </div>
            <Link
                href="/student/reports/read"
                className="w-full text-center py-3 px-4 rounded-lg border border-gray-300 text-gray-800 text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              보고서 조회하기
            </Link>
          </div>
        </section>
      </div>
  );
}