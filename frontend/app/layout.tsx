import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HRMS Lite",
  description: "Simple Human Resource Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-slate-50 flex flex-col`}>
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/" className="text-2xl font-black text-blue-600 tracking-tighter hover:opacity-80 transition-opacity">
              Management<span className="text-gray-400 font-medium">Hub</span>
            </Link>
            <div className="flex items-center gap-6">
              {/* Navigation cleared as per user request */}
            </div>
          </nav>
        </header>
        <main className="flex-grow max-w-7xl mx-auto px-6 py-12 w-full">
          {children}
        </main>
        <footer className="bg-white border-t border-gray-100 py-8 text-center text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} HRMS Lite System. Built for excellence.
        </footer>
      </body>
    </html>
  );
}
