import "./globals.css";
import Sidebar from "@/app/_components/Sidebar";
import Link from "next/link";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
    >
      <body className="min-h-full flex flex-col">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto px-6 py-4">
          <h1 className="text-xl font-bold tracking-tight text-gray-900">
            <Link href="/" className="hover:text-gray-600 transition-colors">
              강쌤과외
            </Link>
          </h1>
        </div>
      </header>
      <div className="lg:flex">
        <aside className="flex-1">
          <Sidebar/>
        </aside>
        <main className="flex-4">
          {children}
        </main>
      </div>
      </body>
    </html>
  );
}
