'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
    { name: "선생님 보고서 작성", href: "/teacher/reports/new" },
    { name: "학생 보고서 조회", href: "/student/reports/read" },
];

export default function Sidebar() {
    const pathname = usePathname(); // 현재 URL 경로 가져오기

    return (
        <nav className="flex flex-col gap-2 p-4">
            {navItems.map((item) => {
                // 현재 경로와 일치하는지 확인
                const isActive = pathname === item.href;

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                            isActive
                                ? "bg-gray-700 text-white font-semibold"
                                : "text-gray-700 hover:bg-gray-100"
                        }`}
                    >
                        {item.name}
                    </Link>
                );
            })}
        </nav>
    );
}